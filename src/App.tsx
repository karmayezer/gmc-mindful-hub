import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/store/app-store";
import { SiteLayout } from "@/components/SiteLayout";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Index from "./pages/Index.tsx";
import Services from "./pages/Services.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import ProProfile from "./pages/ProProfile.tsx";
import MyJobs from "./pages/MyJobs.tsx";
import ProDashboard from "./pages/ProDashboard.tsx";
import About from "./pages/About.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminOverview from "./pages/admin/AdminOverview.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminPros from "./pages/admin/AdminPros.tsx";
import AdminFinance from "./pages/admin/AdminFinance.tsx";
import AdminReputation from "./pages/admin/AdminReputation.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <Routes>
            {/* Admin portal — separate layout, no public site chrome */}
            <Route path="/gmc-admin-control/login" element={<AdminLogin />} />
            <Route
              path="/gmc-admin-control"
              element={
                <AdminLayout>
                  <AdminOverview />
                </AdminLayout>
              }
            />
            <Route
              path="/gmc-admin-control/users"
              element={
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              }
            />
            <Route
              path="/gmc-admin-control/pros"
              element={
                <AdminLayout>
                  <AdminPros />
                </AdminLayout>
              }
            />
            <Route
              path="/gmc-admin-control/finance"
              element={
                <AdminLayout>
                  <AdminFinance />
                </AdminLayout>
              }
            />
            <Route
              path="/gmc-admin-control/reputation"
              element={
                <AdminLayout>
                  <AdminReputation />
                </AdminLayout>
              }
            />

            {/* Public marketplace */}
            <Route
              path="/*"
              element={
                <SiteLayout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/services/:categoryId" element={<CategoryPage />} />
                    <Route path="/pro/:proId" element={<ProProfile />} />
                    <Route path="/jobs" element={<MyJobs />} />
                    <Route path="/pro-dashboard" element={<ProDashboard />} />
                    <Route path="/about" element={<About />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </SiteLayout>
              }
            />
          </Routes>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
