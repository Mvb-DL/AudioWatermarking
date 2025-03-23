from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import librosa
import numpy as np
from scipy.integrate import simpson
import io
import json

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
N_SEGMENTS = 100          # Für den /fingerprint Endpunkt
N_SEGMENTS_COMPARE = 100   # Für den /compare Endpunkt
X_MIN, X_MAX = 0, 2000     # Frequenzbereich in Hz

# Segment-Node-Klasse (wird in beiden Endpunkten verwendet)
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

def create_segment_linked_list(audio_input, n_segments, x_min=X_MIN, x_max=X_MAX, global_max_amp=None):
    # audio_input (z.B. io.BytesIO) wird mittels librosa geladen
    y, sr = librosa.load(audio_input, sr=None)
    fft_result = np.fft.rfft(y)
    fft_magnitude = np.abs(fft_result)
    frequencies = np.fft.rfftfreq(len(y), 1 / sr)
    
    box_width = (x_max - x_min) / n_segments
    if global_max_amp is None:
        max_amplitude = np.max(fft_magnitude)
    else:
        max_amplitude = global_max_amp
    ideal_area = box_width * max_amplitude
    
    head = None
    prev_node = None
    nodes = []
    
    for i in range(n_segments):
        seg_start = x_min + i * box_width
        seg_end = seg_start + box_width
        
        start_idx = np.searchsorted(frequencies, seg_start, side='left')
        end_idx = np.searchsorted(frequencies, seg_end, side='left')
        if end_idx > start_idx:
            actual_area = simpson(fft_magnitude[start_idx:end_idx], x=frequencies[start_idx:end_idx])
        else:
            actual_area = 0
        
        usage_percent = (actual_area / ideal_area) * 100 if ideal_area != 0 else 0
        
        node = SegmentNode(index=i, seg_start=seg_start, seg_end=seg_end,
                           usage_percent=usage_percent, actual_area=actual_area)
        if prev_node is not None:
            prev_node.next = node
            node.prev = prev_node
        else:
            head = node
        prev_node = node
        nodes.append(node)
    
    return head, nodes

def compute_deviations_and_weights(fingerprint1, fingerprint2):
    """
    Berechnet pro Segment die absolute Differenz der usage_percent beider Audiofiles
    und ermittelt als Gewicht den Durchschnitt der tatsächlichen Flächen.
    """
    deviations = []
    weights = []
    for seg1, seg2 in zip(fingerprint1, fingerprint2):
        deviation = abs(seg1["usage_percent"] - seg2["usage_percent"])
        weight = (seg1["actual_area"] + seg2["actual_area"]) / 2
        deviations.append(deviation)
        weights.append(weight)
    return np.array(deviations), np.array(weights)

def compute_global_weighted_deviation(deviations, weights):
    """
    Berechnet den global gewichteten Durchschnitt der Differenzen sowie die Standardabweichung.
    """
    weighted_avg = np.sum(deviations * weights) / np.sum(weights)
    weighted_var = np.sum(weights * (deviations - weighted_avg)**2) / np.sum(weights)
    weighted_std = np.sqrt(weighted_var)
    return weighted_avg, weighted_std

# /fingerprint Endpoint (wie bisher, 100 Segmente)
@app.post("/fingerprint")
async def fingerprint_data(audio_file: UploadFile = File(...)):
    try:
        if not audio_file:
            raise HTTPException(status_code=400, detail="Keine Datei erhalten")
        audio_bytes = await audio_file.read()
        head, nodes = create_segment_linked_list(io.BytesIO(audio_bytes), N_SEGMENTS, X_MIN, X_MAX)
        segments_json = [node.to_dict() for node in nodes]
        return JSONResponse(content={"segments": segments_json})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Neuer /compare Endpoint: Erzeugt für beide Audiofiles jeweils den Fingerprint mit lokaler Skalierung.
@app.post("/compare")
async def compare_data(audio1: UploadFile = File(...), audio2: UploadFile = File(...)):
    try:
        audio_bytes1 = await audio1.read()
        audio_bytes2 = await audio2.read()
        
        # Fingerprints mit lokaler Skalierung (global_max_amp=None)
        _, nodes_local1 = create_segment_linked_list(io.BytesIO(audio_bytes1), N_SEGMENTS_COMPARE, X_MIN, X_MAX, global_max_amp=None)
        _, nodes_local2 = create_segment_linked_list(io.BytesIO(audio_bytes2), N_SEGMENTS_COMPARE, X_MIN, X_MAX, global_max_amp=None)
        fingerprint_local1 = [node.to_dict() for node in nodes_local1]
        fingerprint_local2 = [node.to_dict() for node in nodes_local2]
        
        # Berechnung der Abweichungen und Gewichte
        deviations_local, weights_local = compute_deviations_and_weights(fingerprint_local1, fingerprint_local2)
        weighted_avg_deviation_local, weighted_std_deviation_local = compute_global_weighted_deviation(deviations_local, weights_local)
        
        # JSON-Rückgabe: Zwei JSON-Arrays für audio1 und audio2 plus Vergleichswerte.
        response_data = {
            "audio1": fingerprint_local1,
            "audio2": fingerprint_local2,
            "deviations": deviations_local.tolist(),
            "weights": weights_local.tolist(),
            "weighted_avg_deviation": float(weighted_avg_deviation_local),
            "weighted_std_deviation": float(weighted_std_deviation_local)
        }
        
        return JSONResponse(content=response_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=18080)
