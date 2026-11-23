import { useCallback, useRef, useState } from "react";
import { ALL_QUESTIONS, findSet } from "./data/sets.ts";
import { playableQuestions, recordAnswer, reviewQueue, shuffle } from "./lib/quiz.ts";
import { useRoute } from "./lib/router.ts";
import { createLocalStore } from "./lib/store.ts";
import type { Progress, Question } from "./lib/types.ts";
import { HomePage } from "./pages/HomePage.tsx";
import { QuizPage } from "./pages/QuizPage.tsx";
import { StatsPage } from "./pages/StatsPage.tsx";

const store = createLocalStore();

export function App() {
  const [page, key] = useRoute();
  const [progress, setProgress] = useState<Progress>(() => store.load());
  // 出題リストを作る時点の最新の記録を読むため(QuizPage は開始時と「もう一度」の時だけ呼ぶ)
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const update = useCallback((next: Progress) => {
    setProgress(next);
    store.save(next);
  }, []);

  const onAnswer = useCallback((questionId: string, correct: boolean) => {
    const next = recordAnswer(progressRef.current, questionId, correct, Date.now());
    progressRef.current = next;
    setProgress(next);
    store.save(next);
  }, []);

  let body;
  const set = page === "quiz" && key ? findSet(key) : undefined;
  if (set) {
    body = (
      <QuizPage
        key={`quiz/${set.id}`}
        title={set.title}
        build={(): Question[] => shuffle(playableQuestions(set, progressRef.current))}
        onAnswer={onAnswer}
        lockedNote={
          set.premium && !progress.unlockedSets.includes(set.id)
            ? `お試し版です(全${set.questions.length}問中${set.trialCount}問)`
            : undefined
        }
      />
    );
  } else if (page === "review") {
    body = (
      <QuizPage
        key="review"
        title="間違えた問題の復習"
        build={() => reviewQueue(progressRef.current, ALL_QUESTIONS)}
        onAnswer={onAnswer}
        isReview
      />
    );
  } else if (page === "stats") {
    body = (
      <StatsPage
        progress={progress}
        onReset={() => {
          store.reset();
          update(store.load());
        }}
      />
    );
  } else {
    body = <HomePage progress={progress} onUpdate={update} />;
  }

  return (
    <div className="app">
      <header className="site-header">
        <a className="logo" href="#/">
          <span className="logo-mark" aria-hidden="true">Q</span>
          IT資格ドリル
        </a>
        <nav className="site-nav">
          <a href="#/review">復習</a>
          <a href="#/stats">成績</a>
        </nav>
      </header>
      <main>{body}</main>
      <footer className="site-footer">問題はすべてオリジナルです。学習記録はこのブラウザにだけ保存されます。</footer>
    </div>
  );
}
