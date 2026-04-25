import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/store/app-store";
import { SiteLayout } from "@/components/SiteLayout";
import Index from "./pages/Index.tsx";
import Services from "./pages/Services.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import ProProfile from "./pages/ProProfile.tsx";
import MyJobs from "./pages/MyJobs.tsx";
import About from "./pages/About.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <SiteLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:categoryId" element={<CategoryPage />} />
              <Route path="/pro/:proId" element={<ProProfile />} />
              <Route path="/jobs" element={<MyJobs />} />
              <Route path="/about" element={<About />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SiteLayout>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
