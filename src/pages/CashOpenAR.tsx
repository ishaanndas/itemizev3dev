import AppSidebar from "@/components/AppSidebar";
import CashOpenARContent from "@/components/CashOpenARContent";

const CashOpenAR = () => (
  <div className="flex h-screen w-full overflow-hidden">
    <AppSidebar activePage="Open AR" />
    <CashOpenARContent />
  </div>
);

export default CashOpenAR;
