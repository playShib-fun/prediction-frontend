import { create, useStore } from "zustand";

type StateStore = {
  state: "default" | "loading" | "win" | "lose" | "tutorial";
  setState: (
    state: "default" | "loading" | "win" | "lose" | "tutorial"
  ) => void;
};

export const useStateStore = create<StateStore>()((set) => ({
  state: "default",
  setState: (state) => set({ state }),
}));
