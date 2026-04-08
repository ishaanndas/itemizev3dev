import AppSidebar from "@/components/AppSidebar";
import PendingReviewContent from "@/components/PendingReviewContent";

const PendingReview = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar activePage="Pending Review" />
      <PendingReviewContent />
    </div>
  );
};

export default PendingReview;
