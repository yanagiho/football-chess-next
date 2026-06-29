# Football Chess Next

Unity版 Football Chess を基本方針として踏襲し、Web/PWA + Cloudflare で再構成する新規プロジェクト。

## 方針

- Unity版のゲーム体験、ルール、世界観を正典として扱う
- 既存 Football Chess ManiacS の実装とデザイン素材は必要な範囲で流用する
- サーバーは Cloudflare Workers / Durable Objects / D1 を中心に構成する
- 広告は入れず、サブスク課金を基本にする
- COM AI、マッチング、ランキングを重点的に強化する

## 初期セットアップ

```bash
npm install
npm run dev
```

## 参照元

- 既存Web版: `yanagiho/football-chess-maniacs`
- Unity版: `GadeDev/football-chess-app`

## 現在の状態

- Vite + React + TypeScript の最小構成
- Cloudflare Worker のヘルスチェック入口
- 既存FCMSのデザイン素材を流用する前提
- コマ選択と周辺コマンド表示の初期プロトタイプ

