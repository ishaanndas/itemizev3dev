import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
  BackgroundVariant,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowLeft, Plus, Save, UserCheck, GitBranch, Settings2, LayoutList, Workflow } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TriggerNode from "./TriggerNode";
import StepNode from "./StepNode";
import ConditionNode from "./ConditionNode";
import NodeConfigPanel from "./NodeConfigPanel";
import WorkflowSettingsPanel, { defaultWorkflowSettings } from "./WorkflowSettingsPanel";
import LinearWorkflowBuilder from "./LinearWorkflowBuilder";
import { toast } from "sonner";

const defaultNodes: Node[] = [
  {
    id: "trigger-1",
    type: "trigger",
    position: { x: 300, y: 50 },
    data: { label: "Document Received", description: "When a new document enters the system" },
  },
  {
    id: "condition-1",
    type: "condition",
    position: { x: 280, y: 220 },
    data: { label: "Amount > $500?", rules: [{ field: "amount", operator: "gt", value: "500" }] },
  },
  {
    id: "step-1",
    type: "step",
    position: { x: 80, y: 420 },
    data: { label: "Manager Approval", stepMode: "approval", assigneeType: "role", assignee: "Manager" },
  },
  {
    id: "step-2",
    type: "step",
    position: { x: 480, y: 420 },
    data: { label: "Auto-Approve", stepMode: "auto_approve" },
  },
  {
    id: "step-3",
    type: "step",
    position: { x: 300, y: 620 },
    data: { label: "Done", stepMode: "end" },
  },
];

const defaultEdges: Edge[] = [
  { id: "e-t1-c1", source: "trigger-1", target: "condition-1", markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 }, style: { strokeWidth: 2 } },
  { id: "e-c1-s1", source: "condition-1", sourceHandle: "yes", target: "step-1", label: "Yes", markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 }, style: { strokeWidth: 2 } },
  { id: "e-c1-s2", source: "condition-1", sourceHandle: "no", target: "step-2", label: "No", markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 }, style: { strokeWidth: 2 } },
  { id: "e-s1-s3", source: "step-1", target: "step-3", markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 }, style: { strokeWidth: 2 } },
  { id: "e-s2-s3", source: "step-2", target: "step-3", markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 }, style: { strokeWidth: 2 } },
];

const nodeTypeComponents = {
  trigger: TriggerNode,
  step: StepNode,
  condition: ConditionNode,
};

let nodeIdCounter = 10;

const edgeStyle = {
  markerEnd: { type: MarkerType.ArrowClosed as const, width: 16, height: 16 },
  style: { strokeWidth: 2 },
};

const blankStartNodes: Node[] = [
  {
    id: "trigger-1",
    type: "trigger",
    position: { x: 300, y: 80 },
    data: { label: "Document Received", description: "When a document enters the system" },
  },
];

function CanvasInner({ workflowId }: { workflowId?: string }) {
  const isNew = workflowId === "new";
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<Node[]>(isNew ? blankStartNodes : defaultNodes);
  const [edges, setEdges] = useState<Edge[]>(isNew ? [] : defaultEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [workflowName, setWorkflowName] = useState(isNew ? "" : "Standard Approval");
  const [workflowSettings, setWorkflowSettings] = useState({ ...defaultWorkflowSettings, name: isNew ? "" : "Standard Approval" });
  const [viewMode, setViewMode] = useState<"canvas" | "linear">("canvas");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; flowPos: { x: number; y: number } } | null>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);
  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({ ...connection, ...edgeStyle }, eds));
  }, []);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
    setShowSettings(false);
    setContextMenu(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setContextMenu(null);
  }, []);

  const addNodeAt = useCallback((type: string, position: { x: number; y: number }, sourceNodeId?: string, sourceHandle?: string) => {
    nodeIdCounter++;
    const labelMap: Record<string, string> = {
      trigger: "Document Received",
      step: "New Step",
      condition: "Check Condition",
    };
    const newId = `${type}-${nodeIdCounter}`;
    const newNode: Node = {
      id: newId,
      type,
      position,
      data: {
        label: labelMap[type] || "New Step",
        ...(type === "step" ? { stepMode: "approval" } : {}),
      },
    };
    setNodes((nds) => [...nds, newNode]);

    if (sourceNodeId) {
      const newEdge: Edge = {
        id: `e-${sourceNodeId}-${newId}`,
        source: sourceNodeId,
        sourceHandle: sourceHandle || undefined,
        target: newId,
        ...edgeStyle,
      };
      setEdges((eds) => [...eds, newEdge]);
    }

    return newId;
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const { type, sourceNodeId, sourceHandle } = detail;

      setNodes((currentNodes) => {
        const sourceNode = currentNodes.find((n) => n.id === sourceNodeId);
        const pos = sourceNode
          ? { x: sourceNode.position.x + (sourceHandle === "no" ? 200 : sourceHandle === "yes" ? -200 : 0), y: sourceNode.position.y + 180 }
          : { x: 300, y: 400 };

        nodeIdCounter++;
        const labelMap: Record<string, string> = {
          step: "New Step",
          condition: "Check Condition",
        };
        const newId = `${type}-${nodeIdCounter}`;
        const newNode: Node = {
          id: newId,
          type,
          position: pos,
          data: {
            label: labelMap[type] || "New Step",
            ...(type === "step" ? { stepMode: "approval" } : {}),
          },
        };

        const newEdge: Edge = {
          id: `e-${sourceNodeId}-${newId}`,
          source: sourceNodeId,
          sourceHandle: sourceHandle || undefined,
          target: newId,
          ...edgeStyle,
        };
        setEdges((eds) => [...eds, newEdge]);

        return [...currentNodes, newNode];
      });
    };

    window.addEventListener("workflow:add-node", handler);
    return () => window.removeEventListener("workflow:add-node", handler);
  }, []);

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const flowPos = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      setContextMenu({ x: event.clientX, y: event.clientY, flowPos });
    },
    [screenToFlowPosition]
  );

  const addFromContextMenu = (type: string) => {
    if (contextMenu) {
      addNodeAt(type, contextMenu.flowPos);
      setContextMenu(null);
    }
  };

  const updateNodeData = useCallback((id: string, data: Record<string, any>) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n))
    );
    setSelectedNode((prev) => (prev && prev.id === id ? { ...prev, data: { ...prev.data, ...data } } : prev));
  }, []);

  const deleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelectedNode(null);
  }, []);

  const handleSave = () => {
    if (!workflowName.trim()) {
      toast.error("Please enter a policy name");
      return;
    }
    toast.success("Approval policy saved");
  };

  const nodeTypes = useMemo(() => nodeTypeComponents, []);

  const addStepItems = [
    { type: "step", label: "Step", icon: UserCheck, color: "text-emerald-600" },
    { type: "condition", label: "Condition", icon: GitBranch, color: "text-amber-600" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="shrink-0 border-b border-border bg-card px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/workflows")}
            className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <Input
            value={workflowName}
            onChange={(e) => {
              setWorkflowName(e.target.value);
              setWorkflowSettings((s) => ({ ...s, name: e.target.value }));
            }}
            placeholder="Policy name..."
            className="h-8 text-sm font-semibold border-none bg-transparent shadow-none focus-visible:ring-0 w-[260px] px-0"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setViewMode("canvas")}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 transition-colors ${viewMode === "canvas" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
            >
              <Workflow className="h-3.5 w-3.5" />
              Canvas
            </button>
            <button
              onClick={() => setViewMode("linear")}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 transition-colors ${viewMode === "linear" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutList className="h-3.5 w-3.5" />
              Linear
            </button>
          </div>

          {viewMode === "canvas" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-lg transition-colors">
                <Plus className="h-3.5 w-3.5" />
                Add Step
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {addStepItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem key={item.type} onClick={() => addNodeAt(item.type, { x: 300 + Math.random() * 80, y: 300 + Math.random() * 80 })}>
                    <Icon className={`h-3.5 w-3.5 mr-2 ${item.color}`} />
                    {item.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          )}

          <button
            onClick={() => { setShowSettings(!showSettings); setSelectedNode(null); }}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${showSettings ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
          >
            <Settings2 className="h-3.5 w-3.5" />
            Settings
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 text-sm font-semibold bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </button>
        </div>
      </div>

      {/* Canvas + Config Panel / Linear View */}
      <div className="flex-1 flex min-h-0">
        {viewMode === "linear" ? (
          <LinearWorkflowBuilder isNew={isNew} />
        ) : (
          <>
            <div className="flex-1 relative">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onPaneContextMenu={handleContextMenu}
                nodeTypes={nodeTypes}
                fitView
                proOptions={{ hideAttribution: true }}
                className="bg-background"
                deleteKeyCode={["Backspace", "Delete"]}
              >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="!bg-background" />
                <Controls className="!bg-card !border-border !shadow-sm [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-secondary" />
              </ReactFlow>

              {contextMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
                  <div
                    className="fixed z-50 bg-popover border border-border rounded-lg shadow-lg py-1.5 min-w-[180px]"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                  >
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Add Step</div>
                    {addStepItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.type}
                          onClick={() => addFromContextMenu(item.type)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors text-left"
                        >
                          <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {selectedNode && !showSettings && (
              <NodeConfigPanel
                node={selectedNode}
                onUpdate={updateNodeData}
                onDelete={deleteNode}
                onClose={() => setSelectedNode(null)}
              />
            )}
          </>
        )}

        {showSettings && (
          <WorkflowSettingsPanel
            settings={workflowSettings}
            onUpdate={(s) => {
              setWorkflowSettings(s);
              setWorkflowName(s.name);
            }}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </div>
  );
}

export default function WorkflowCanvasContent({ workflowId }: { workflowId?: string }) {
  return (
    <ReactFlowProvider>
      <CanvasInner workflowId={workflowId} />
    </ReactFlowProvider>
  );
}
