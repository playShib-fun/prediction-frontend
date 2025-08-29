import { create } from "zustand";

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

// Live round timer store
type LiveRoundTimerStore = {
  liveRoundId: number | null;
  windowStartMs: number | null;
  windowEndMs: number | null;
  progressPct: number; // 0..100
  timeLeftMs: number; // >= 0
  isActive: boolean;
  setWindow: (params: {
    roundId: number;
    baseTimestampMs: number;
    windowMs?: number;
  }) => void;
  updateNow: (nowMs?: number) => void;
  clear: () => void;
};

export const useLiveRoundTimerStore = create<LiveRoundTimerStore>()(
  (set, get) => ({
    liveRoundId: null,
    windowStartMs: null,
    windowEndMs: null,
    progressPct: 0,
    timeLeftMs: 0,
    isActive: false,
    setWindow: ({ roundId, baseTimestampMs, windowMs = 5 * 60 * 1000 }) => {
      const start = baseTimestampMs;
      const end = baseTimestampMs + windowMs;
      const now = Date.now();
      const timeLeftMs = Math.max(0, end - now);
      const elapsed = Math.max(0, Math.min(now - start, windowMs));
      const progressPct = Math.min(
        100,
        Math.max(0, (elapsed / windowMs) * 100)
      );
      set({
        liveRoundId: roundId,
        windowStartMs: start,
        windowEndMs: end,
        progressPct,
        timeLeftMs,
        isActive: true,
      });
    },
    updateNow: (nowMs?: number) => {
      const { windowStartMs, windowEndMs, isActive } = get();
      if (!isActive || windowStartMs == null || windowEndMs == null) return;
      const now = nowMs ?? Date.now();
      const windowMs = windowEndMs - windowStartMs;
      const timeLeftMs = Math.max(0, windowEndMs - now);
      const elapsed = Math.max(0, Math.min(now - windowStartMs, windowMs));
      const progressPct = Math.min(
        100,
        Math.max(0, (elapsed / windowMs) * 100)
      );
      set({ progressPct, timeLeftMs });
    },
    clear: () =>
      set({
        liveRoundId: null,
        windowStartMs: null,
        windowEndMs: null,
        progressPct: 0,
        timeLeftMs: 0,
        isActive: false,
      }),
  })
);

type RoundTimerStore = {
  roundId: number | null;
  progressPct: number;
  timeLeftMs: number;
  setRound: (roundId: number) => void;
  setProgressPct: (progressPct: number) => void;
  setTimeLeftMs: (timeLeftMs: number) => void;
};

export const useRoundTimerStore = create<RoundTimerStore>()((set) => ({
  roundId: null,
  progressPct: 0,
  timeLeftMs: 0,
  setRound: (roundId) => set({ roundId }),
  setProgressPct: (progressPct) => set({ progressPct }),
  setTimeLeftMs: (timeLeftMs) => set({ timeLeftMs }),
}));

type TrophyAnimationStore = {
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
};

export const useTrophyAnimationStore = create<TrophyAnimationStore>()(
  (set) => ({
    isActive: false,
    setIsActive: (isActive) => set({ isActive }),
  })
);


// Carousel navigation store to allow global prev/next from UI controls like Subheader
type CarouselNavStore = {
  isReady: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  setHandlers: (handlers: { scrollPrev: () => void; scrollNext: () => void } | null) => void;
};

export const useCarouselNavStore = create<CarouselNavStore>()((set) => ({
  isReady: false,
  scrollPrev: () => {},
  scrollNext: () => {},
  setHandlers: (handlers) =>
    set({
      isReady: Boolean(handlers),
      scrollPrev: handlers?.scrollPrev ?? (() => {}),
      scrollNext: handlers?.scrollNext ?? (() => {}),
    }),
}));