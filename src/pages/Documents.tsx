import AppSidebar from "@/components/AppSidebar";
import DocumentsContent from "@/components/DocumentsContent";

const Documents = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar activePage="Documents" />
      <DocumentsContent />
    </div>
  );
};

export default Documents;
