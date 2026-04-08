import AppSidebar from "@/components/AppSidebar";
import AnalyticsContent from "@/components/AnalyticsContent";

const Analytics = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar activePage="Analytics" />
      <AnalyticsContent />
    </div>
  );
};

export default Analytics;
