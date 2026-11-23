import { test } from "node:test";
import assert from "node:assert/strict";
import {
  GRADUATE_STREAK,
  categoryStats,
  emptyProgress,
  grade,
  playableQuestions,
  recordAnswer,
  reviewQueue,
  score,
  shuffle,
  validateSet,
} from "./quiz.ts";
import { ALL_QUESTIONS, QUESTION_SETS } from "../data/sets.ts";

const basics = QUESTION_SETS.find((s) => s.id === "basics")!;
const security = QUESTION_SETS.find((s) => s.id === "security")!;

test("サンプル問題データに入力ミスがない", () => {
  for (const set of QUESTION_SETS) assert.deepEqual(validateSet(set), [], set.id);
  const ids = ALL_QUESTIONS.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length, "セットをまたいでIDが重複している");
});

test("validateSet は範囲外の正解番号と重複IDを検出する", () => {
  const broken = {
    ...basics,
    questions: [
      { ...basics.questions[0], answer: 9 },
      { ...basics.questions[0], answer: 0 },
    ],
  };
  const errors = validateSet(broken);
  assert.ok(errors.some((e) => e.includes("範囲外")));
  assert.ok(errors.some((e) => e.includes("重複")));
});

test("grade は正解番号と一致した時だけ true", () => {
  const q = basics.questions[0];
  assert.equal(grade(q, q.answer), true);
  assert.equal(grade(q, (q.answer + 1) % q.choices.length), false);
});

test("shuffle は要素を失わず、元の配列を変更しない", () => {
  const src = [1, 2, 3, 4, 5];
  let seed = 0.3;
  const out = shuffle(src, () => (seed = (seed * 7.13) % 1));
  assert.deepEqual([...out].sort(), [1, 2, 3, 4, 5]);
  assert.deepEqual(src, [1, 2, 3, 4, 5]);
});

test("有料セットは未購入ならお試し分だけ、購入後は全問", () => {
  const p = emptyProgress();
  assert.equal(playableQuestions(security, p).length, security.trialCount);
  assert.equal(playableQuestions(basics, p).length, basics.questions.length);
  const unlocked = { ...p, unlockedSets: [security.id] };
  assert.equal(playableQuestions(security, unlocked).length, security.questions.length);
});

test("不正解で復習リストに入り、間違えるたびに回数が増えて連続正解がリセットされる", () => {
  let p = recordAnswer(emptyProgress(), "q1", false, 100);
  assert.equal(p.misses.q1.missCount, 1);
  p = recordAnswer(p, "q1", true, 200);
  assert.equal(p.misses.q1.reviewStreak, 1);
  p = recordAnswer(p, "q1", false, 300);
  assert.equal(p.misses.q1.missCount, 2);
  assert.equal(p.misses.q1.reviewStreak, 0);
  assert.equal(p.misses.q1.lastMissedAt, 300);
  assert.deepEqual(p.tally.q1, { correct: 1, wrong: 2 });
});

test(`${GRADUATE_STREAK}回連続で正解すると復習リストから外れる`, () => {
  let p = recordAnswer(emptyProgress(), "q1", false, 1);
  for (let i = 0; i < GRADUATE_STREAK; i++) p = recordAnswer(p, "q1", true, 2 + i);
  assert.equal(p.misses.q1, undefined);
});

test("復習リストにない問題に正解しても復習リストは変わらない", () => {
  const p = recordAnswer(emptyProgress(), "q1", true, 1);
  assert.deepEqual(p.misses, {});
});

test("recordAnswer は元の Progress を変更しない", () => {
  const p = emptyProgress();
  recordAnswer(p, "q1", false, 1);
  assert.deepEqual(p, emptyProgress());
});

test("復習順は間違い回数の多い順、同数なら古い順。存在しない問題IDは除外", () => {
  let p = emptyProgress();
  p = recordAnswer(p, "basics-01", false, 10);
  p = recordAnswer(p, "basics-02", false, 5);
  p = recordAnswer(p, "basics-03", false, 1);
  p = recordAnswer(p, "basics-03", false, 20);
  p = recordAnswer(p, "deleted-question", false, 1);
  assert.deepEqual(
    reviewQueue(p, ALL_QUESTIONS).map((q) => q.id),
    ["basics-03", "basics-02", "basics-01"],
  );
});

test("score は正解数と百分率(四捨五入)を返す", () => {
  assert.deepEqual(score([]), { correct: 0, total: 0, rate: 0 });
  const r = (correct: boolean) => ({ questionId: "x", chosen: 0, correct });
  assert.deepEqual(score([r(true), r(false), r(true)]), { correct: 2, total: 3, rate: 67 });
});

test("categoryStats は解いた分野だけを正答率の低い順に返す", () => {
  let p = emptyProgress();
  p = recordAnswer(p, "basics-04", false, 1); // ネットワーク 0%
  p = recordAnswer(p, "basics-01", true, 2); // 基礎理論 50%
  p = recordAnswer(p, "basics-02", false, 3);
  const stats = categoryStats(p, ALL_QUESTIONS);
  assert.deepEqual(
    stats.map((s) => [s.category, s.rate]),
    [
      ["ネットワーク", 0],
      ["基礎理論", 50],
    ],
  );
});
