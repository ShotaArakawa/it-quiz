/** 1問分のデータ。answer は choices の添字(0始まり) */
export interface Question {
  id: string;
  category: string;
  text: string;
  choices: string[];
  answer: number;
  explanation: string;
}

/** 問題セット。premium のセットは購入前は trialCount 問まで解ける */
export interface QuestionSet {
  id: string;
  title: string;
  description: string;
  premium: boolean;
  trialCount: number;
  questions: Question[];
}

/** 間違えた問題の記録。復習で連続正解(reviewStreak)が規定数に達したら外す */
export interface MissEntry {
  questionId: string;
  missCount: number;
  lastMissedAt: number;
  reviewStreak: number;
}

export interface AnswerTally {
  correct: number;
  wrong: number;
}

export interface Progress {
  /** 問題ごとの正解・不正解回数 */
  tally: Record<string, AnswerTally>;
  /** 復習リスト(問題ID → 記録) */
  misses: Record<string, MissEntry>;
  /** 購入済み(雛形ではデモ用の解放フラグ)のセットID */
  unlockedSets: string[];
}

/** 演習1回分の解答結果 */
export interface AnswerResult {
  questionId: string;
  chosen: number;
  correct: boolean;
}
