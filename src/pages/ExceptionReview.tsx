import AppSidebar from "@/components/AppSidebar";
import ExceptionReviewContent from "@/components/ExceptionReviewContent";

const ExceptionReview = () => (
  <div className="flex h-screen w-full overflow-hidden">
    <AppSidebar activePage="Exception Review" />
    <ExceptionReviewContent />
  </div>
);

export default ExceptionReview;
