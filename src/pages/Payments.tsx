import AppSidebar from "@/components/AppSidebar";
import PaymentsContent from "@/components/PaymentsContent";

const Payments = () => (
  <div className="flex h-screen w-full overflow-hidden">
    <AppSidebar activePage="Pay Documents" />
    <PaymentsContent />
  </div>
);

export default Payments;
