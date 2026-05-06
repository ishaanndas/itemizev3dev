import AppSidebar from "@/components/AppSidebar";
import ReturnedContent from "@/components/ReturnedContent";

const Returned = () => (
  <div className="flex h-screen w-full overflow-hidden">
    <AppSidebar activePage="Returned" />
    <ReturnedContent />
  </div>
);

export default Returned;
