import AppSidebar from "@/components/AppSidebar";
import CashDashboardContent from "@/components/CashDashboardContent";

const CashDashboard = () => (
  <div className="flex h-screen w-full overflow-hidden">
    <AppSidebar activePage="Dashboard" />
    <CashDashboardContent />
  </div>
);

export default CashDashboard;
