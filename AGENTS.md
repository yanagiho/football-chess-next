# AGENTS.md — Football Chess Next

このプロジェクトは、Unity版 Football Chess をWeb/PWA + Cloudflareで再構成する新規プロジェクト。

## 基本方針

- Unity版のゲーム体験、サッカールール、世界観を優先する
- 既存 Football Chess ManiacS は参照元・部品取り元として扱う
- デザイン素材は既存FCMSから基本的に流用する
- Cloudflare Workers / Durable Objects / D1 をサーバー基盤にする
- 広告モデルは採用しない
- サブスク課金を基本にする

## 作業ルール

- 仕様の根幹は `docs/unity_web_porting_roadmap.md` を確認する
- Unity版からの移植仕様とFCMSからの再利用実装を混同しない
- UIはスマホ操作を最初から前提にする
- コマンドは画面端ではなく、選択したコマの周辺に表示する
- 課金要素はランクマッチの公平性を壊さない

## 初期ドメイン

- `src/` — WebクライアントとCloudflare Workerの入口
- `public/assets/` — 流用デザイン素材
- `docs/` — 移植方針、ルール調査、仕様判断

