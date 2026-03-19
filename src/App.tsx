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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RoleProvider>
      <WorkshopSessionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/mission/:missionId" element={<MissionPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/quests" element={<Quests />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </WorkshopSessionProvider>
    </RoleProvider>
  </QueryClientProvider>
);

export default App;
