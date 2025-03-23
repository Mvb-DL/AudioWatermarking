from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import librosa
import numpy as np
from scipy.integrate import simpson
import io

app = FastAPI()

# CORS-Middleware hinzufügen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Parameter
N_SEGMENTS = 100
X_MIN, X_MAX = 0, 2000  # Frequenzbereich in Hz

# Segment-Node-Klasse
class SegmentNode:
    def __init__(self, index, seg_start, seg_end, usage_percent, actual_area):
        self.index = index
        self.seg_start = seg_start
        self.seg_end = seg_end
        self.usage_percent = usage_percent
        self.actual_area = actual_area
        self.prev = None
        self.next = None

    def to_dict(self):
        return {
            "index": self.index,
            "seg_start": self.seg_start,
            "seg_end": self.seg_end,
            "usage_percent": self.usage_percent,
            "actual_area": self.actual_area,
            "prev": self.prev.index if self.prev else None,
            "next": self.next.index if self.next else None,
        }

def create_segment_linked_list(audio_bytes: bytes, n_segments, x_min=X_MIN, x_max=X_MAX):
    y, sr = librosa.load(io.BytesIO(audio_bytes), sr=None)
    fft_result = np.fft.rfft(y)
    fft_magnitude = np.abs(fft_result)
    frequencies = np.fft.rfftfreq(len(y), 1 / sr)

    box_width = (x_max - x_min) / n_segments
    max_amplitude = np.max(fft_magnitude)
    ideal_area = box_width * max_amplitude

    head = None
    prev_node = None
    nodes = []

    for i in range(n_segments):
        seg_start = x_min + i * box_width
        seg_end = seg_start + box_width
        start_idx = np.searchsorted(frequencies, seg_start, side="left")
        end_idx = np.searchsorted(frequencies, seg_end, side="left")
        if end_idx > start_idx:
            actual_area = simpson(
                y=fft_magnitude[start_idx:end_idx], x=frequencies[start_idx:end_idx]
            )
        else:
            actual_area = 0

        usage_percent = (actual_area / ideal_area) * 100 if ideal_area != 0 else 0

        node = SegmentNode(
            index=i,
            seg_start=seg_start,
            seg_end=seg_end,
            usage_percent=usage_percent,
            actual_area=actual_area,
        )
        if prev_node is not None:
            prev_node.next = node
            node.prev = prev_node
        else:
            head = node
        prev_node = node
        nodes.append(node)

    return head, nodes

@app.post("/fingerprint")
async def fingerprint_data(audio_file: UploadFile = File(...)):
    try:
        if not audio_file:
            raise HTTPException(status_code=400, detail="Keine Datei erhalten")

        audio_bytes = await audio_file.read()
        _, nodes = create_segment_linked_list(audio_bytes, N_SEGMENTS, X_MIN, X_MAX)

        segments_json = [node.to_dict() for node in nodes]

        return JSONResponse(content={"segments": segments_json})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/compare")
async def compare_data(audio1: UploadFile = File(...), audio2: UploadFile = File(...)):
    try:
        audio_bytes1 = await audio1.read()
        audio_bytes2 = await audio2.read()

        _, nodes1 = create_segment_linked_list(audio_bytes1, N_SEGMENTS, X_MIN, X_MAX)
        _, nodes2 = create_segment_linked_list(audio_bytes2, N_SEGMENTS, X_MIN, X_MAX)

        segments1 = [node.to_dict() for node in nodes1]
        segments2 = [node.to_dict() for node in nodes2]

        return JSONResponse(content={
            "segments_audio1": segments1,
            "segments_audio2": segments2
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=18080)
