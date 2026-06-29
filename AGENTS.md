# AGENTS.md — Football Chess Web Port

このプロジェクトは、Unity版 Football Chess をWeb/PWA + Cloudflareで再構成する新規プロジェクト。

## 基本方針

- Unity版 `GadeDev/football-chess-app` のゲーム体験、サッカールール、画像素材、MasterDataを優先する
- 既存 Football Chess ManiacS のHEX盤面・駒画像・UI素材は使用しない
- 実装に迷った場合はUnity版C#コードとUnity版画像を正典とする
- Cloudflare Workers / Durable Objects / D1 をサーバー基盤にする
- 広告モデルは採用しない
- サブスク課金を基本にする

## 作業ルール

- 仕様の根幹は `docs/unity_web_porting_roadmap.md` を確認する
- Unity版からの移植仕様とWeb向け追加仕様を混同しない
- UIはスマホ操作を最初から前提にする
- Unity版と異なる見た目を入れる前に、必ず理由を明文化する
- 課金要素はランクマッチの公平性を壊さない

## 初期ドメイン

- `src/` — WebクライアントとCloudflare Workerの入口
- `public/unity/Static/Texture/` — Unity版画像素材
- `public/unity/MasterData/` — Unity版MasterData
- `docs/` — 移植方針、ルール調査、仕様判断
