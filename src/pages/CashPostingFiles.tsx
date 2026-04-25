import AppSidebar from "@/components/AppSidebar";
import CashPostingFilesContent from "@/components/CashPostingFilesContent";

const CashPostingFiles = () => (
  <div className="flex h-screen w-full overflow-hidden">
    <AppSidebar activePage="Posting Files" />
    <CashPostingFilesContent />
  </div>
);

export default CashPostingFiles;
