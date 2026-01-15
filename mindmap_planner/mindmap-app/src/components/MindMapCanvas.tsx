"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  NodeTypes,
  ConnectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { MindMapNode } from "./MindMapNode";
import { ExportToolbar } from "./ExportToolbar";
import { useMindMapStore } from "@/store/mindMapStore";
import { useHotkeys } from "@/hooks/useHotkeys";

// カスタムノードタイプの登録
const nodeTypes: NodeTypes = {
  mindMapNode: MindMapNode,
};

export function MindMapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  const nodes = useMindMapStore((state) => state.nodes);
  const edges = useMindMapStore((state) => state.edges);
  const selectedNodeId = useMindMapStore((state) => state.selectedNodeId);
  const editingNodeId = useMindMapStore((state) => state.editingNodeId);
  const onNodesChange = useMindMapStore((state) => state.onNodesChange);
  const onEdgesChange = useMindMapStore((state) => state.onEdgesChange);
  const addNode = useMindMapStore((state) => state.addNode);
  const deleteNode = useMindMapStore((state) => state.deleteNode);
  const initializeWithRoot = useMindMapStore((state) => state.initializeWithRoot);
  const loadFromLocalStorage = useMindMapStore((state) => state.loadFromLocalStorage);
  const setSelectedNodeId = useMindMapStore((state) => state.setSelectedNodeId);
  const navigateUp = useMindMapStore((state) => state.navigateUp);
  const navigateDown = useMindMapStore((state) => state.navigateDown);
  const navigateLeft = useMindMapStore((state) => state.navigateLeft);
  const navigateRight = useMindMapStore((state) => state.navigateRight);
  const startEditing = useMindMapStore((state) => state.startEditing);
  const undo = useMindMapStore((state) => state.undo);
  const redo = useMindMapStore((state) => state.redo);
  const canUndo = useMindMapStore((state) => state.canUndo);
  const canRedo = useMindMapStore((state) => state.canRedo);

  // 初回マウント時に localStorage から読み込み、なければルートノードを作成
  useEffect(() => {
    if (nodes.length === 0) {
      loadFromLocalStorage();
      // localStorage にデータがなければ初期化
      const currentNodes = useMindMapStore.getState().nodes;
      if (currentNodes.length === 0) {
        initializeWithRoot();
      }
    }
  }, []);

  // キーボードショートカット（編集中は無効）
  useHotkeys(
    {
      // ノード操作
      tab: (e) => {
        e.preventDefault();
        if (selectedNodeId) {
          addNode(selectedNodeId, "child");
        }
      },
      enter: (e) => {
        e.preventDefault();
        if (selectedNodeId) {
          addNode(selectedNodeId, "sibling");
        }
      },
      delete: (e) => {
        e.preventDefault();
        if (selectedNodeId && selectedNodeId !== "root") {
          deleteNode(selectedNodeId);
        }
      },
      backspace: (e) => {
        e.preventDefault();
        if (selectedNodeId && selectedNodeId !== "root") {
          deleteNode(selectedNodeId);
        }
      },

      // ナビゲーション
      up: (e) => {
        e.preventDefault();
        navigateUp();
      },
      down: (e) => {
        e.preventDefault();
        navigateDown();
      },
      left: (e) => {
        e.preventDefault();
        navigateLeft();
      },
      right: (e) => {
        e.preventDefault();
        navigateRight();
      },

      // 編集開始
      space: (e) => {
        e.preventDefault();
        startEditing();
      },
      f2: (e) => {
        e.preventDefault();
        startEditing();
      },

      // Undo / Redo
      "mod+z": (e) => {
        e.preventDefault();
        if (canUndo) undo();
      },
      "mod+y": (e) => {
        e.preventDefault();
        if (canRedo) redo();
      },
      "mod+shift+z": (e) => {
        e.preventDefault();
        if (canRedo) redo();
      },
    },
    { enabled: !editingNodeId }
  );

  // ノード選択時のハンドラ
  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: typeof nodes }) => {
      if (selectedNodes.length > 0) {
        setSelectedNodeId(selectedNodes[0].id);
      }
    },
    [setSelectedNodeId]
  );

  // MiniMap のノードカラー
  const nodeColor = useCallback(
    (node: (typeof nodes)[0]) => node.data.color || "var(--primary)",
    []
  );

  // デフォルトのエッジオプション
  const defaultEdgeOptions = useMemo(
    () => ({
      type: "smoothstep",
      animated: false,
    }),
    []
  );

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <ExportToolbar viewportRef={containerRef} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={handleSelectionChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.5 }}
        minZoom={0.1}
        maxZoom={2}
        deleteKeyCode={null}
        selectionKeyCode={null}
        multiSelectionKeyCode={null}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--muted)"
          style={{ opacity: 0.3 }}
        />
        <Controls
          className="glass !border-border !rounded-lg"
          showInteractive={false}
        />
        <MiniMap
          nodeColor={nodeColor}
          maskColor="rgba(0, 0, 0, 0.1)"
          className="glass !border-border !rounded-lg"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}