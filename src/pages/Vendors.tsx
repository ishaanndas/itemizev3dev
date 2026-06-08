import AppSidebar from "@/components/AppSidebar";
import VendorsContent from "@/components/VendorsContent";

const Vendors = () => (
  <div className="flex h-screen w-full overflow-hidden">
    <AppSidebar activePage="Vendor Management" />
    <VendorsContent />
  </div>
);

export default Vendors;
