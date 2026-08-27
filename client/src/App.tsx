/** Design philosophy: Arquivo Obsidiano — keep the application in a single dark editorial shell. */
import React from "react";
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
import ReferenceArchive from "./pages/ReferenceArchive";
import HunterSheet from "./pages/HunterSheet";
import SceneMode from "./pages/SceneMode";
import LocalSheetManager from "./pages/LocalSheetManager";
import SharedJsonCharacterSheet from "./pages/SharedJsonCharacterSheet";
import ReferenceDetail from "./pages/ReferenceDetail";
import SharedShoppingList from "./pages/SharedShoppingList";

export const APP_ROUTES = {
  sceneMode: "/modo-cena",
  localVault: "/cofre-local",
} as const;

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/santuario" component={Sanctum} />
      <Route path="/biblioteca" component={AntagonistLibrary} />
      <Route path="/ficha-v5" component={VampireSheet} />
      <Route path="/ficha-um-anel" component={OneRingSheet} />
      <Route path="/ficha-cacador" component={HunterSheet} />
      <Route path={APP_ROUTES.sceneMode} component={SceneMode} />
      <Route path={APP_ROUTES.localVault} component={LocalSheetManager} />
      <Route path="/arsenal-v5" component={VampireStore} />
      <Route path="/acervo/:category/:id" component={ReferenceDetail} />
      <Route path="/acervo" component={ReferenceArchive} />
      <Route path="/compartilhar/ficha/:token" component={SharedCharacterSheet} />
      <Route path="/compartilhar/lista/:token" component={SharedShoppingList} />
      <Route path="/compartilhar/json" component={SharedJsonCharacterSheet} />
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
