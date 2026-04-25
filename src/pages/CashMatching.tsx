import AppSidebar from "@/components/AppSidebar";
import CashMatchingContent from "@/components/CashMatchingContent";

const CashMatching = () => (
  <div className="flex h-screen w-full overflow-hidden">
    <AppSidebar activePage="Matching Queue" />
    <CashMatchingContent />
  </div>
);

export default CashMatching;
