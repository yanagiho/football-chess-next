# CLAUDE.md — Football Chess Web版プロトタイプ 開発ガイド

Claude Code がこのリポジトリで作業する際の指針。詳細な背景は `HANDOFF.md` を参照。

## プロジェクト概要
- Unity製「Football Chess」（サッカー×将棋の同時ターン制対戦）を Web/PWA へ移植中。
- **成果物は単一ファイル `football-chess-prototype.html`**（約2.1MB、画像はbase64埋め込み、外部依存なし）。ダブルクリックで動作、スマホ対応。
- **現在の正しい作業対象はこのフォルダ**（`/Users/yanagiho-mba/football-chess-next/football-chess-repo/`）。`football-chess-next-clone` は別系統なので、このプロトタイプ修正では触らない。
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
- **シュート判定フロー**（`resolveShootCommand`）：①経路上の敵DFで確定ブロック ②PA/VAテーブルでDFブロック抽選（唯一の確率ゲート）③GK位置判定（コース差±1でキャッチ）。PK75%/FK50%固定。下部固定ボタンは廃止済み。ボール選択時の弧ポップアップ内に、シュート可能エリアにいる場合のみ「SHOOT」項目が現れ、そこから`tryShoot`を呼ぶ（`buildSelectItems`/`renderSelectFan`）。
- **こぼれ球共通処理**：`placeLooseBall`/`pickupLooseBall`（コスト最高→ホスト優先→id昇順で確保）。**クリア処理**（自陣PA/GAでの守備成功時は中盤方向へ1マス押し出し `clearPushCell`）。こぼれ球アイコン(`.ballfree`)は駒(`.piece`)と同じ「セル幅%＋max-width上限」方式でサイズ指定（固定pxではない。画面幅変化に連動）。
- **オフサイド**：方向補正済み `calcOffside`（`attackDir`でチーム別）＋成立後処理 `handleOffside`（位置戻し＋こぼれ球）。通常パス着地で自動判定。
- **15ターン制**：前半15＋AT(0〜1)、後半15＋AT(1〜3)。ChessClockはAT中「45+N」「90+N」表記。
- **選択UI（Unity風＋独自調整）**：マスタップ→**弧状ポップアップ**で駒/ボールを選択（`renderSelectFan`/`#selectFan`、-60°〜+60°の弧）。駒1体のみは1タップで即選択。項目2つ以上は「タップ→弧→項目タップ（ポップ演出）→選択確定→範囲表示」。**選択確定後にのみ**移動/パス範囲をハイライト（大きな脈動円）。範囲外タップでキャンセル。ボールは常に独立項目（保持球は保持駒の隣、こぼれ球は独立）。
  - `onPieceClick`は、駒選択中に「有効な移動先/パス先として、相手駒や別の自駒が乗っているマス」をタップした場合、`onCellClick`と同じ判定（`isMovable`/`isPassable`）を先に行ってから通す。個別駒のクリックハンドラが`stopPropagation`でマスのクリックを奪うため、この処理がないと「相手駒のいるマスへ移動/パスできない」バグになる。
- **移動先/パス先ゴースト**：自分の予約コマンドの移動先/パス先に半透明プレビュー（`.ghost`、input時のみ・自分のみ）。既存駒より手前(z-index高め)・点線の丸枠＋点滅・セル中心から少しオフセットして描画し、既存駒と重なっても視認できるようにしている。
- 演出（カットイン）は、パス／ドリブルとも「経路上または着地/移動先マスに敵駒がいて、実際に競り合い・奪取判定が起こり得る場合」のみ発火（`hasDefensiveContact`）。敵が誰もいない「素通り」では出さない。
- **コマンド種別(type)の決定原則（重要・複数回の回帰の元凶）**：`move`/`dribble`/`pass`/`throughpass`のtypeは、常に「ユーザーがどの行動を選んだか」だけで決まる。仕込み側(`movePiece`)・実行側(`execCommand`)のどちらも、実行時のライブなボール保持状態(`ballHolder()`)を見て暗黙にtypeを上書きしてはならない。スルーパス（`doPassToCell`、スペースへのパス）は`movePiece`を一切経由しない別経路。過去に「ballHolder()でcarryを上書きする」修正を入れて別のバグを誘発したことがあるため、今後この手のライブ状態参照は要注意。
- パス／スルーパス予約済みの駒（`chainPassedIds`で記録）は、同じターンに通常移動を追加できる。スペースへのスルーパス後にパスを出した駒を走らせても、`throughpass`を消さず`move`を追加する。ドリブルは「ボールを運ぶ」操作なので、同じ駒のパス/シュートとは排他。

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
- Codexで継続する場合は、実装・検証・ローカルURL確認までこの単一HTML版で完結させる。演出移植はUnity C#を調べ、ボール軌跡・駒移動・カットインなど小さい単位で移す。
- Git運用：ローカルで `git init` 済み（現在 `master`）。**リモートPushはユーザー自身の環境で**（`PUSH_GUIDE.md` 参照）。
