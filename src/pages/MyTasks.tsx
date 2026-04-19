import AppSidebar from "@/components/AppSidebar";
import MyTasksContent from "@/components/MyTasksContent";

const MyTasks = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar activePage="My Tasks" />
      <MyTasksContent />
    </div>
  );
};

export default MyTasks;
