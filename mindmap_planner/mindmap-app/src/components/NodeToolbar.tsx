"use client";

import { useRef, useCallback } from "react";
import { Paperclip, Image, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMindMapStore, Attachment } from "@/store/mindMapStore";

interface NodeToolbarProps {
  nodeId: string;
  attachments?: Attachment[];
}

export function NodeToolbar({ nodeId, attachments = [] }: NodeToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const addAttachment = useMindMapStore((state) => state.addAttachment);
  const removeAttachment = useMindMapStore((state) => state.removeAttachment);

  // ファイルを処理してBase64に変換
  const processFile = useCallback(
    async (file: File, type: "image" | "file") => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          addAttachment(nodeId, {
            type,
            url: reader.result as string,
            name: file.name,
          });
          resolve();
        };
        reader.readAsDataURL(file);
      });
    },
    [nodeId, addAttachment]
  );

  // 画像ファイル選択ハンドラ
  const handleImageSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      for (const file of Array.from(files)) {
        if (file.type.startsWith("image/")) {
          await processFile(file, "image");
        }
      }

      // 入力をリセット
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    },
    [processFile]
  );

  // 一般ファイル選択ハンドラ
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      for (const file of Array.from(files)) {
        const type = file.type.startsWith("image/") ? "image" : "file";
        await processFile(file, type);
      }

      // 入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFile]
  );

  // 添付ファイル削除ハンドラ
  const handleRemoveAttachment = useCallback(
    (attachmentId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      removeAttachment(nodeId, attachmentId);
    },
    [nodeId, removeAttachment]
  );

  // 添付ファイルを開く
  const handleOpenAttachment = useCallback(
    (attachment: Attachment, e: React.MouseEvent) => {
      e.stopPropagation();
      // 新しいタブでBase64データを開く
      const newWindow = window.open();
      if (newWindow) {
        if (attachment.type === "image") {
          newWindow.document.write(
            `<img src="${attachment.url}" alt="${attachment.name}" style="max-width: 100%;" />`
          );
        } else {
          // ファイルダウンロード
          const link = document.createElement("a");
          link.href = attachment.url;
          link.download = attachment.name;
          link.click();
          newWindow.close();
        }
      }
    },
    []
  );

  return (
    <div
      className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ツールバーボタン */}
      <div className="flex items-center gap-1 glass rounded-lg px-2 py-1 animate-scale-in">
        {/* 画像添付ボタン */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            "hover:bg-primary/10 text-muted hover:text-primary"
          )}
          title="Add Image"
        >
          <Image size={16} />
        </button>

        {/* ファイル添付ボタン */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            "hover:bg-primary/10 text-muted hover:text-primary"
          )}
          title="Add File"
        >
          <Paperclip size={16} />
        </button>

        {/* 隠しファイル入力 */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageSelect}
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* 添付ファイルリスト */}
      {attachments.length > 0 && (
        <div className="flex items-center gap-1 glass rounded-lg px-2 py-1 animate-scale-in">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="relative group flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors"
              onClick={(e) => handleOpenAttachment(attachment, e)}
              title={attachment.name}
            >
              {attachment.type === "image" ? (
                <Image size={12} className="text-primary" />
              ) : (
                <FileText size={12} className="text-primary" />
              )}
              <span className="text-xs max-w-[60px] truncate">
                {attachment.name}
              </span>
              <button
                type="button"
                onClick={(e) => handleRemoveAttachment(attachment.id, e)}
                className="ml-0.5 p-0.5 rounded-full hover:bg-red-100 text-muted hover:text-red-500 transition-colors"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}