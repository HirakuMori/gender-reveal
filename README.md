# Gender Reveal Static Site

Next.js を廃止し、プレーンな HTML / CSS / JavaScript で動作する静的サイトに変更しました。

## 要件対応

- GitHub Pages: `npm run build` で `docs/` 出力してそのまま配信
- URL共有: 生成リンクを共有するだけで閲覧可能
- 性別がURLから直接わからない: 性別含む本文はAES-GCM暗号文に格納
- URL hash 利用: `#d=...&k=...` を利用
- データAES暗号化: Web Crypto API で AES-256-GCM
- 復号はクライアント側のみ: `window.location.hash` をブラウザで復号

## 開発

```bash
npm run dev
```

## デプロイ（GitHub Pages）

```bash
npm run build
# docs/ を Pages に公開
```
