import { emptyProgress } from "./quiz.ts";
import type { Progress } from "./types.ts";

/**
 * 学習記録の保存先の差し替えポイント。雛形は localStorage。
 * 本実装ではログインユーザーごとに Supabase へ保存し、端末間で同期する。
 */
export interface ProgressStore {
  load(): Progress;
  save(progress: Progress): void;
  reset(): void;
}

const KEY = "it-quiz:progress";

export function createLocalStore(): ProgressStore {
  return {
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        return raw ? { ...emptyProgress(), ...(JSON.parse(raw) as Partial<Progress>) } : emptyProgress();
      } catch {
        return emptyProgress();
      }
    },
    save(progress) {
      try {
        localStorage.setItem(KEY, JSON.stringify(progress));
      } catch {
        // 保存できない環境(プライベートモード等)でも演習は続けられるようにする
      }
    },
    reset() {
      try {
        localStorage.removeItem(KEY);
      } catch {
        // 同上
      }
    },
  };
}
