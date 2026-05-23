import AppSidebar from "@/components/AppSidebar";
import PortalConnectionsContent from "@/components/PortalConnectionsContent";

const PortalConnections = () => (
  <div className="flex h-screen w-full overflow-hidden">
    <AppSidebar activePage="Portal Connections" />
    <PortalConnectionsContent />
  </div>
);

export default PortalConnections;
