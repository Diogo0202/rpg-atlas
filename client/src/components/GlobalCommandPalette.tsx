import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  BookOpen,
  BookMarked,
  Clapperboard,
  Compass,
  FileText,
  Map,
  PackageOpen,
  ScrollText,
  Search,
  Shield,
  Sparkles,
  Swords,
  Users,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";

type CommandEntry = {
  label: string;
  description: string;
  route: string;
  icon: typeof Search;
};

const entries: Array<{ group: string; items: CommandEntry[] }> = [
  {
    group: "Navegar pelo Atlas",
    items: [
      { label: "Dossiê público", description: "A página de entrada do RPG Atlas", route: "/", icon: Compass },
      { label: "Acervo de referências", description: "Consultar sistemas, fontes e materiais catalogados", route: "/acervo", icon: BookOpen },
      { label: "Biblioteca de antagonistas", description: "Filtrar ameaças, aliados e ganchos", route: "/biblioteca", icon: Swords },
      { label: "Modo de cena", description: "Abrir o painel de condução da mesa", route: "/modo-cena", icon: Clapperboard },
      { label: "Mapa de Shadowlords", description: "Explorar a mesa virtual e seus marcadores", route: "/mapa-shadowlords", icon: Map },
    ],
  },
  {
    group: "Fichas e preparação",
    items: [
      { label: "Ficha de Vampiro V5", description: "Criar ou consultar uma ficha persistente", route: "/ficha-v5", icon: Shield },
      { label: "Ficha de O Um Anel", description: "Gerenciar personagem, magias e arquétipos", route: "/ficha-um-anel", icon: ScrollText },
      { label: "Ficha de Caçador", description: "Abrir o construtor de personagens", route: "/ficha-cacador", icon: Users },
      { label: "Arsenal V5", description: "Registrar recursos, animais e aquisições", route: "/arsenal-v5", icon: PackageOpen },
      { label: "Cofre local", description: "Gerenciar fichas exportadas e importadas", route: "/cofre-local", icon: FileText },
    ],
  },
  {
    group: "Compartilhar e criar",
    items: [
      { label: "Arquivo de campanha", description: "Abrir a área de trabalho do narrador", route: "/santuario", icon: BookMarked },
      { label: "Inspiração para a mesa", description: "Reunir ferramentas e ideias rápidas", route: "/modo-cena", icon: Sparkles },
    ],
  },
];

export default function GlobalCommandPalette() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const navigate = (route: string) => {
    setOpen(false);
    setLocation(route);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 hidden items-center gap-2 border border-[#83a89a]/35 bg-[#171a18]/95 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#c7c1b5] shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md transition-colors hover:border-[#b55b32]/70 hover:text-[#f4eee4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27648] md:flex"
        aria-label="Abrir busca e navegação rápida"
      >
        <Search className="h-3.5 w-3.5 text-[#83a89a]" />
        Busca rápida
        <kbd className="border border-white/15 px-1.5 py-0.5 text-[9px] text-[#83a89a]">⌘K</kbd>
      </button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Navegação rápida do RPG Atlas"
        description="Busque um módulo, ficha ou ferramenta para continuar sua crônica."
        className="border-[#83a89a]/30 bg-[#171a18] text-[#eae3d5] sm:max-w-xl"
      >
        <CommandInput placeholder="Buscar no Atlas..." className="border-white/10 text-[#eae3d5]" />
        <CommandList className="max-h-[min(68vh,520px)] bg-[#171a18] p-2">
          <CommandEmpty className="py-10 text-[#b8b3a8]">Nenhum registro corresponde à busca.</CommandEmpty>
          {entries.map((section) => (
            <CommandGroup key={section.group} heading={section.group} className="text-[#a9c7bb]">
              {section.items.map((entry) => {
                const Icon = entry.icon;
                return (
                  <CommandItem
                    key={entry.route + entry.label}
                    value={`${entry.label} ${entry.description}`}
                    onSelect={() => navigate(entry.route)}
                    className="rounded-none px-3 py-3 text-[#eae3d5] aria-selected:bg-[#b55b32]/15 aria-selected:text-[#f4eee4]"
                  >
                    <Icon className="h-4 w-4 text-[#83a89a]" />
                    <span className="flex min-w-0 flex-col">
                      <span className="font-serif text-base leading-tight">{entry.label}</span>
                      <span className="mt-1 truncate text-[11px] font-normal text-[#b8b3a8]">{entry.description}</span>
                    </span>
                    <CommandShortcut className="text-[#83a89a]">↵</CommandShortcut>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
          <CommandGroup heading="Atalho" className="border-t border-white/10 pt-2 text-[#a9c7bb]">
            <CommandItem value="fechar busca esc" onSelect={() => setOpen(false)} className="rounded-none px-3 py-2 text-[#b8b3a8]">
              <Search className="h-4 w-4 text-[#83a89a]" />
              <span>Fechar a busca</span>
              <CommandShortcut>Esc</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
