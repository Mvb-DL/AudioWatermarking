"use client";
import React, { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist-min";

interface SegmentNode {
  seg_start: number;
  seg_end: number;
  actual_area: number;
  usage_percent: number;
}

interface ComparePlotly3DProps {
  segments1: SegmentNode[];
  segments2: SegmentNode[];
}

const ComparePlotly3D: React.FC<ComparePlotly3DProps> = ({ segments1, segments2 }) => {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!segments1.length || !segments2.length) return;

    // Trace für Audio 1: fest in Rot
    const trace1: Partial<Plotly.Scatter3dData> = {
      x: segments1.map((s) => s.seg_start),
      y: segments1.map((s) => s.seg_end),
      z: segments1.map((s) => s.actual_area),
      mode: "markers",
      type: "scatter3d",
      name: "Audio 1",
      marker: {
        size: 3,
        symbol: "circle",
        color: "red",
      },
    };

    // Trace für Audio 2: fest in Blau
    const trace2: Partial<Plotly.Scatter3dData> = {
      x: segments2.map((s) => s.seg_start),
      y: segments2.map((s) => s.seg_end),
      z: segments2.map((s) => s.actual_area),
      mode: "markers",
      type: "scatter3d",
      name: "Audio 2",
      marker: {
        size: 3,
        symbol: "square",
        color: "blue",
      },
    };

    Plotly.newPlot(
      plotRef.current!,
      [trace1, trace2] as Plotly.Data[],
      {
        margin: { l: 0, r: 0, b: 0, t: 0 },
        scene: {
          xaxis: { title: "Segment Start (Hz)" },
          yaxis: { title: "Segment End (Hz)" },
          zaxis: { title: "Actual Area" },
        },
      },
      {
        displayModeBar: false,
        responsive: true,
      }
    );
  }, [segments1, segments2]);

  return <div ref={plotRef} className="w-full h-full" />;
};

export default ComparePlotly3D;
