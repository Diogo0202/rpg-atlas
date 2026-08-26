/** Design philosophy: Arquivo Obsidiano — keep the application in a single dark editorial shell. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AntagonistLibrary from "./pages/AntagonistLibrary";
import OneRingSheet from "./pages/OneRingSheet";
import Sanctum from "./pages/Sanctum";
import VampireSheet from "./pages/VampireSheet";
import VampireStore from "./pages/VampireStore";
import SharedCharacterSheet from "./pages/SharedCharacterSheet";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/santuario" component={Sanctum} />
      <Route path="/biblioteca" component={AntagonistLibrary} />
      <Route path="/ficha-v5" component={VampireSheet} />
      <Route path="/ficha-um-anel" component={OneRingSheet} />
      <Route path="/arsenal-v5" component={VampireStore} />
      <Route path="/compartilhar/ficha/:token" component={SharedCharacterSheet} />
      <Route path="/compartilhar/:token" component={SharedCharacterSheet} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
