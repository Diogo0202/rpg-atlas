import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeCheck, CircleDot } from "lucide-react";
import { V5_DISCIPLINES, V5_DISCIPLINE_ADVANCED_POWERS, type V5Clan } from "@shared/vampire-v5";

type V5DisciplinesPanelProps = {
  clan?: V5Clan;
  disciplines: Record<string, string[]>;
  onToggleManualDiscipline: (discipline: string) => void;
  onTogglePower: (discipline: string, power: string) => void;
};

const clanlessIds = new Set(["caitiff", "sangue-ralo"]);

export function V5DisciplinesPanel({ clan, disciplines, onToggleManualDiscipline, onTogglePower }: V5DisciplinesPanelProps) {
  const needsManualSelection = Boolean(clan && clanlessIds.has(clan.id));
  const selectedDisciplines = Object.keys(disciplines).filter((discipline) => discipline in V5_DISCIPLINES);
  const initialDisciplines = needsManualSelection
    ? selectedDisciplines
    : (clan?.disciplines || []).filter((discipline) => discipline in V5_DISCIPLINES);

  return (
    <article className="border border-[#83a89a]/40 bg-[#171a18] p-5">
      <Tabs defaultValue="disciplinas">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a9c7bb]">
              <CircleDot className="h-4 w-4 text-[#d27648]" /> Registro de Disciplinas
            </div>
            <h2 className="mt-2 font-serif text-3xl text-[#f4eee4]">Afinidades da noite.</h2>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-[#b8b3a8]">
              {needsManualSelection
                ? "Caitiff e Sangue-Ralo definem suas próprias disciplinas iniciais. Marque as afinidades que pertencem à ficha."
                : clan
                  ? `As disciplinas iniciais de ${clan.name} são registradas automaticamente ao escolher o clã.`
                  : "Escolha um clã para registrar suas disciplinas iniciais."
              }
            </p>
          </div>
          <TabsList aria-label="Consulta de disciplinas" className="h-10 w-full rounded-none border border-white/10 bg-[#101211] p-1 sm:w-auto">
            <TabsTrigger value="disciplinas" className="rounded-none px-4 text-[10px] font-bold uppercase tracking-[0.12em]">Disciplinas</TabsTrigger>
            <TabsTrigger value="poderes" className="rounded-none px-4 text-[10px] font-bold uppercase tracking-[0.12em]">Poderes</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="disciplinas" className="mt-4">
          {!clan ? (
            <div className="border border-dashed border-[#83a89a]/40 bg-black/10 p-5 text-sm leading-6 text-[#b8b3a8]">
              Nenhuma linhagem foi registrada. Selecione um clã acima para revelar as disciplinas de origem; para <strong className="font-semibold text-[#f4eee4]">Caitiff</strong> ou <strong className="font-semibold text-[#f4eee4]">Sangue-Ralo</strong>, a seleção se torna manual.
            </div>
          ) : needsManualSelection ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Object.entries(V5_DISCIPLINES).map(([discipline, data]) => {
                const selected = selectedDisciplines.includes(discipline);
                return (
                  <button key={discipline} type="button" aria-label={`Selecionar ${discipline}`} aria-pressed={selected} onClick={() => onToggleManualDiscipline(discipline)} className={`border p-4 text-left transition-colors ${selected ? "border-[#b55b32] bg-[#b55b32]/10" : "border-white/10 bg-black/10 hover:border-[#83a89a]/60"}`}>
                    <div className="flex items-start justify-between gap-3"><p className="font-serif text-2xl text-[#f4eee4]">{discipline}</p>{selected ? <BadgeCheck className="h-5 w-5 shrink-0 text-[#d27648]" /> : <span className="mt-1 h-4 w-4 border border-[#83a89a]/55" />}</div>
                    <p className="mt-2 text-xs leading-5 text-[#b8b3a8]">{data.description}</p>
                    <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.12em] text-[#a9c7bb]">{selected ? "Disciplina inicial escolhida" : "Selecionar afinidade"}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {initialDisciplines.map((discipline) => {
                const data = V5_DISCIPLINES[discipline];
                return (
                  <div key={discipline} className="border border-[#b55b32]/45 bg-[#b55b32]/5 p-4">
                    <div className="flex items-start justify-between gap-3"><p className="font-serif text-2xl text-[#f4eee4]">{discipline}</p><BadgeCheck className="h-5 w-5 shrink-0 text-[#d27648]" /></div>
                    <p className="mt-2 text-xs leading-5 text-[#b8b3a8]">{data.description}</p>
                    <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.12em] text-[#a9c7bb]">Disciplina inicial de {clan.name}</p>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="poderes" className="mt-4">
          {initialDisciplines.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {initialDisciplines.map((discipline) => {
                const data = V5_DISCIPLINES[discipline];
                return (
                  <div key={discipline} className="border border-white/10 bg-black/10 p-4">
                    <p className="font-serif text-2xl text-[#f4eee4]">{discipline}</p>
                    <div className="mt-3 space-y-2">
                      {[...data.powers, ...(V5_DISCIPLINE_ADVANCED_POWERS[discipline] || [])].map((power) => (
                        <label key={power.name} className="flex cursor-pointer gap-2 text-xs leading-5 text-[#d7d1c4]">
                          <input type="checkbox" checked={(disciplines[discipline] || []).includes(power.name)} onChange={() => onTogglePower(discipline, power.name)} className="mt-1 accent-[#b55b32]" />
                          <span><strong>N{power.level} · {power.name}</strong><br />{power.effect}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-dashed border-[#83a89a]/40 bg-black/10 p-5 text-sm leading-6 text-[#b8b3a8]">Selecione um clã ou uma disciplina inicial antes de registrar poderes.</div>
          )}
        </TabsContent>
      </Tabs>
    </article>
  );
}
