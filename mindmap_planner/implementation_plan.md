# Implementation Plan: Intuitive Mind Map Tool

**Target Agent:** Claude Code
**Objective:** Build a highly intuitive, web-based Mind Map application with attachment support, export capabilities, and cloud storage.

## 1. Project Overview
The goal is to create a Mind Map tool where "flow" is the priority. Users should be able to brainstorm rapidly using keyboard shortcuts without touching the mouse. The UI must be modern, clean, and "premium" (Glassmorphism, smooth animations).

## 2. Technology Stack
*   **Framework:** Next.js 14+ (App Router) with TypeScript.
*   **Styling:** Tailwind CSS (v3.4+) + `clsx` + `tailwind-merge`.
*   **State Management:** Zustand (for managing the mind map tree data structure).
*   **Diagramming Engine:** React Flow (v11+)
    *   *Reasoning:* Provides robust drag-and-drop, zooming, and panning out of the box. We will build **Custom Nodes** to handle the specific mind map logic.
*   **Icons:** Lucide React.
*   **Export:** `html2canvas` (for capturing the DOM) + `jspdf` (for PDF generation).
*   **Backend/Auth (Optional/Phase 2):** Supabase (PostgreSQL + Auth) or Firebase.

## 3. Core Features & UX Requirements

### A. Intuitive Keyboard Navigation (Critical)
The user experience must feel like a text editor but for structure.
*   **`Enter`**: Create a **sibling** node (next to the current one).
*   **`Tab`**: Create a **child** node (branch off the current one).
*   **`Backspace` / `Delete`**: Delete the selected node (and its children, with a warning or undo).
*   **Arrow Keys**: Navigate focus between nodes.
*   **`Space`** or **`Enter`** (on focused node): Start editing text.

### B. Node Capabilities
*   **Text Editing:** Inline editing.
*   **Attachments:**
    *   Button on node hover/select to "Attach File".
    *   **Images:** Display a preview/thumbnail directly in the node.
    *   **Files:** Display a file icon with the filename (clickable to download).
*   **Visuals:**
    *   Different colors for branches (auto-generated or selectable).
    *   Collapsible branches.

### C. Storage & Export
*   **Local Save:** Auto-save to `localStorage`.
*   **File Save:** Export entire map state as `.json` (proprietary format).
*   **File Load:** Import `.json` to restore map.
*   **PDF Export:** "Download as PDF" button that captures the entire canvas.
*   **Cloud Save (Phase 2):** "Save to Cloud" button (requires Login).

## 4. Implementation Steps

### Phase 1: Project Scaffolding & UI Foundation
1.  Initialize Next.js project: `npx create-next-app@latest mindmap-app --typescript --tailwind --eslint`.
2.  Install dependencies: `npm install reactflow zustand lucide-react html2canvas jspdf`.
3.  Setup basic layout with a full-screen container for the map.
4.  Configure a "Premium" theme in `globals.css` (subtle gradients, nice fonts like Inter or Outfit).

### Phase 2: Core Mind Map Logic (React Flow Wrapper)
1.  **Store Setup (Zustand):**
    *   Define `nodes` and `edges` state.
    *   Actions: `addNode(parentId, type)`, `updateNodeData(id, data)`, `deleteNode(id)`.
    *   *Logic:* When adding a node, automatically calculate its initial position (layouting). *Note: React Flow needs help with auto-layout. Use `dagre` or a simple recursive algorithm to position nodes if not using manual drag-and-drop exclusively.*
2.  **Custom Node Component:**
    *   Create `MindMapNode.tsx`.
    *   Include `Handle` (source/target) for connections.
    *   Include an `<input>` or `contenteditable` area for text.
    *   Style it to look like a mind map branch (pill shape or underline).

### Phase 3: Keyboard Shortcuts & Interaction
1.  Implement a global or canvas-scoped `useHotkeys` hook.
2.  **Logic for `Enter`:**
    *   Get selected node.
    *   Find its parent.
    *   Add new node connected to that parent.
3.  **Logic for `Tab`:**
    *   Get selected node.
    *   Add new node connected to the selected node.
4.  Ensure focus shifts automatically to the newly created node's input.

### Phase 4: Attachments & Media
1.  Update Node Data Structure: `data: { label: string, attachments: Array<{ type: 'image'|'file', url: string, name: string }> }`.
2.  **UI:** Add a small toolbar that appears when a node is selected.
    *   [Paperclip Icon] -> Triggers hidden file input.
3.  **Handling:**
    *   For MVP (Local): Convert images to Base64 strings (be careful of size) or use `URL.createObjectURL` (temporary).
    *   *Better approach:* Store files in IndexedDB or just keep them in memory for the session, warning user about refresh.
    *   *Cloud approach:* Upload to Storage Bucket, get URL, store URL in node.

### Phase 5: Export & Persistence
1.  **JSON Export:** `JSON.stringify(nodes, edges)` -> Blob -> Download link.
2.  **PDF Export:**
    *   Use `reactflow`'s `getViewport` to fit everything.
    *   Use `html2canvas` on the `.react-flow__viewport` element.
    *   Generate PDF with `jspdf`.

### Phase 6: Cloud Integration (Bonus)
1.  Setup Supabase project.
2.  Create `maps` table (`id`, `user_id`, `content` (jsonb), `title`).
3.  Implement "Save" and "Load" from Supabase.

## 5. Verification Plan
*   **Manual Test 1 (Flow):** Open app -> Click Start -> Type "Root" -> Press Tab -> Type "Child 1" -> Press Enter -> Type "Child 2". Verify structure.
*   **Manual Test 2 (Media):** Select "Child 1" -> Click Attach -> Select Image. Verify image appears in node.
*   **Manual Test 3 (Export):** Click "Export PDF". Verify downloaded PDF contains the map and images.
