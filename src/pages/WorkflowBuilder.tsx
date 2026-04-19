import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import WorkflowCanvasContent from "@/components/workflow/WorkflowCanvasContent";
import { useParams } from "react-router-dom";

export default function WorkflowBuilder() {
  const { id } = useParams();
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar activePage="Workflows" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <WorkflowCanvasContent workflowId={id} />
      </div>
    </div>
  );
}
