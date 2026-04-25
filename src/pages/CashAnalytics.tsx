import AppSidebar from "@/components/AppSidebar";
import CashAnalyticsContent from "@/components/CashAnalyticsContent";

const CashAnalytics = () => (
  <div className="flex h-screen w-full overflow-hidden">
    <AppSidebar activePage="Cash Analytics" />
    <CashAnalyticsContent />
  </div>
);

export default CashAnalytics;
