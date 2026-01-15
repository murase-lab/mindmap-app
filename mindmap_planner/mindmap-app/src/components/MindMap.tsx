"use client";

import { ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { MindMapCanvas } from "./MindMapCanvas";

export default function MindMap() {
  return (
    <ReactFlowProvider>
      <div className="w-full h-full relative">
        {/* ヘッダー（タイトルとショートカットヒント） */}
        <div className="absolute top-4 left-4 z-10 glass rounded-lg px-4 py-3 animate-fade-in">
          <h1 className="text-lg font-semibold text-foreground">Mind Map</h1>
          <div className="text-xs text-muted mt-2 space-y-1">
            <p>
              <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">Tab</kbd> add child •{" "}
              <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">Enter</kbd> add sibling •{" "}
              <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">Del</kbd> remove
            </p>
            <p>
              <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">←↑↓→</kbd> navigate •{" "}
              <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">Space</kbd> edit
            </p>
            <p>
              <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">Ctrl+Z</kbd> undo •{" "}
              <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">Ctrl+Y</kbd> redo
            </p>
          </div>
        </div>

        {/* キャンバス */}
        <MindMapCanvas />
      </div>
    </ReactFlowProvider>
  );
}