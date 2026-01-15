import { create } from "zustand";
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  getNodesBounds,
} from "@xyflow/react";

// 添付ファイルの型
export interface Attachment {
  id: string;
  type: "image" | "file";
  url: string;
  name: string;
}

// ノードのデータ型（インデックスシグネチャ追加）
export interface MindMapNodeData extends Record<string, unknown> {
  label: string;
  color?: string;
  isCollapsed?: boolean;
  attachments?: Attachment[];
}

// カスタムノード型
export type MindMapNode = Node<MindMapNodeData, "mindMapNode">;

// 履歴のスナップショット型
interface HistorySnapshot {
  nodes: MindMapNode[];
  edges: Edge[];
  selectedNodeId: string | null;
}

// ブランチカラーの配列
const BRANCH_COLORS = [
  "var(--node-blue)",
  "var(--node-green)",
  "var(--node-purple)",
  "var(--node-orange)",
  "var(--node-pink)",
  "var(--node-teal)",
];

// 履歴の最大保持数
const MAX_HISTORY_SIZE = 50;

// localStorage キー
const STORAGE_KEY = "mindmap-data";

// localStorage から読み込み
const loadFromStorage = (): { nodes: MindMapNode[]; edges: Edge[] } | null => {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load from localStorage:", e);
  }
  return null;
};

// localStorage に保存
const saveToStorage = (nodes: MindMapNode[], edges: Edge[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
};

// ストアの型定義
interface MindMapState {
  nodes: MindMapNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  editingNodeId: string | null;

  // 履歴管理
  history: HistorySnapshot[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;

  // アクション
  onNodesChange: (changes: NodeChange<MindMapNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  setEditingNodeId: (id: string | null) => void;
  addNode: (parentId: string | null, type: "sibling" | "child") => string;
  updateNodeData: (id: string, data: Partial<MindMapNodeData>) => void;
  deleteNode: (id: string) => void;
  initializeWithRoot: () => void;

  // 履歴操作
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  // ナビゲーション
  navigateUp: () => void;
  navigateDown: () => void;
  navigateLeft: () => void;
  navigateRight: () => void;
  startEditing: () => void;

  // 添付ファイル
  addAttachment: (nodeId: string, attachment: Omit<Attachment, "id">) => void;
  removeAttachment: (nodeId: string, attachmentId: string) => void;

  // エクスポート/インポート
  exportToJSON: () => void;
  importFromJSON: (file: File) => Promise<void>;
  loadFromLocalStorage: () => void;
  exportToPDF: (viewportElement: HTMLElement) => Promise<void>;
}

// 新しいノードの位置を計算
const calculateNodePosition = (
  parentNode: MindMapNode | undefined,
  siblingCount: number,
  isChild: boolean
): { x: number; y: number } => {
  if (!parentNode) {
    return { x: 400, y: 300 };
  }

  const offsetX = isChild ? 250 : 0;
  const offsetY = isChild ? siblingCount * 80 - 40 : (siblingCount + 1) * 80;

  return {
    x: parentNode.position.x + offsetX,
    y: parentNode.position.y + offsetY,
  };
};

// ID生成
const generateId = () =>
  `node_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

export const useMindMapStore = create<MindMapState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  editingNodeId: null,

  // 履歴管理
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,

  // 現在の状態を履歴に保存
  saveToHistory: () => {
    const { nodes, edges, selectedNodeId, history, historyIndex } = get();

    // 現在位置より後の履歴を削除
    const newHistory = history.slice(0, historyIndex + 1);

    // 新しいスナップショットを追加
    const snapshot: HistorySnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      selectedNodeId,
    };

    newHistory.push(snapshot);

    // 履歴の最大サイズを超えたら古いものを削除
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: newHistory.length > 1,
      canRedo: false,
    });
  },

  // 元に戻す
  undo: () => {
    const { history, historyIndex } = get();

    if (historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    const snapshot = history[newIndex];

    set({
      nodes: JSON.parse(JSON.stringify(snapshot.nodes)),
      edges: JSON.parse(JSON.stringify(snapshot.edges)),
      selectedNodeId: snapshot.selectedNodeId,
      editingNodeId: null,
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: true,
    });
  },

  // やり直す
  redo: () => {
    const { history, historyIndex } = get();

    if (historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;
    const snapshot = history[newIndex];

    set({
      nodes: JSON.parse(JSON.stringify(snapshot.nodes)),
      edges: JSON.parse(JSON.stringify(snapshot.edges)),
      selectedNodeId: snapshot.selectedNodeId,
      editingNodeId: null,
      historyIndex: newIndex,
      canUndo: true,
      canRedo: newIndex < history.length - 1,
    });
  },

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  setSelectedNodeId: (id) => {
    set({ selectedNodeId: id });
  },

  setEditingNodeId: (id) => {
    set({ editingNodeId: id });
  },

  addNode: (parentId, type) => {
    const { nodes, edges, saveToHistory } = get();

    // 履歴に保存
    saveToHistory();

    const newId = generateId();

    let targetParentId: string | null = null;
    let siblingCount = 0;
    let color = BRANCH_COLORS[0];

    if (type === "child" && parentId) {
      targetParentId = parentId;
      siblingCount = edges.filter((e) => e.source === parentId).length;

      const parentNode = nodes.find((n) => n.id === parentId);
      if (parentNode?.data.color && parentId !== "root") {
        color = parentNode.data.color;
      } else {
        const rootChildren = edges.filter((e) => e.source === parentId).length;
        color = BRANCH_COLORS[rootChildren % BRANCH_COLORS.length];
      }
    } else if (type === "sibling" && parentId) {
      const parentEdge = edges.find((e) => e.target === parentId);
      if (parentEdge) {
        targetParentId = parentEdge.source;
        siblingCount = edges.filter((e) => e.source === targetParentId).length;

        const siblingNode = nodes.find((n) => n.id === parentId);
        if (siblingNode?.data.color) {
          color = siblingNode.data.color;
        }
      } else {
        targetParentId = parentId;
        siblingCount = edges.filter((e) => e.source === parentId).length;
        color = BRANCH_COLORS[siblingCount % BRANCH_COLORS.length];
      }
    }

    const parentNode = nodes.find((n) => n.id === targetParentId);
    const position = calculateNodePosition(
      parentNode,
      siblingCount,
      type === "child"
    );

    const newNode: MindMapNode = {
      id: newId,
      type: "mindMapNode",
      position,
      data: {
        label: "",
        color,
      },
    };

    const newEdges = targetParentId
      ? [
        ...edges,
        {
          id: `edge_${targetParentId}_${newId}`,
          source: targetParentId,
          target: newId,
          style: { stroke: color, strokeWidth: 2 },
        },
      ]
      : edges;

    set({
      nodes: [...nodes, newNode],
      edges: newEdges,
      selectedNodeId: newId,
      editingNodeId: newId,
    });

    return newId;
  },

  updateNodeData: (id, data) => {
    const { saveToHistory } = get();

    // ラベル変更時のみ履歴に保存
    if (data.label !== undefined) {
      saveToHistory();
    }

    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },

  deleteNode: (id) => {
    const { nodes, edges, saveToHistory } = get();

    // 履歴に保存
    saveToHistory();

    const nodesToDelete = new Set<string>();
    const collectDescendants = (nodeId: string) => {
      nodesToDelete.add(nodeId);
      edges
        .filter((e) => e.source === nodeId)
        .forEach((e) => collectDescendants(e.target));
    };
    collectDescendants(id);

    const parentEdge = edges.find((e) => e.target === id);
    const newSelectedId = parentEdge?.source || null;

    set({
      nodes: nodes.filter((n) => !nodesToDelete.has(n.id)),
      edges: edges.filter(
        (e) => !nodesToDelete.has(e.source) && !nodesToDelete.has(e.target)
      ),
      selectedNodeId: newSelectedId,
    });
  },

  initializeWithRoot: () => {
    const rootId = "root";
    const rootNode: MindMapNode = {
      id: rootId,
      type: "mindMapNode",
      position: { x: 400, y: 300 },
      data: {
        label: "Central Idea",
        color: "var(--primary)",
      },
    };

    const initialSnapshot: HistorySnapshot = {
      nodes: [rootNode],
      edges: [],
      selectedNodeId: rootId,
    };

    set({
      nodes: [rootNode],
      edges: [],
      selectedNodeId: rootId,
      editingNodeId: null,
      history: [initialSnapshot],
      historyIndex: 0,
      canUndo: false,
      canRedo: false,
    });
  },

  navigateUp: () => {
    const { nodes, edges, selectedNodeId } = get();
    if (!selectedNodeId) return;

    const parentEdge = edges.find((e) => e.target === selectedNodeId);
    if (!parentEdge) return;

    const siblings = edges
      .filter((e) => e.source === parentEdge.source)
      .map((e) => nodes.find((n) => n.id === e.target))
      .filter((n): n is MindMapNode => n !== undefined)
      .sort((a, b) => a.position.y - b.position.y);

    const currentIndex = siblings.findIndex((n) => n.id === selectedNodeId);
    if (currentIndex > 0) {
      set({ selectedNodeId: siblings[currentIndex - 1].id });
    }
  },

  navigateDown: () => {
    const { nodes, edges, selectedNodeId } = get();
    if (!selectedNodeId) return;

    const parentEdge = edges.find((e) => e.target === selectedNodeId);
    if (!parentEdge) return;

    const siblings = edges
      .filter((e) => e.source === parentEdge.source)
      .map((e) => nodes.find((n) => n.id === e.target))
      .filter((n): n is MindMapNode => n !== undefined)
      .sort((a, b) => a.position.y - b.position.y);

    const currentIndex = siblings.findIndex((n) => n.id === selectedNodeId);
    if (currentIndex < siblings.length - 1) {
      set({ selectedNodeId: siblings[currentIndex + 1].id });
    }
  },

  navigateLeft: () => {
    const { edges, selectedNodeId } = get();
    if (!selectedNodeId) return;

    const parentEdge = edges.find((e) => e.target === selectedNodeId);
    if (parentEdge) {
      set({ selectedNodeId: parentEdge.source });
    }
  },

  navigateRight: () => {
    const { nodes, edges, selectedNodeId } = get();
    if (!selectedNodeId) return;

    const children = edges
      .filter((e) => e.source === selectedNodeId)
      .map((e) => nodes.find((n) => n.id === e.target))
      .filter((n): n is MindMapNode => n !== undefined)
      .sort((a, b) => a.position.y - b.position.y);

    if (children.length > 0) {
      set({ selectedNodeId: children[0].id });
    }
  },

  startEditing: () => {
    const { selectedNodeId } = get();
    if (selectedNodeId) {
      set({ editingNodeId: selectedNodeId });
    }
  },

  // 添付ファイルを追加
  addAttachment: (nodeId, attachment) => {
    const { nodes, saveToHistory } = get();

    saveToHistory();

    const newAttachment: Attachment = {
      ...attachment,
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    };

    set({
      nodes: nodes.map((node) =>
        node.id === nodeId
          ? {
            ...node,
            data: {
              ...node.data,
              attachments: [...(node.data.attachments || []), newAttachment],
            },
          }
          : node
      ),
    });
  },

  // 添付ファイルを削除
  removeAttachment: (nodeId, attachmentId) => {
    const { nodes, saveToHistory } = get();

    saveToHistory();

    set({
      nodes: nodes.map((node) =>
        node.id === nodeId
          ? {
            ...node,
            data: {
              ...node.data,
              attachments: (node.data.attachments || []).filter(
                (att) => att.id !== attachmentId
              ),
            },
          }
          : node
      ),
    });
  },

  // JSON エクスポート
  exportToJSON: () => {
    const { nodes, edges } = get();
    const data = { nodes, edges, version: 1 };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mindmap-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // JSON インポート
  importFromJSON: async (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.nodes && data.edges) {
            const { saveToHistory } = get();
            saveToHistory();

            const initialSnapshot: HistorySnapshot = {
              nodes: data.nodes,
              edges: data.edges,
              selectedNodeId: data.nodes[0]?.id || null,
            };

            set({
              nodes: data.nodes,
              edges: data.edges,
              selectedNodeId: data.nodes[0]?.id || null,
              editingNodeId: null,
              history: [initialSnapshot],
              historyIndex: 0,
              canUndo: false,
              canRedo: false,
            });

            // localStorage にも保存
            saveToStorage(data.nodes, data.edges);
            resolve();
          } else {
            reject(new Error("Invalid mindmap file format"));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  },

  // localStorage から読み込み
  loadFromLocalStorage: () => {
    const data = loadFromStorage();
    if (data && data.nodes.length > 0) {
      const initialSnapshot: HistorySnapshot = {
        nodes: data.nodes,
        edges: data.edges,
        selectedNodeId: data.nodes[0]?.id || null,
      };

      set({
        nodes: data.nodes,
        edges: data.edges,
        selectedNodeId: data.nodes[0]?.id || null,
        editingNodeId: null,
        history: [initialSnapshot],
        historyIndex: 0,
        canUndo: false,
        canRedo: false,
      });
    }
  },

  // PDF エクスポート
  exportToPDF: async (containerElement: HTMLElement) => {
    const { nodes } = get();
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    // React Flow のメインコンテナを取得
    const reactFlowElement = containerElement.querySelector(".react-flow") as HTMLElement;
    if (!reactFlowElement) {
      console.error("React Flow element not found");
      return;
    }

    // 全ノードの境界を計算（ノードのサイズも考慮）
    const bounds = getNodesBounds(nodes);

    // ノードの実際のサイズを考慮して余白を追加
    const padding = 100;
    const nodeExtraWidth = 150; // ノードの幅の余白
    const nodeExtraHeight = 80; // ノードの高さの余白
    const canvasWidth = Math.max(bounds.width + nodeExtraWidth + padding * 2, 800);
    const canvasHeight = Math.max(bounds.height + nodeExtraHeight + padding * 2, 600);

    // トランスフォーム値を計算
    const translateX = -bounds.x + padding;
    const translateY = -bounds.y + padding;

    const canvas = await html2canvas(reactFlowElement, {
      backgroundColor: "#ffffff",
      width: canvasWidth,
      height: canvasHeight,
      scale: 2,
      useCORS: true,
      logging: false,
      foreignObjectRendering: true,
      ignoreElements: (element) => {
        // コントロール、ミニマップ、ツールバーを除外
        return (
          element.classList.contains("react-flow__controls") ||
          element.classList.contains("react-flow__minimap") ||
          element.classList.contains("react-flow__panel") ||
          element.classList.contains("react-flow__background") ||
          element.closest(".absolute.top-4.right-4") !== null
        );
      },
      onclone: (clonedDoc, clonedElement) => {
        // クローンされた React Flow 要素のスタイルを設定
        clonedElement.style.width = `${canvasWidth}px`;
        clonedElement.style.height = `${canvasHeight}px`;
        clonedElement.style.overflow = "visible";
        clonedElement.style.position = "relative";

        // Viewport のトランスフォームを設定
        const viewport = clonedElement.querySelector(".react-flow__viewport") as HTMLElement;
        if (viewport) {
          viewport.style.transform = `translate(${translateX}px, ${translateY}px) scale(1)`;
          viewport.style.transformOrigin = "0 0";
        }

        // SVG エッジのスタイルを修正
        const edgesSvg = clonedElement.querySelector(".react-flow__edges") as SVGElement;
        if (edgesSvg) {
          edgesSvg.style.overflow = "visible";
          edgesSvg.setAttribute("width", "100%");
          edgesSvg.setAttribute("height", "100%");

          // 全てのパスを可視化
          const paths = edgesSvg.querySelectorAll("path");
          paths.forEach((path) => {
            path.style.stroke = path.style.stroke || "#64748b";
            path.style.strokeWidth = "2";
            path.style.fill = "none";
          });
        }

        // ノードのスタイルを修正
        const nodeElements = clonedElement.querySelectorAll(".react-flow__node");
        nodeElements.forEach((node) => {
          const nodeEl = node as HTMLElement;
          nodeEl.style.opacity = "1";
          nodeEl.style.visibility = "visible";
        });

        // ラベルテキストの位置を中央に修正
        const labels = clonedElement.querySelectorAll(".mindmap-node-label");
        labels.forEach((el) => {
          const labelEl = el as HTMLElement;
          labelEl.style.display = "block";
          labelEl.style.textAlign = "center";
          labelEl.style.lineHeight = "1.4";
          labelEl.style.verticalAlign = "middle";
        });

        // ノード内のテキストコンテナを修正
        const textContainers = clonedElement.querySelectorAll(".flex.items-center.justify-center");
        textContainers.forEach((el) => {
          const containerEl = el as HTMLElement;
          containerEl.style.display = "flex";
          containerEl.style.alignItems = "center";
          containerEl.style.justifyContent = "center";
          containerEl.style.height = "100%";
        });

        // ツールバーを非表示
        const toolbars = clonedDoc.querySelectorAll('[class*="NodeToolbar"]');
        toolbars.forEach((el) => {
          (el as HTMLElement).style.display = "none";
        });

        // 選択状態のリングを非表示
        const selectedNodes = clonedElement.querySelectorAll(".ring-2");
        selectedNodes.forEach((el) => {
          (el as HTMLElement).classList.remove("ring-2", "ring-offset-2", "animate-pulse-glow");
        });
      }
    });

    const imgData = canvas.toDataURL("image/png");

    // PDF作成（画像サイズに合わせる）
    const pdfWidth = canvasWidth;
    const pdfHeight = canvasHeight;

    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
      unit: "px",
      format: [pdfWidth, pdfHeight],
    });

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`mindmap-${new Date().toISOString().slice(0, 10)}.pdf`);
  },
}));

// 状態変更時に自動保存するサブスクライバー
useMindMapStore.subscribe((state, prevState) => {
  // nodes または edges が変更された場合のみ保存
  if (state.nodes !== prevState.nodes || state.edges !== prevState.edges) {
    saveToStorage(state.nodes, state.edges);
  }
});