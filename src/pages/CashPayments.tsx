import AppSidebar from "@/components/AppSidebar";
import CashPaymentsContent from "@/components/CashPaymentsContent";

const CashPayments = () => (
  <div className="flex h-screen w-full overflow-hidden">
    <AppSidebar activePage="Payments Inbox" />
    <CashPaymentsContent />
  </div>
);

export default CashPayments;
