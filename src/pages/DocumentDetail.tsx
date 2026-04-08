import AppSidebar from "@/components/AppSidebar";
import DocumentDetailContent from "@/components/DocumentDetailContent";

const DocumentDetail = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar activePage="Documents" />
      <DocumentDetailContent />
    </div>
  );
};

export default DocumentDetail;
