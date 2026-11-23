import { ALL_QUESTIONS } from "../data/sets.ts";
import { categoryStats, reviewQueue } from "../lib/quiz.ts";
import type { Progress } from "../lib/types.ts";

interface Props {
  progress: Progress;
  onReset: () => void;
}

export function StatsPage({ progress, onReset }: Props) {
  const stats = categoryStats(progress, ALL_QUESTIONS);
  const totals = Object.values(progress.tally).reduce(
    (acc, t) => ({ correct: acc.correct + t.correct, wrong: acc.wrong + t.wrong }),
    { correct: 0, wrong: 0 },
  );
  const answered = totals.correct + totals.wrong;
  const misses = reviewQueue(progress, ALL_QUESTIONS);

  return (
    <section className="panel">
      <h1>成績</h1>
      <div className="stat-row">
        <div className="stat">
          <span className="muted small">解答数</span>
          <strong>{answered}</strong>
        </div>
        <div className="stat">
          <span className="muted small">正答率</span>
          <strong>{answered === 0 ? "—" : `${Math.round((totals.correct / answered) * 100)}%`}</strong>
        </div>
        <div className="stat">
          <span className="muted small">復習待ち</span>
          <strong>{misses.length}</strong>
        </div>
      </div>

      <h2>分野別(苦手な順)</h2>
      {stats.length === 0 ? (
        <p className="muted">まだ解いた問題がありません。</p>
      ) : (
        <ul className="bars">
          {stats.map((s) => (
            <li key={s.category}>
              <div className="bar-label">
                <span>{s.category}</span>
                <span className="muted small">
                  {s.rate}%({s.correct}/{s.correct + s.wrong})
                </span>
              </div>
              <div className="bar">
                <div style={{ width: `${s.rate}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {misses.length > 0 && (
        <>
          <h2>復習リスト</h2>
          <ul className="wrong-list">
            {misses.map((q) => (
              <li key={q.id}>
                <span className="tag">{q.category}</span> {q.text}
                <div className="muted small">間違えた回数: {progress.misses[q.id].missCount}</div>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="actions">
        <button
          className="button danger"
          onClick={() => {
            if (confirm("学習記録をすべて消します。よろしいですか?")) onReset();
          }}
        >
          学習記録をリセット
        </button>
      </div>
    </section>
  );
}
