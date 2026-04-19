import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/contexts/SidebarContext";
import Index from "./pages/Index.tsx";
import Documents from "./pages/Documents.tsx";
import PendingReview from "./pages/PendingReview.tsx";
import MyTasks from "./pages/MyTasks.tsx";
import Analytics from "./pages/Analytics.tsx";
import DocumentDetail from "./pages/DocumentDetail.tsx";
import WorkflowManagement from "./pages/WorkflowManagement.tsx";
import WorkflowBuilder from "./pages/WorkflowBuilder.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SidebarProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/pending-review" element={<PendingReview />} />
            <Route path="/my-tasks" element={<MyTasks />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/documents/:id" element={<DocumentDetail />} />
            <Route path="/workflows" element={<WorkflowManagement />} />
            <Route path="/workflows/:id" element={<WorkflowBuilder />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
