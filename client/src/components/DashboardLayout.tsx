import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/useMobile";
import { BookMarked, BookOpen, LayoutDashboard, LogOut, Moon, PanelLeft, ScrollText, Shield, Skull, Sun, UserRound } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";

const menuItems = [
  { number: "01", icon: BookOpen, label: "Atlas público", path: "/" },
  { number: "02", icon: LayoutDashboard, label: "Santuário", path: "/santuario" },
  { number: "03", icon: Skull, label: "Antagonistas", path: "/biblioteca" },
  { number: "04", icon: BookMarked, label: "Acervo", path: "/acervo" },
  { number: "05", icon: UserRound, label: "Ficha V5", path: "/ficha-v5" },
  { number: "06", icon: Shield, label: "Arsenal V5", path: "/arsenal-v5" },
  { number: "07", icon: UserRound, label: "Ficha O Um Anel", path: "/ficha-um-anel" },
  { number: "08", icon: UserRound, label: "Ficha Caçador", path: "/ficha-cacador" },
  { number: "09", icon: ScrollText, label: "Registro vivo", path: "/santuario" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="dossier-grid flex min-h-screen items-center justify-center bg-[#101211] p-6 text-[#eae3d5]">
        <div className="w-full max-w-md border border-[#b55b32]/45 bg-[#171a18] p-8 shadow-[10px_10px_0_rgba(181,91,50,0.12)]">
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="grid h-16 w-16 place-items-center border border-[#b55b32] font-serif text-3xl text-[#eae3d5]">V</span>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#83a89a]">Selo de autenticação · Veyr</p>
            <h1 className="font-serif text-4xl leading-none">
              Entre no seu arquivo
            </h1>
            <p className="max-w-sm text-sm leading-6 text-[#b8b3a8]">
              O santuário de campanha exige autenticação para preservar fichas, campanhas e registros privados.
            </p>
          </div>
          <Button
            onClick={() => startLogin()}
            size="lg"
            className="mt-8 w-full rounded-none bg-[#b55b32] font-bold uppercase tracking-[0.14em] text-[#101211] hover:bg-[#d27648]"
          >
              Autenticar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r border-[#b55b32]/45 bg-[#0a0c0b] text-[#eae3d5]"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-auto border-b border-[#b55b32]/35 px-3 py-5">
            <div className="flex items-center gap-3 px-1 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="grid h-8 w-8 shrink-0 place-items-center border border-white/15 text-[#a9c7bb] transition-colors hover:border-[#b55b32] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b55b32]"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="min-w-0"><p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#83a89a]">Arquivo central</p><span className="mt-1 block font-serif text-[18px] tracking-[0.16em] text-[#eae3d5]">RPG ATLAS</span></div>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <div className="relative mx-auto mt-5 grid h-[72px] w-[72px] place-items-center border border-[#b55b32]/70 bg-[#111312] font-serif text-3xl text-[#eae3d5] group-data-[collapsible=icon]:hidden"><span className="relative z-10">V</span><span className="absolute left-2 right-2 top-2 h-7 rounded-full border border-[#83a89a]/55" /><span className="absolute bottom-3 h-px w-11 rotate-[-18deg] bg-[#b55b32]" /></div>
          <p className="mt-2 text-center text-[8px] font-bold uppercase tracking-[0.2em] text-[#83a89a] group-data-[collapsible=icon]:hidden">VEY-17 · autent.</p>
          <SidebarContent className="mt-5 gap-0 border-t border-white/10 pt-3">
            <SidebarMenu className="px-2 py-1">
              {menuItems.map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-12 rounded-none border-l-2 border-transparent px-3 transition-all font-normal text-[#b8b3a8] hover:bg-white/[0.04] hover:text-[#f4eee4] data-[active=true]:border-[#b55b32] data-[active=true]:bg-[#b55b32]/10 data-[active=true]:text-[#f4eee4]`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-[#d27648]" : "text-[#83a89a]"}`}
                      />
                      <span className="flex min-w-0 items-center gap-2"><span className="font-serif text-[15px] text-[#d27648]">{item.number}</span><span>{item.label}</span></span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

	          <SidebarFooter className="border-t border-white/10 p-3">
	            <Button
	              type="button"
	              variant="outline"
	              onClick={toggleTheme}
	              className="mb-3 h-10 w-full rounded-none border-white/15 bg-transparent px-3 text-[9px] font-bold uppercase tracking-[0.12em] text-[#eae3d5] hover:bg-white/[0.04] group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:px-0"
	              aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
	            >
	              {theme === "dark" ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
	              <span className="ml-2 group-data-[collapsible=icon]:hidden">{theme === "dark" ? "Luz do alvorecer" : "Véu noturno"}</span>
	            </Button>
	            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 px-1 py-1 text-left transition-colors hover:bg-white/[0.04] group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b55b32]">
                  <Avatar className="h-9 w-9 shrink-0 border border-[#b55b32]/60">
                    <AvatarFallback className="bg-[#171a18] text-xs font-medium text-[#eae3d5]">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="truncate text-sm font-medium leading-none text-[#eae3d5]">
                      {user?.name || "-"}
                    </p>
                    <p className="mt-1.5 truncate text-xs text-[#83a89a]">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 border-[#b55b32]/35 bg-[#171a18] text-[#eae3d5]">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-[#d27648] focus:bg-[#3b1d19] focus:text-[#ffb09d]"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair do arquivo</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="bg-[#101211]">
        {isMobile && (
          <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-[#101211]/95 px-2 text-[#eae3d5] backdrop-blur supports-[backdrop-filter]:backdrop-blur">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 border border-white/15 bg-[#171a18] text-[#eae3d5]" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground">
                    {activeMenuItem?.label ?? "Arquivo"}
                  </span>
                </div>
              </div>
	            </div>
	            <Button type="button" variant="outline" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-none border-white/15 bg-[#171a18] text-[#eae3d5]" aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}>
	              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
	            </Button>
	          </div>
	        )}
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}
