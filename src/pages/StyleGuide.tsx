import AppSidebar from "@/components/AppSidebar";
import StyleGuideContent from "@/components/StyleGuideContent";

const StyleGuide = () => (
  <div className="flex h-screen w-full overflow-hidden">
    <AppSidebar activePage="Style Guide" />
    <StyleGuideContent />
  </div>
);

export default StyleGuide;
