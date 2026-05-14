# Gender Reveal Static Site

Next.js static export (`output: export`) で動作する、URL hash + AES クライアント復号方式のジェンダーリビールサービス。

## 要件対応

- GitHub Pages: `next build` で `docs/` 出力してそのまま配信
- URL共有: 生成リンクを共有するだけで閲覧可能
- 性別がURLから直接わからない: 性別含む本文はAES-GCM暗号文に格納
- URL hash 利用: `#d=...&k=...` を利用
- データAES暗号化: Web Crypto API で AES-256-GCM
- 復号はクライアント側のみ: `window.location.hash` をブラウザで復号
- テンプレート切り替え: bear/star/pop の3種
- reveal前後別メッセージ: before/reveal/afterを個別設定
- Next.js static export対応: `next.config.ts` で `output: "export"`

## 開発

```bash
npm install
npm run dev
```

## デプロイ（GitHub Pages）

```bash
# ローカル確認（ルート配信想定）
npm run build

# GitHub Pages（/gender-reveal 配下で配信）
BASE_PATH=/gender-reveal npm run build
# docs/ を Pages に公開
```
