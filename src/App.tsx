import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/contexts/RoleContext";
import { WorkshopSessionProvider } from "@/contexts/WorkshopSessionContext";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import MissionPage from "./pages/MissionPage";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Quests from "./pages/Quests";
import WorkshopAdmin from "./pages/WorkshopAdmin";
import NotFound from "./pages/NotFound";
import { MatrixRain } from "@/components/MatrixRain";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RoleProvider>
      <WorkshopSessionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="relative min-h-screen overflow-hidden">
            <MatrixRain />
            <div className="relative z-10 min-h-screen">
              <BrowserRouter
                future={{
                  v7_relativeSplatPath: true,
                }}
              >
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/mission/:missionId" element={<MissionPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/quests" element={<Quests />} />
                  <Route path="/workshop-admin" element={<WorkshopAdmin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </div>
          </div>
        </TooltipProvider>
      </WorkshopSessionProvider>
    </RoleProvider>
  </QueryClientProvider>
);

export default App;
