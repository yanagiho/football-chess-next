# CLAUDE.md — Football Chess Web版プロトタイプ 開発ガイド

Claude Code がこのリポジトリで作業する際の指針。詳細な背景は `HANDOFF.md` を参照。

## プロジェクト概要
- Unity製「Football Chess」（サッカー×将棋の同時ターン制対戦）を Web/PWA へ移植中。
- **成果物は単一ファイル `football-chess-prototype.html`**（約2.1MB、画像はbase64埋め込み、外部依存なし）。ダブルクリックで動作、スマホ対応。
- 方針：広告なし・サブスク課金・スマホ前提。**「面白く楽しめればよい、細部はおまかせ」**。グラフィック再現を重視。
- 正典＝Unity版実装。Unityソースは `/Users/yanagiho-mba/football-chess-unity-source/`（`Assets/_Chess/Scripts/`）。数値が食い違う場合は基本Unity実装を優先（ただしGDDが正のケースもある。例: 1マス最大4駒）。
- ユーザーは非エンジニア。**日本語で対応**。

## アーキテクチャ（単一HTML内）
- CSS+JS全部入り。ロジックは1つの `<script>` ブロック（末尾付近）。
- 状態は `state` オブジェクト：`turn/half/scoreSelf/scoreOpp/selected/mode/expanded/ballSelected/popup/atFirst/atSecond/matchOver/phase`。
  - `phase`: `'input'`（仕込み中）/ `'replay'`（再生中）/ `'ended'`（試合終了）。
- 重要グローバル：`myCommands`/`oppCommands`（予約操作）、`chainHolderId`（論理ボール保持駒）、`ball`（`{target:'piece'|'cell', pieceId, x, y}`）、`MAX_PER_CELL=4`、`REGULAR_TURNS=15`、`COLS`(5列)/`ROWS`(8行)、`BOARD`(エリア定義)。
- 盤座標：青(b)は -Y 方向（敵ゴール y=-3）へ攻める／赤(r)は +Y 方向（自ゴール y=4）へ。`.board` のCSSアスペクト比は画像実寸に合わせ `705/1143`。

## 実装済み機能（このプロトタイプの現状）
- 盤面/エリア、デフォルト編成、Unity駒画像、ボール2状態、パス範囲24方向、確率テーブル一式。
- **同時ターン制**（仕込み→AI裏で計画→「TURN END（決定）」でマージ→リプレイ再生）。
- **シュート判定フロー**（`resolveShootCommand`）：①経路上の敵DFで確定ブロック ②PA/VAテーブルでDFブロック抽選（唯一の確率ゲート）③GK位置判定（コース差±1でキャッチ）。PK75%/FK50%固定。
- **こぼれ球共通処理**：`placeLooseBall`/`pickupLooseBall`（コスト最高→ホスト優先→id昇順で確保）。**クリア処理**（自陣PA/GAでの守備成功時は中盤方向へ1マス押し出し `clearPushCell`）。
- **オフサイド**：方向補正済み `calcOffside`（`attackDir`でチーム別）＋成立後処理 `handleOffside`（位置戻し＋こぼれ球）。通常パス着地で自動判定。
- **15ターン制**：前半15＋AT(0〜1)、後半15＋AT(1〜3)。ChessClockはAT中「45+N」「90+N」表記。
- **選択UI（Unity風＋独自調整）**：マスタップ→**弧状ポップアップ**で駒/ボールを選択（`renderSelectFan`/`#selectFan`、-60°〜+60°の弧）。駒1体のみは1タップで即選択。項目2つ以上は「タップ→弧→項目タップ（ポップ演出）→選択確定→範囲表示」。**選択確定後にのみ**移動/パス範囲をハイライト（大きな脈動円）。範囲外タップでキャンセル。ボールは常に独立項目（保持球は保持駒の隣、こぼれ球は独立）。
- **移動先ゴースト**：自分の予約コマンドの移動先/パス先に半透明プレビュー（`.ghost`、input時のみ・自分のみ）。
- 演出は駒座標追従のカットイン（`showCutinAtPiece`）。

## 検証方法
- **構文チェック**：`<script>`〜`</script>` を抽出して `node --check`。
  ```bash
  S=$(grep -n "<script>" football-chess-prototype.html | tail -1 | cut -d: -f1)
  E=$(grep -n "</script>" football-chess-prototype.html | tail -1 | cut -d: -f1)
  awk -v s="$S" -v e="$E" 'NR>s && NR<e' football-chess-prototype.html > /tmp/fc.js
  node --check /tmp/fc.js
  ```
- **ロジック検証**：DOMをスタブ化して `eval` し、対象関数を実行時テスト（このリポジトリでの標準手法）。
- **⚠ ブラウザ実描画の確認**：Claude Code のこの環境からは**ローカルの `prototype.html` を起動・スクリーンショットできない**（拡張機能のChromeがローカルファイル/サーバーに到達不可）。見た目の最終確認はユーザーに `! open <path>` で依頼し、必要ならスクリーンショットを貼ってもらう。

## 編集上の注意
- 画像base64を含む巨大な行があるため、`Read` は範囲指定で。`cat`/`sed` での全文出力は避ける。
- 内部ロジック（移動可否/パス範囲/確率/コマンド確定）の変更は慎重に。UI改修時は「表示のみ変更、ロジック不変」を原則とする。
- Git運用：ローカルで `git init` 済み（現在 `master`）。**リモートPushはユーザー自身の環境で**（`PUSH_GUIDE.md` 参照）。
