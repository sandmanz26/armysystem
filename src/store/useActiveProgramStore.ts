import { create } from "zustand";

export type ActiveProgramId = "WPT" | "MST" | "TCT" | "THANOS" | "MST_TCT" | "INTEGRATED";

interface ActiveProgramStore {
  activeProgram: ActiveProgramId;
  setActiveProgram: (id: ActiveProgramId) => void;
}

// Mirrors the programme rail's currently-selected workspace (SidebarSuper) so
// shared pages like System Maintenance can tailor their content per programme
// without needing the programme encoded in the URL.
export const useActiveProgramStore = create<ActiveProgramStore>((set) => ({
  activeProgram: "WPT",
  setActiveProgram: (id) => set({ activeProgram: id }),
}));
