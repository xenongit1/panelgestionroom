import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import ActivatePage from "./pages/ActivatePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import SalasPage from "./pages/SalasPage.tsx";
import ReservasPage from "./pages/ReservasPage.tsx";
import GameMastersPage from "./pages/GameMastersPage.tsx";
import AjustesPage from "./pages/AjustesPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/activate" element={<ActivatePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/salas" element={<SalasPage />} />
            <Route path="/reservas" element={<ReservasPage />} />
            <Route path="/game-masters" element={<GameMastersPage />} />
            <Route path="/ajustes" element={<AjustesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
