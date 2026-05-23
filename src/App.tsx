import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ProductProvider } from "@/contexts/ProductContext";
import Index from "./pages/Index.tsx";
import Documents from "./pages/Documents.tsx";
import PendingReview from "./pages/PendingReview.tsx";
import Returned from "./pages/Returned.tsx";
import PortalConnections from "./pages/PortalConnections.tsx";
import MyTasks from "./pages/MyTasks.tsx";
import Analytics from "./pages/Analytics.tsx";
import DocumentDetail from "./pages/DocumentDetail.tsx";
import WorkflowManagement from "./pages/WorkflowManagement.tsx";
import WorkflowBuilder from "./pages/WorkflowBuilder.tsx";
import CashDashboard from "./pages/CashDashboard.tsx";
import CashPayments from "./pages/CashPayments.tsx";
import CashOpenAR from "./pages/CashOpenAR.tsx";
import CashMatching from "./pages/CashMatching.tsx";
import CashMatchDetail from "./pages/CashMatchDetail.tsx";
import CashExceptions from "./pages/CashExceptions.tsx";
import CashPostingFiles from "./pages/CashPostingFiles.tsx";
import CashAnalytics from "./pages/CashAnalytics.tsx";
import StyleGuide from "./pages/StyleGuide.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProductProvider>
        <SidebarProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/pending-review" element={<PendingReview />} />
              <Route path="/returned" element={<Returned />} />
              <Route path="/portal-connections" element={<PortalConnections />} />
              <Route path="/my-tasks" element={<MyTasks />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/documents/:id" element={<DocumentDetail />} />
              <Route path="/workflows" element={<WorkflowManagement />} />
              <Route path="/workflows/:id" element={<WorkflowBuilder />} />
              {/* Cash Application MVD */}
              <Route path="/cash" element={<CashDashboard />} />
              <Route path="/cash/payments" element={<CashPayments />} />
              <Route path="/cash/open-ar" element={<CashOpenAR />} />
              <Route path="/cash/matching" element={<CashMatching />} />
              <Route path="/cash/matching/:id" element={<CashMatchDetail />} />
              <Route path="/cash/exceptions" element={<CashExceptions />} />
              <Route path="/cash/posting" element={<CashPostingFiles />} />
              <Route path="/cash/analytics" element={<CashAnalytics />} />
              <Route path="/style-guide" element={<StyleGuide />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SidebarProvider>
      </ProductProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
