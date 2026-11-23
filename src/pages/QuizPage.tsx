import { useCallback, useEffect, useState } from "react";
import { grade, score } from "../lib/quiz.ts";
import type { AnswerResult, Question } from "../lib/types.ts";

interface Props {
  title: string;
  /** 出題リストを作る。開始時と「もう一度」の時に呼ぶ */
  build: () => Question[];
  onAnswer: (questionId: string, correct: boolean) => void;
  isReview?: boolean;
  lockedNote?: string;
}

const LABELS = ["ア", "イ", "ウ", "エ", "オ", "カ"];

export function QuizPage({ title, build, onAnswer, isReview, lockedNote }: Props) {
  const [questions, setQuestions] = useState<Question[]>(() => build());
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [results, setResults] = useState<AnswerResult[]>([]);

  const question = questions[index];
  const finished = questions.length > 0 && index >= questions.length;

  const choose = useCallback(
    (i: number) => {
      if (!question || chosen !== null || i >= question.choices.length) return;
      const correct = grade(question, i);
      setChosen(i);
      setResults((r) => [...r, { questionId: question.id, chosen: i, correct }]);
      onAnswer(question.id, correct);
    },
    [question, chosen, onAnswer],
  );

  const next = useCallback(() => {
    if (chosen === null) return;
    setChosen(null);
    setIndex((i) => i + 1);
  }, [chosen]);

  const restart = (list: Question[]) => {
    setQuestions(list);
    setIndex(0);
    setChosen(null);
    setResults([]);
  };

  // キーボード操作: 1〜4 で解答、Enter で次へ
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (/^[1-6]$/.test(e.key)) choose(Number(e.key) - 1);
      else if (e.key === "Enter") next();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [choose, next]);

  if (questions.length === 0) {
    return (
      <section className="panel center">
        <h1>{title}</h1>
        <p className="muted">
          {isReview ? "復習する問題はありません。間違えた問題がここに溜まります。" : "このセットには問題がありません。"}
        </p>
        <a className="button" href="#/">
          問題セットを選ぶ
        </a>
      </section>
    );
  }

  if (finished) {
    const s = score(results);
    const wrong = results.filter((r) => !r.correct);
    const wrongQuestions = questions.filter((q) => wrong.some((w) => w.questionId === q.id));
    return (
      <section className="panel">
        <h1>結果</h1>
        <p className="score">
          <strong>{s.correct}</strong> / {s.total} 問正解({s.rate}%)
        </p>
        {wrongQuestions.length > 0 ? (
          <>
            <h2>間違えた問題</h2>
            <ul className="wrong-list">
              {wrongQuestions.map((q) => (
                <li key={q.id}>
                  <span className="tag">{q.category}</span> {q.text}
                  <div className="muted">正解: {q.choices[q.answer]}</div>
                </li>
              ))}
            </ul>
            <p className="muted">間違えた問題は復習リストに入りました。2回続けて正解するとリストから外れます。</p>
          </>
        ) : (
          <p>全問正解です。</p>
        )}
        <div className="actions">
          {wrongQuestions.length > 0 && (
            <button className="button" onClick={() => restart(wrongQuestions)}>
              間違えた問題だけ解き直す
            </button>
          )}
          <button className="button secondary" onClick={() => restart(build())}>
            もう一度
          </button>
          <a className="button secondary" href="#/">
            トップへ
          </a>
        </div>
        <AdSlot />
      </section>
    );
  }

  const answered = chosen !== null;
  const correct = answered && grade(question, chosen);
  return (
    <section className="panel">
      <div className="quiz-head">
        <span className="muted">{title}</span>
        <span className="muted">
          {index + 1} / {questions.length}
        </span>
      </div>
      {lockedNote && <p className="note">{lockedNote}</p>}
      <div className="progress-bar" aria-hidden="true">
        <div style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>
      <p className="tag">{question.category}</p>
      <h1 className="question">{question.text}</h1>
      <ol className="choices">
        {question.choices.map((c, i) => {
          const state = !answered ? "" : i === question.answer ? "is-correct" : i === chosen ? "is-wrong" : "is-dim";
          return (
            <li key={i}>
              <button className={`choice ${state}`} onClick={() => choose(i)} disabled={answered}>
                <span className="choice-label">{LABELS[i]}</span>
                {c}
              </button>
            </li>
          );
        })}
      </ol>
      {answered && (
        <div className={`feedback ${correct ? "ok" : "ng"}`} role="status">
          <strong>{correct ? "正解" : `不正解(正解は ${LABELS[question.answer]})`}</strong>
          <p>{question.explanation}</p>
          <button className="button" onClick={next} autoFocus>
            {index + 1 < questions.length ? "次の問題へ" : "結果を見る"}
          </button>
        </div>
      )}
      <p className="hint muted">キーボード: 1〜{question.choices.length} で解答、Enter で次へ</p>
    </section>
  );
}

/** 広告枠のプレースホルダ。本番では AdSense 等のタグに差し替える(結果画面のみに出す方針) */
function AdSlot() {
  return <div className="ad-slot">広告枠(プレースホルダ)</div>;
}
