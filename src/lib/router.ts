import { useEffect, useState } from "react";

/**
 * ハッシュ方式のルーター。静的ホスティング(Cloudflare Pages)でリライト設定なしに動かすため。
 * 例: #/  #/quiz/basics  #/review  #/stats
 */
export function useRoute(): string[] {
  const [segments, setSegments] = useState(() => parse(location.hash));
  useEffect(() => {
    const onChange = () => setSegments(parse(location.hash));
    addEventListener("hashchange", onChange);
    return () => removeEventListener("hashchange", onChange);
  }, []);
  return segments;
}

function parse(hash: string): string[] {
  return hash.replace(/^#/, "").split("?")[0].split("/").filter(Boolean);
}

export function navigate(path: string): void {
  location.hash = path;
}
