import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import WorkflowListContent from "@/components/WorkflowListContent";

export default function WorkflowManagement() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar activePage="Workflows" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <WorkflowListContent />
      </div>
    </div>
  );
}
