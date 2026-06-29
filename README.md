# Football Chess Web Port

Unity版 Football Chess をWeb/PWA + Cloudflareで移植する新規プロジェクト。

## 方針

- Unity版 `GadeDev/football-chess-app` のゲーム体験、ルール、画像素材、MasterDataを正典として扱う
- Football Chess ManiacS の画像素材やHEX盤面は使用しない
- サーバーは Cloudflare Workers / Durable Objects / D1 を中心に構成する
- 広告は入れず、サブスク課金を基本にする
- COM AI、マッチング、ランキングを重点的に強化する

## 初期セットアップ

```bash
npm install
npm run dev
```

## 参照元

- Unity版: `GadeDev/football-chess-app`

## 現在の状態

- Vite + React + TypeScript の最小構成
- Cloudflare Worker のヘルスチェック入口
- Unity版の `Static/Texture` と `MasterData` を取り込み済み
- Unity版のタイトル、縦長フィールド、駒、HUD画像を使った初期移植画面
