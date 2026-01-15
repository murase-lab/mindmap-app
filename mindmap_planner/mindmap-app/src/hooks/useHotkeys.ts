import { useEffect, useCallback, useRef } from "react";

type HotkeyCallback = (event: KeyboardEvent) => void;

interface HotkeyMap {
  [key: string]: HotkeyCallback;
}

interface UseHotkeysOptions {
  enabled?: boolean;
  enableOnInput?: boolean;
}

/**
 * キーボードショートカットを管理するフック
 */
export function useHotkeys(
  hotkeys: HotkeyMap,
  options: UseHotkeysOptions = {}
) {
  const { enabled = true, enableOnInput = false } = options;
  const hotkeysRef = useRef(hotkeys);

  // 最新の hotkeys を参照できるようにする
  useEffect(() => {
    hotkeysRef.current = hotkeys;
  }, [hotkeys]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // 入力要素での入力中は無視（オプションで有効化可能）
      if (!enableOnInput) {
        const target = event.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
      }

      // キーの組み合わせを生成
      const keyCombo = getKeyCombo(event);

      // 登録されたホットキーを実行
      const callback = hotkeysRef.current[keyCombo];
      if (callback) {
        callback(event);
      }
    },
    [enabled, enableOnInput]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * キーイベントからキーコンボ文字列を生成
 */
function getKeyCombo(event: KeyboardEvent): string {
  const parts: string[] = [];

  if (event.ctrlKey || event.metaKey) parts.push("mod");
  if (event.altKey) parts.push("alt");
  if (event.shiftKey) parts.push("shift");

  // 特殊キーの名前を正規化
  const key = normalizeKey(event.key);
  if (!["Control", "Alt", "Shift", "Meta"].includes(event.key)) {
    parts.push(key);
  }

  return parts.join("+");
}

/**
 * キー名を正規化
 */
function normalizeKey(key: string): string {
  const keyMap: Record<string, string> = {
    " ": "space",
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    Escape: "escape",
    Enter: "enter",
    Tab: "tab",
    Backspace: "backspace",
    Delete: "delete",
  };

  return keyMap[key] || key.toLowerCase();
}