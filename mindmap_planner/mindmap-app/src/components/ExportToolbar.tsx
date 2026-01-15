"use client";

import { useRef, useCallback } from "react";
import { Download, Upload, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMindMapStore } from "@/store/mindMapStore";

interface ExportToolbarProps {
  viewportRef: React.RefObject<HTMLElement | null>;
}

export function ExportToolbar({ viewportRef }: ExportToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportToJSON = useMindMapStore((state) => state.exportToJSON);
  const importFromJSON = useMindMapStore((state) => state.importFromJSON);
  const exportToPDF = useMindMapStore((state) => state.exportToPDF);

  const handleExportJSON = useCallback(() => {
    exportToJSON();
  }, [exportToJSON]);

  const handleImportJSON = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          await importFromJSON(file);
        } catch (error) {
          console.error("Failed to import JSON:", error);
          alert("Failed to import file. Please check the file format.");
        }
      }
      // 入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [importFromJSON]
  );

  const handleExportPDF = useCallback(async () => {
    // コンテナ全体を渡す（.react-flow を含む要素）
    if (viewportRef.current) {
      try {
        await exportToPDF(viewportRef.current);
      } catch (error) {
        console.error("Failed to export PDF:", error);
        alert("Failed to export PDF. Please try again.");
      }
    }
  }, [viewportRef, exportToPDF]);

  return (
    <div className="absolute top-4 right-4 z-10 flex items-center gap-2 glass rounded-lg px-3 py-2 animate-fade-in">
      {/* JSON エクスポート */}
      <button
        type="button"
        onClick={handleExportJSON}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors",
          "hover:bg-primary/10 text-muted hover:text-primary text-sm"
        )}
        title="Export as JSON"
      >
        <Download size={16} />
        <span className="hidden sm:inline">JSON</span>
      </button>

      {/* JSON インポート */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors",
          "hover:bg-primary/10 text-muted hover:text-primary text-sm"
        )}
        title="Import from JSON"
      >
        <Upload size={16} />
        <span className="hidden sm:inline">Import</span>
      </button>

      {/* 区切り線 */}
      <div className="w-px h-6 bg-border" />

      {/* PDF エクスポート */}
      <button
        type="button"
        onClick={handleExportPDF}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors",
          "hover:bg-primary/10 text-muted hover:text-primary text-sm"
        )}
        title="Export as PDF"
      >
        <FileImage size={16} />
        <span className="hidden sm:inline">PDF</span>
      </button>

      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImportJSON}
      />
    </div>
  );
}