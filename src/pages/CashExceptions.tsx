import AppSidebar from "@/components/AppSidebar";
import CashExceptionsContent from "@/components/CashExceptionsContent";

const CashExceptions = () => (
  <div className="flex h-screen w-full overflow-hidden">
    <AppSidebar activePage="Exceptions" />
    <CashExceptionsContent />
  </div>
);

export default CashExceptions;
