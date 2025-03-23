"use client";
import React, { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist-min";

interface SegmentNode {
  seg_start: number;
  seg_end: number;
  actual_area: number;
  usage_percent: number;
}

export default function Plotly3D({ segments }: { segments: SegmentNode[] }) {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!segments || segments.length === 0) return;

    const x = segments.map((s) => s.seg_start);
    const y = segments.map((s) => s.seg_end);
    const z = segments.map((s) => s.actual_area); // oder usage_percent

    Plotly.newPlot(
      plotRef.current!,
      [
        {
          x,
          y,
          z,
          mode: "markers",
          type: "scatter3d",
          marker: {
            size: 5,
            color: z,
            colorscale: "Viridis",
          },
        },
      ],
      {
        margin: { l: 0, r: 0, b: 0, t: 0 },
        scene: {
          xaxis: { title: "seg_start (Hz)" },
          yaxis: { title: "seg_end (Hz)" },
          zaxis: { title: "actual_area" },
        },
      },
      {
        displayModeBar: false, 
        responsive: true,
      }
    );
    
  }, [segments]);

  return <div ref={plotRef} className="w-full h-full " />;
}
