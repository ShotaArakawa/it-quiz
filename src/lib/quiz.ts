import type { AnswerResult, MissEntry, Progress, Question, QuestionSet } from "./types.ts";

/** 復習リストから外すのに必要な連続正解数 */
export const GRADUATE_STREAK = 2;

export function emptyProgress(): Progress {
  return { tally: {}, misses: {}, unlockedSets: [] };
}

/** Fisher–Yates。テストで結果を固定できるよう乱数関数を受け取る */
export function shuffle<T>(items: readonly T[], rand: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function isUnlocked(set: QuestionSet, progress: Progress): boolean {
  return !set.premium || progress.unlockedSets.includes(set.id);
}

/** 今解ける問題。未購入の有料セットはお試し分だけ */
export function playableQuestions(set: QuestionSet, progress: Progress): Question[] {
  return isUnlocked(set, progress) ? set.questions : set.questions.slice(0, set.trialCount);
}

export function grade(question: Question, chosen: number): boolean {
  return question.answer === chosen;
}

/**
 * 解答を記録した新しい Progress を返す(元のオブジェクトは変更しない)。
 * - 不正解: 復習リストに追加(既にあれば回数+1、連続正解はリセット)
 * - 正解: 復習リストにある問題なら連続正解+1、GRADUATE_STREAK に達したら外す
 * 通常演習でも復習でも同じルールにしている(どちらで正解しても「覚えた」とみなす)。
 */
export function recordAnswer(progress: Progress, questionId: string, correct: boolean, now: number): Progress {
  const prev = progress.tally[questionId] ?? { correct: 0, wrong: 0 };
  const tally = {
    ...progress.tally,
    [questionId]: correct ? { ...prev, correct: prev.correct + 1 } : { ...prev, wrong: prev.wrong + 1 },
  };
  const misses = { ...progress.misses };
  const entry = misses[questionId];
  if (!correct) {
    misses[questionId] = {
      questionId,
      missCount: (entry?.missCount ?? 0) + 1,
      lastMissedAt: now,
      reviewStreak: 0,
    };
  } else if (entry) {
    const streak = entry.reviewStreak + 1;
    if (streak >= GRADUATE_STREAK) delete misses[questionId];
    else misses[questionId] = { ...entry, reviewStreak: streak };
  }
  return { ...progress, tally, misses };
}

/** 復習で出す順番: 間違えた回数が多い順、同数なら古く間違えた順 */
export function reviewQueue(progress: Progress, questions: readonly Question[]): Question[] {
  const byId = new Map(questions.map((q) => [q.id, q]));
  return Object.values(progress.misses)
    .filter((m: MissEntry) => byId.has(m.questionId))
    .sort((a, b) => b.missCount - a.missCount || a.lastMissedAt - b.lastMissedAt)
    .map((m) => byId.get(m.questionId)!);
}

export function score(results: readonly AnswerResult[]): { correct: number; total: number; rate: number } {
  const correct = results.filter((r) => r.correct).length;
  const total = results.length;
  return { correct, total, rate: total === 0 ? 0 : Math.round((correct / total) * 100) };
}

export interface CategoryStat {
  category: string;
  correct: number;
  wrong: number;
  rate: number;
}

/** 分野別の正答率(解いたことのある分野だけ) */
export function categoryStats(progress: Progress, questions: readonly Question[]): CategoryStat[] {
  const map = new Map<string, { correct: number; wrong: number }>();
  for (const q of questions) {
    const t = progress.tally[q.id];
    if (!t) continue;
    const cur = map.get(q.category) ?? { correct: 0, wrong: 0 };
    map.set(q.category, { correct: cur.correct + t.correct, wrong: cur.wrong + t.wrong });
  }
  return [...map.entries()]
    .map(([category, { correct, wrong }]) => ({
      category,
      correct,
      wrong,
      rate: Math.round((correct / (correct + wrong)) * 100),
    }))
    .sort((a, b) => a.rate - b.rate);
}

/** 問題データの検査(問題を追加した時の入力ミス検出用) */
export function validateSet(set: QuestionSet): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const q of set.questions) {
    if (ids.has(q.id)) errors.push(`${q.id}: IDが重複しています`);
    ids.add(q.id);
    if (q.choices.length < 2) errors.push(`${q.id}: 選択肢が2つ未満です`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.choices.length)
      errors.push(`${q.id}: 正解の番号が選択肢の範囲外です`);
    if (new Set(q.choices).size !== q.choices.length) errors.push(`${q.id}: 同じ選択肢があります`);
    if (!q.explanation.trim()) errors.push(`${q.id}: 解説が空です`);
  }
  if (set.trialCount > set.questions.length) errors.push(`${set.id}: お試し問題数が問題数を超えています`);
  return errors;
}
