import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import AppLayout from "@/components/layout/AppLayout";

import Index from "./pages/Index";
import Crawler from "./pages/Crawler";
import Datasets from "./pages/Datasets";
import Agents from "./pages/Agents";
import TestRuns from "./pages/TestRuns";
import Results from "./pages/Results";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<Index />} />
              <Route path="crawler" element={<Crawler />} />
              <Route path="datasets" element={<Datasets />} />
              <Route path="agents" element={<Agents />} />
              <Route path="testruns" element={<TestRuns />} />
              <Route path="results" element={<Results />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
