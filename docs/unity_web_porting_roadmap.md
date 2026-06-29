# Football Chess Web Port ロードマップ

作成日: 2026-06-29

## 目的

Unity版 Football Chess をWeb/PWAへ移植する。

このプロジェクトでは、Unity版 `GadeDev/football-chess-app` の画像素材、MasterData、C#実装を正典として扱う。

## 固定方針

- Football Chess ManiacS のHEX盤面、駒画像、UI素材は使用しない
- Unity版の縦長フィールド、5列x6段セル、上下ゴール構造を再現する
- Unity版の `Static/Texture` をWeb公開資産として使う
- Unity版の `MasterData` を初期データとして使う
- Unity版のC#ロジックをTypeScriptへ段階的に移植する
- サーバーはCloudflare Workers / Durable Objects / D1を基本にする
- 広告は入れず、サブスク課金を基本にする

## 初期フェーズ

1. Unity版画像素材をWebで表示する
2. Unity版のタイトル画面を再現する
3. Unity版の盤面、駒、HUDを再現する
4. `BoardDef.Map` と `CellPosition` をTypeScript化する
5. `DefaultTeamMaster.json` から初期配置する
6. 駒選択、移動先選択、キック選択を実装する

## ルール移植フェーズ

1. 移動可能セル
2. キック / パス
3. シュート
4. タックル
5. ファウル
6. オフサイド
7. 遅延行為
8. 消極的戦術
9. FK / CK / PK
10. 試合時間、ハーフタイム、AT、終了処理

## オンライン化フェーズ

1. ローカルCOM戦
2. Durable Objectsによるゲームセッション
3. マッチング
4. ランキング
5. リプレイ保存
6. サブスク権利管理

## 注意

完全移植は一度に終わる作業ではない。

ただし、本プロジェクトの方向性は「FCMSを改造する」ではなく、「Unity版 Football Chess をWebへ移植する」で固定する。
