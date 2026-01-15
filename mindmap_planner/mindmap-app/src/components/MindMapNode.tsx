"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useMindMapStore,
  MindMapNode as MindMapNodeType,
} from "@/store/mindMapStore";
import { NodeToolbar } from "./NodeToolbar";

type MindMapNodeProps = NodeProps<MindMapNodeType>;

export const MindMapNode = memo(({ id, data, selected }: MindMapNodeProps) => {
  const [editValue, setEditValue] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);

  const editingNodeId = useMindMapStore((state) => state.editingNodeId);
  const setEditingNodeId = useMindMapStore((state) => state.setEditingNodeId);
  const updateNodeData = useMindMapStore((state) => state.updateNodeData);
  const setSelectedNodeId = useMindMapStore((state) => state.setSelectedNodeId);

  const isEditing = editingNodeId === id;
  const attachments = data.attachments || [];
  const hasAttachments = attachments.length > 0;
  const imageAttachments = attachments.filter((a) => a.type === "image");
  const fileAttachments = attachments.filter((a) => a.type === "file");

  // editValue を data.label と同期
  useEffect(() => {
    if (!isEditing) {
      setEditValue(data.label);
    }
  }, [data.label, isEditing]);

  // 編集モード時にフォーカス
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(() => {
    setEditingNodeId(id);
  }, [id, setEditingNodeId]);

  const finishEditing = useCallback(() => {
    if (editValue !== data.label) {
      updateNodeData(id, { label: editValue });
    }
    setEditingNodeId(null);
  }, [editValue, data.label, id, updateNodeData, setEditingNodeId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        finishEditing();
      } else if (e.key === "Escape") {
        setEditValue(data.label);
        setEditingNodeId(null);
      }
      e.stopPropagation();
    },
    [finishEditing, data.label, setEditingNodeId]
  );

  const handleClick = useCallback(() => {
    if (!isEditing) {
      setSelectedNodeId(id);
    }
  }, [id, setSelectedNodeId, isEditing]);

  const nodeColor = data.color || "var(--primary)";
  const isRoot = id === "root";

  return (
    <div className="relative">
      {/* ツールバー（選択時のみ表示） */}
      {selected && !isEditing && (
        <NodeToolbar nodeId={id} attachments={attachments} />
      )}

      {/* メインノード */}
      <div
        className={cn(
          "relative px-4 py-2 cursor-pointer transition-all duration-200",
          hasAttachments ? "rounded-2xl" : "rounded-full",
          "min-w-[100px] max-w-[250px]",
          isRoot ? "glass-strong" : "glass",
          selected && "ring-2 ring-offset-2",
          selected && !isEditing && "animate-pulse-glow",
          !isEditing && "hover:scale-105"
        )}
        style={{
          borderColor: nodeColor,
          borderWidth: isRoot ? "2px" : "1px",
          boxShadow: selected
            ? `0 0 0 2px ${nodeColor}40`
            : `0 4px 12px ${nodeColor}20`,
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {/* 入力ハンドル（左側） */}
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !border-2 !bg-white transition-smooth"
          style={{ borderColor: nodeColor }}
        />

        {/* ノードコンテンツ */}
        <div className="flex flex-col items-center gap-2">
          {/* テキスト部分 */}
          <div className="flex items-center justify-center w-full">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={finishEditing}
                onKeyDown={handleKeyDown}
                className={cn(
                  "bg-transparent border-none outline-none text-center",
                  "w-full min-w-[80px] text-sm font-medium",
                  "placeholder:text-muted"
                )}
                style={{ color: "var(--foreground)" }}
                placeholder="Enter text..."
              />
            ) : (
              <span
                className={cn(
                  "text-sm font-medium truncate mindmap-node-label",
                  isRoot && "text-base font-semibold"
                )}
                style={{
                  color: data.label ? "var(--foreground)" : "var(--muted)",
                }}
              >
                {data.label || "Enter text..."}
              </span>
            )}
          </div>

          {/* 画像プレビュー */}
          {imageAttachments.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center max-w-[200px]">
              {imageAttachments.slice(0, 3).map((att) => (
                <div
                  key={att.id}
                  className="relative w-12 h-12 rounded-lg overflow-hidden border border-border"
                >
                  <img
                    src={att.url}
                    alt={att.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {imageAttachments.length > 3 && (
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-xs text-muted">
                  +{imageAttachments.length - 3}
                </div>
              )}
            </div>
          )}

          {/* ファイルインジケーター */}
          {fileAttachments.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted">
              <FileText size={12} />
              <span>{fileAttachments.length} file(s)</span>
            </div>
          )}
        </div>

        {/* 出力ハンドル（右側） */}
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !border-2 !bg-white transition-smooth"
          style={{ borderColor: nodeColor }}
        />

        {/* カラーインジケーター */}
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
          style={{ backgroundColor: nodeColor }}
        />

        {/* 添付ファイルバッジ */}
        {hasAttachments && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
            style={{ backgroundColor: nodeColor }}
          >
            {attachments.length}
          </div>
        )}
      </div>
    </div>
  );
});

MindMapNode.displayName = "MindMapNode";