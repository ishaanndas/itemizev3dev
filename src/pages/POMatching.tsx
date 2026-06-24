import AppSidebar from "@/components/AppSidebar";
import POMatchingContent from "@/components/POMatchingContent";

const POMatching = () => (
  <div className="flex h-screen w-full overflow-hidden">
    <AppSidebar activePage="PO Matching" />
    <POMatchingContent />
  </div>
);

export default POMatching;
