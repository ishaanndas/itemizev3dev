import AppSidebar from "@/components/AppSidebar";
import DashboardContent from "@/components/DashboardContent";

const Index = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar activePage="Dashboard" />
      <DashboardContent />
    </div>
  );
};

export default Index;
