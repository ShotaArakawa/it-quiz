import type { QuestionSet } from "../lib/types.ts";

/**
 * サンプル問題。すべてこのリポジトリ用に書いたオリジナル問題で、
 * 市販の問題集や過去問の文面は使っていない。
 * 本実装では問題データを Supabase(または R2 の JSON)から取得する想定。
 */
export const QUESTION_SETS: QuestionSet[] = [
  {
    id: "basics",
    title: "基礎理論・ネットワーク(サンプル)",
    description: "基数変換、稼働率、プロトコルなどの基本問題",
    premium: false,
    trialCount: 0,
    questions: [
      {
        id: "basics-01",
        category: "基礎理論",
        text: "2進数の 1011 を10進数で表したものはどれか。",
        choices: ["9", "10", "11", "13"],
        answer: 2,
        explanation: "1011 = 1×8 + 0×4 + 1×2 + 1×1 = 11。",
      },
      {
        id: "basics-02",
        category: "基礎理論",
        text: "3ビットで表せる状態は何通りか。",
        choices: ["3通り", "6通り", "8通り", "9通り"],
        answer: 2,
        explanation: "1ビットあたり2通りなので、2×2×2 = 8通り。",
      },
      {
        id: "basics-03",
        category: "システム構成",
        text: "稼働率 0.9 の装置を2台、直列につないだシステム全体の稼働率はどれか。",
        choices: ["0.81", "0.90", "0.95", "0.99"],
        answer: 0,
        explanation: "直列は両方が動いている必要があるので 0.9 × 0.9 = 0.81。並列なら 1 − 0.1 × 0.1 = 0.99 になる。",
      },
      {
        id: "basics-04",
        category: "ネットワーク",
        text: "IPアドレスから、同じネットワーク上の機器のMACアドレスを調べるためのプロトコルはどれか。",
        choices: ["DNS", "DHCP", "ARP", "NTP"],
        answer: 2,
        explanation: "ARP は IP アドレスに対応する MAC アドレスを問い合わせる。DNS は名前解決、DHCP はアドレスの自動割り当て、NTP は時刻合わせ。",
      },
      {
        id: "basics-05",
        category: "アルゴリズム",
        text: "最後に入れたデータを最初に取り出す(後入れ先出し)データ構造はどれか。",
        choices: ["キュー", "スタック", "連結リスト", "二分探索木"],
        answer: 1,
        explanation: "スタックは後入れ先出し(LIFO)。キューは先入れ先出し(FIFO)。",
      },
      {
        id: "basics-06",
        category: "データベース",
        text: "関係データベースの主キーの性質として正しいものはどれか。",
        choices: [
          "値の重複を許し、NULLも許す",
          "値の重複を許さず、NULLは許さない",
          "値の重複を許さないが、NULLは許す",
          "1つの表に必ず複数設定する",
        ],
        answer: 1,
        explanation: "主キーは行を一意に特定するため、重複も NULL も許されない。",
      },
    ],
  },
  {
    id: "security",
    title: "セキュリティ集中(有料セットの見本)",
    description: "暗号・認証・攻撃手法。購入前はお試し2問まで",
    premium: true,
    trialCount: 2,
    questions: [
      {
        id: "security-01",
        category: "セキュリティ",
        text: "情報セキュリティの3要素のうち「可用性」の説明として適切なものはどれか。",
        choices: [
          "許可された人だけが情報を見られること",
          "情報が正確で改ざんされていないこと",
          "必要な時に情報やシステムを使えること",
          "操作した人を後から特定できること",
        ],
        answer: 2,
        explanation: "可用性は「使いたい時に使えること」。1つ目は機密性、2つ目は完全性の説明。",
      },
      {
        id: "security-02",
        category: "セキュリティ",
        text: "公開鍵暗号方式でデジタル署名を作成する時に、送信者が使う鍵はどれか。",
        choices: ["送信者の秘密鍵", "送信者の公開鍵", "受信者の秘密鍵", "受信者の公開鍵"],
        answer: 0,
        explanation: "署名は送信者の秘密鍵で作り、受信者は送信者の公開鍵で検証する。",
      },
      {
        id: "security-03",
        category: "セキュリティ",
        text: "SQLインジェクションへの対策として最も有効なものはどれか。",
        choices: [
          "パスワードを定期的に変更する",
          "プレースホルダ(バインド機構)でSQLを組み立てる",
          "通信をTLSで暗号化する",
          "エラーページのデザインを統一する",
        ],
        answer: 1,
        explanation: "入力値をSQL文の一部として解釈させないことが根本対策。TLSは通信路の盗聴対策で、SQLインジェクションは防げない。",
      },
      {
        id: "security-04",
        category: "セキュリティ",
        text: "実在する企業を装ったメールで偽サイトへ誘導し、IDやパスワードを入力させる攻撃はどれか。",
        choices: ["フィッシング", "DoS攻撃", "ブルートフォース攻撃", "ゼロデイ攻撃"],
        answer: 0,
        explanation: "フィッシングは偽の連絡で偽サイトへ誘導し、認証情報などをだまし取る手口。",
      },
    ],
  },
];

export function findSet(id: string): QuestionSet | undefined {
  return QUESTION_SETS.find((s) => s.id === id);
}

export const ALL_QUESTIONS = QUESTION_SETS.flatMap((s) => s.questions);
