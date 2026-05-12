"use client";

import { useEffect, useMemo, useState } from "react";

type Gender = "boy" | "girl";
type ThemeId = "bear" | "star" | "pop";

type Payload = {
  v: 1;
  gender: Gender;
  theme: ThemeId;
  beforeTitle: string;
  beforeSub?: string;
  revealTitle: string;
  revealSub?: string;
  afterTitle: string;
  afterSub?: string;
};

type Theme = {
  id: ThemeId;
  name: string;
  bg: string;
  card: string;
};

const THEMES: Theme[] = [
  { id: "bear", name: "Little Bear", bg: "#f8f3ed", card: "#e8f0ff" },
  { id: "star", name: "Star Reveal", bg: "#0f163a", card: "#1f2b6b" },
  { id: "pop", name: "Pop Party", bg: "#fff4ea", card: "#fff" }
];

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64url(bytes: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromB64url(input: string): Uint8Array {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const text = atob(base64);
  return Uint8Array.from(text, (c) => c.charCodeAt(0));
}

async function deriveKey(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey("raw", enc.encode(secret), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: 150000 },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptPayload(payload: Payload, secret: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(secret, salt);
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(payload)));
  const out = new Uint8Array(salt.length + iv.length + cipher.byteLength);
  out.set(salt, 0);
  out.set(iv, salt.length);
  out.set(new Uint8Array(cipher), salt.length + iv.length);
  return b64url(out);
}

async function decryptPayload(token: string, secret: string): Promise<Payload> {
  const bytes = fromB64url(token);
  const salt = bytes.slice(0, 16);
  const iv = bytes.slice(16, 28);
  const cipher = bytes.slice(28);
  const key = await deriveKey(secret, salt);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  return JSON.parse(dec.decode(plain)) as Payload;
}

const initial: Payload = {
  v: 1,
  gender: "girl",
  theme: "bear",
  beforeTitle: "赤ちゃんからメッセージが届いてるよ",
  beforeSub: "タップして開いてね",
  revealTitle: "It's a Girl!",
  revealSub: "女の子です",
  afterTitle: "これからもよろしくね♡",
  afterSub: "from T & K"
};

export default function Page() {
  const [secret, setSecret] = useState("baby2026");
  const [data, setData] = useState<Payload>(initial);
  const [resultUrl, setResultUrl] = useState("");
  const [viewData, setViewData] = useState<Payload | null>(null);
  const [phase, setPhase] = useState<"before" | "reveal" | "after">("before");
  const [err, setErr] = useState("");

  const theme = useMemo(() => THEMES.find((t) => t.id === (viewData?.theme ?? data.theme)) ?? THEMES[0], [viewData, data.theme]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const token = params.get("d");
    const key = params.get("k");
    if (!token || !key) return;
    decryptPayload(token, key)
      .then((p) => {
        setViewData(p);
        setPhase("before");
      })
      .catch(() => setErr("リンクの復号に失敗しました。URLが壊れている可能性があります。"));
  }, []);

  const makeUrl = async () => {
    setErr("");
    const token = await encryptPayload(data, secret);
    const u = `${window.location.origin}${window.location.pathname}#d=${token}&k=${encodeURIComponent(secret)}`;
    setResultUrl(u);
  };

  if (viewData) {
    return (
      <main className="view" style={{ background: theme.bg, color: theme.id === "star" ? "#fff" : "#432" }}>
        <section className="card" style={{ background: theme.card }}>
          {phase === "before" && <><h1>{viewData.beforeTitle}</h1><p>{viewData.beforeSub}</p><button onClick={() => setPhase("reveal")}>オープンする</button></>}
          {phase === "reveal" && <><h1>{viewData.revealTitle}</h1><p>{viewData.revealSub}</p><button onClick={() => setPhase("after")}>つぎへ</button></>}
          {phase === "after" && <><h1>{viewData.afterTitle}</h1><p>{viewData.afterSub}</p></>}
        </section>
      </main>
    );
  }

  return (
    <main className="builder">
      <h1>静的ジェンダーリビールリンク作成</h1>
      <p>URL hash + AES で、性別がURLパスやクエリに見えないリンクを作れます。</p>
      <label>テンプレート
        <select value={data.theme} onChange={(e) => setData({ ...data, theme: e.target.value as ThemeId })}>
          {THEMES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </label>
      <label>秘密鍵（共有相手とだけ共有）
        <input value={secret} onChange={(e) => setSecret(e.target.value)} />
      </label>
      <label>オープン前メッセージ
        <input value={data.beforeTitle} onChange={(e) => setData({ ...data, beforeTitle: e.target.value })} />
      </label>
      <label>オープン後（性別）メッセージ
        <input value={data.revealTitle} onChange={(e) => setData({ ...data, revealTitle: e.target.value })} />
      </label>
      <label>最後のメッセージ
        <input value={data.afterTitle} onChange={(e) => setData({ ...data, afterTitle: e.target.value })} />
      </label>
      <button onClick={makeUrl}>リンク生成</button>
      {resultUrl && <textarea readOnly value={resultUrl} rows={5} />}
      {err && <p className="err">{err}</p>}
    </main>
  );
}
