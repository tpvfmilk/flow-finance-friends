
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="map" element={<MapPage />} />
            {/* Add more routes as they are implemented */}
            <Route path="deposits" element={<NotFound />} />
            <Route path="categories" element={<NotFound />} />
            <Route path="expenses" element={<NotFound />} />
            <Route path="expenses/add" element={<NotFound />} />
            <Route path="expenses/scan" element={<NotFound />} />
            <Route path="expenses/import" element={<NotFound />} />
            <Route path="goals" element={<NotFound />} />
            <Route path="calendar" element={<NotFound />} />
            <Route path="settings" element={<NotFound />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
