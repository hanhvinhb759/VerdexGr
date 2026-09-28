import { create } from "zustand";
import { buildVerdict } from "@/lib/assess";
import { seedItems, type PlanId } from "@/lib/catalog";

export type Profile = {
  name: string;
  code: string;
  segment: string;
  email: string;
  updated: string;
};

type Perception = {
  count: number;
  score: number;
  themes: { id: string; label: string; count: number }[];
};

type HistoryPoint = { period: string; score: number };

const profileSeed: Profile = {
  name: "An Lá Logistics",
  code: "AL-2048",
  segment: "3PL đường bộ và last-mile thương mại điện tử",
  email: "anla@ecolink.vn",
  updated: "12 ngày trước",
};

const perceptionSeed: Perception = {
  count: 62,
  score: 74,
  themes: [
    { id: "pack", label: "Bao bì", count: 18 },
    { id: "ship", label: "Giao hàng", count: 22 },
    { id: "back", label: "Thu hồi", count: 14 },
    { id: "clear", label: "Minh bạch", count: 8 },
  ],
};

const historySeed: HistoryPoint[] = [
  { period: "T4", score: 58 },
  { period: "T5", score: 59 },
  { period: "T6", score: 61 },
  { period: "T7", score: 63 },
  { period: "T8", score: 64 },
];

type Store = {
  profile: Profile;
  plan: PlanId;
  items: ReturnType<typeof seedItems>;
  perception: Perception;
  history: HistoryPoint[];
  done: Record<string, boolean>;
  setItem: (id: string, patch: Partial<Store["items"][string]>) => void;
  setPlan: (plan: PlanId) => void;
  setProfile: (patch: Partial<Profile>) => void;
  addReview: (score: number, themeId: string) => void;
  toggleDone: (id: string) => void;
  commitPeriod: (period: string) => void;
  reset: () => void;
};

const initial = {
  profile: profileSeed,
  plan: "standard" as PlanId,
  items: seedItems(),
  perception: perceptionSeed,
  history: historySeed,
  done: {} as Record<string, boolean>,
};

export const useEcolink = create<Store>((set, get) => ({
  ...initial,
  setItem: (id, patch) =>
    set((state) => ({
      items: { ...state.items, [id]: { ...state.items[id], ...patch } },
      profile: { ...state.profile, updated: "vừa cập nhật trong phiên" },
    })),
  setPlan: (plan) => set({ plan }),
  setProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),
  addReview: (score, themeId) =>
    set((state) => {
      const count = state.perception.count + 1;
      const next = (state.perception.score * state.perception.count + score) / count;
      return {
        perception: {
          count,
          score: next,
          themes: state.perception.themes.map((theme) =>
            theme.id === themeId ? { ...theme, count: theme.count + 1 } : theme,
          ),
        },
      };
    }),
  toggleDone: (id) => set((state) => ({ done: { ...state.done, [id]: !state.done[id] } })),
  commitPeriod: (period) => {
    const verdict = buildVerdict(get().items, get().perception, get().history);
    if (verdict.greenScore === null) return;
    const label = period.trim() || `Kỳ ${get().history.length + 1}`;
    set((state) => ({ history: [...state.history, { period: label, score: verdict.greenScore as number }] }));
  },
  reset: () => set({ ...initial, items: seedItems(), perception: { ...perceptionSeed, themes: perceptionSeed.themes.map((theme) => ({ ...theme })) }, history: [...historySeed], done: {} }),
}));

export function useVerdict() {
  const items = useEcolink((state) => state.items);
  const perception = useEcolink((state) => state.perception);
  const history = useEcolink((state) => state.history);
  return buildVerdict(items, perception, history);
}
