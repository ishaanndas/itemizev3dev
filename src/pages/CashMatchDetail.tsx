import AppSidebar from "@/components/AppSidebar";
import CashMatchDetailContent from "@/components/CashMatchDetailContent";

const CashMatchDetail = () => (
  <div className="flex h-screen w-full overflow-hidden">
    <AppSidebar activePage="Matching Queue" />
    <CashMatchDetailContent />
  </div>
);

export default CashMatchDetail;
