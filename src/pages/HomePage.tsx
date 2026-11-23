import { QUESTION_SETS } from "../data/sets.ts";
import { isUnlocked } from "../lib/quiz.ts";
import type { Progress } from "../lib/types.ts";

interface Props {
  progress: Progress;
  onUpdate: (next: Progress) => void;
}

export function HomePage({ progress, onUpdate }: Props) {
  const reviewCount = Object.keys(progress.misses).length;

  // 決済のモック。本実装では Stripe Checkout 等の完了後にサーバー側で購入済みを記録する
  const mockUnlock = (setId: string) => {
    onUpdate({ ...progress, unlockedSets: [...new Set([...progress.unlockedSets, setId])] });
  };

  return (
    <>
      <section className="hero">
        <h1>すきま時間にIT資格の問題演習</h1>
        <p className="muted">4択で解いてすぐ解説。間違えた問題は自動で復習リストに入ります。</p>
      </section>

      <a className={`review-card ${reviewCount === 0 ? "is-empty" : ""}`} href="#/review">
        <div>
          <strong>間違えた問題の復習</strong>
          <div className="muted">
            {reviewCount === 0 ? "まだありません" : "間違えた回数が多い問題から出題します"}
          </div>
        </div>
        <span className="count">{reviewCount}問</span>
      </a>

      <h2>問題セット</h2>
      <ul className="set-list">
        {QUESTION_SETS.map((set) => {
          const unlocked = isUnlocked(set, progress);
          const done = set.questions.filter((q) => progress.tally[q.id]).length;
          return (
            <li key={set.id} className="set-card">
              <div className="set-title">
                <strong>{set.title}</strong>
                {set.premium && <span className={`badge ${unlocked ? "owned" : ""}`}>{unlocked ? "購入済み" : "有料"}</span>}
              </div>
              <p className="muted">{set.description}</p>
              <p className="muted small">
                全{set.questions.length}問・解いた問題 {done}問
              </p>
              <div className="actions">
                <a className="button" href={`#/quiz/${set.id}`}>
                  {unlocked ? "解く" : `お試し(${set.trialCount}問)`}
                </a>
                {!unlocked && (
                  <button className="button secondary" onClick={() => mockUnlock(set.id)}>
                    購入する(デモ・課金なし)
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
