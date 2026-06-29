# Football Chess — Web移植プロジェクト 引き継ぎ資料 (HANDOFF)

最終更新: 2026-06-29

---

## 1. プロジェクト概要

Unity製ゲーム「Football Chess」（サッカー×将棋の同時ターン制対戦ゲーム / GadeDev・GADE Inc.）を、
Web/PWA + Cloudflare 構成へ移植するプロジェクト。

- **方針**: 広告なし・サブスク課金・スマホ前提
- **正典（最優先の仕様根拠）**: **Unity版の実装**。GDDは初期構想であり、数値が食い違う場合は基本Unity実装を優先する（ただしGDDが正のケースもある。例: 1マス最大コマ数=4 はGDD準拠）
- **最終ゴール**: 「面白く楽しめればよい、細部はおまかせ」。特に**グラフィックの作り込み（タイマー等）の再現を重視**
- **過去の失敗**: 以前Codexで挫折。真因は画像流用ではなく、Zenject/UniRx/MagicOnion など重量級フレームワークごと移植しようとしたこと
- **正しい方針**: 画像はそのままコピー流用、ルールとデータは純粋ロジックとしてJSへ移植、フレームワークは捨てる

### 関連リポジトリ
- 元のUnityリポジトリ: GadeDev/football-chess-app
- 既存のNext.jsリポジトリ: https://github.com/yanagiho/football-chess-next

---

## 2. 現在の成果物

**単一HTMLファイル**: `football-chess-prototype.html`（約2.1MB）
- ダブルクリックで動作、スマホ対応、外部依存なし
- 画像はすべてbase64で埋め込み済み（駒・カットイン演出・UI素材・ChessClock）

### ファイル構成（このリポジトリ）
```
football-chess-prototype.html   ← 本体（これが成果物）
HANDOFF.md                      ← 本資料
imgdata.json / imgdata.js       ← 駒画像のbase64（素材ソース）
cutins.json                     ← カットイン演出18種のbase64（素材ソース）
ui_assets.json                  ← フィールド/HUD/ボタン素材のbase64（素材ソース）
clock_assets.json               ← ChessClock(試合時計)素材のbase64（素材ソース）
assets/                         ← 補助素材
```
※ `*.json` は素材の中間ファイル。本体HTMLには既に埋め込み済みなので、HTML単体で動く。

---

## 3. 移植済みのUnity正典ルール（すべて実装・検証済み）

すべて Unity の `Assets/_Chess/Scripts/` から忠実移植。

| 項目 | 内容 | 出典ファイル |
|---|---|---|
| 盤面 | 5列×6行=25マス(X:-2..2,Y:-3..4)+ゴール2マス。エリア=Normal/PA/VA(バイタル)/GA/Cross/Goal | BoardDef.cs |
| 最大コマ数 | **4**（Unity定数は3だが配置オフセットは4体分定義あり→GDD準拠で4採用）。4体=四隅、5体目は満員で弾く | CellDef.cs |
| 駒 | FW/MF/DF/GK × コスト1,1.5,2,2.5,3（計20種）。デフォルト11人編成 | PieceMaster.json |
| 移動 | 上下左右1マス。コスト3のみ斜めも(8方向)。ターン開始位置基準、1ターン1回 | PieceMoveLimitDef |
| パス範囲 | ルーク型(縦横2)+ビショップ型(斜め2)+ナイト型=計24方向 | BallMoveLimitDef |
| ボール2状態 | Piece(駒保持)/Cell(マス単独) | BallModel.cs |
| 確率計算 | コスト→indexの行列テーブル。着地パス/通過パス/タックル/シュート(PA/VA)/PK/FK/CK/オフサイド/Buff | ProbabilityCalculator.cs + JSON |
| 同時ターン制 | ホスト/ゲスト操作を交互マージ→「移動後にパス受けた駒→移動以外→残り移動」順ソート→上から再生 | StateBattleCalculate.cs |
| パス連鎖 | パスは移動と独立(hasBallなら蹴れる)。連鎖継続条件=「パス先に敵がいない or まだ一度もパスしてない」 | PieceModel.cs |
| パスカット経路 | GetRoute()で経路中間マスを出し、各敵マスで「100-通過成功率」のカット率抽選。GKのGAパスは100%カット | PassToCellAsync |
| 相手AI | StmBattleRandomAICommandCalculate.cs(299行)を採用。駒ごとに止まる/移動/パス/スルーパス/シュート抽選 | (同左) |

※Foul/AdditionalTimeのJSONはZIP未収録のため近似値を使用（Foul: 1人10%/2人20%/3人30%）。

---

## 4. プロトタイプ実装状況

### ✅ 完成・検証済み（COMPLETED）
- 盤面/エリア区分、デフォルト編成、Unity駒画像流用
- ボール2状態、パス範囲24方向、全確率計算テーブル
- 同一マス複数駒の展開選択（人数バッジ表示）、移動ルール（開始位置基準・コスト別範囲）
- **最大4コマ**（MAX_PER_CELL=4、四隅配置、満員判定）
- **同時ターン制**（仕込み→相手AI裏で計画→「決定（実行）」でマージ→リプレイ再生）。予約駒に緑✓
- **パス連鎖（ボール回し）**（未行動の味方へ連鎖、ドリブルも連鎖継続）
- **「ここで保持」ボタン**（連鎖終了し保持確定）
- **パスカット経路判定**（経路上の敵で停止＆奪取、敵を通り越すと取られる）
- **カットイン演出**（Unity画像19種、キュー方式で順次再生。AIの行動にも付与）
- **Unity版グラフィックUI**：field.png背景、上部HUD（スコア青赤・タイマーバー）、下部ボタン（決定=青光沢/シュート=金/各種ghost）
- **ChessClock（試合時計）**：game_time_bar.png（円形レインボー文字盤）+ game_time_bar_frame.png（MATCH TIMEフレーム）。針が経過時間で回転、中央に分数表示。GDDの「1ターン3分・15ターンで前半45分」準拠で90分一周

### ⏳ 未着手・要検討（PENDING）
GDD準拠で試合の締まり・納得感に効く部分（おまかせ方針なので実装裁量あり）:
1. **ターン構成の正規化**: 現在は仮の9ターンで前後半切替。→ GDDの「15ターンで前半、AT0〜1、後半15ターン、AT1〜3」へ
2. **シュート周りの作り込み**: DFブロック→GKセーブの二段チェック、ゴール前遮蔽で必ずブロック、GK必ずキャッチ、PK75%/FK50%固定確率
3. **フリーボールの所有者決定**: こぼれ球を、そのマスに入ったコマ／複数ならコストの高い方が拾う
4. オフサイドの位置戻し、クリア処理、敵マスでの連鎖制限の厳密化、演出を駒の上に表示

### 🔮 将来構想
- Next.jsリポジトリ(yanagiho/football-chess-next)への移植設計
- Cloudflare上での対戦機能・サブスク課金化
- イロレーティングによるマッチング

---

## 5. 技術メモ（次に作業する人へ）

- **アーキテクチャ**: 単一HTMLにCSS+JS全部入り。状態は `state` オブジェクト。`state.phase = 'input' | 'replay'`
- **重要なグローバル**: `myCommands`/`oppCommands`（操作配列）、`chainHolderId`（論理ボール保持駒）、`MAX_PER_CELL=4`
- **画像の埋め込み方**: 素材は `*.json` から base64 を読み、HTMLの `:root` にCSS変数（`--fieldImg` 等）として注入。要素の `background-image:var(--xxx)` で表示
- **ChessClockの仕組み**: `.chessClock` 内に `.clockDial`(文字盤) `.clockFrame`(枠) `.clockHand`(針) `.clockMin`(分数)。針は `render()` 内で `rotate((mm/90)*360deg)`
- **検証方法**: ①python構文チェック ②`node --check` ③DOMスタブ（createElement/getElementById/setTimeout等をモック）でeval実行しランタイムエラー確認
- **作業フロー**: 編集は `/home/claude/proto/` で行い、完成版を `/mnt/user-data/outputs/` へコピーして提示
- **ユーザー**: 非エンジニア。日本語で対応。行き来とコピペを最小化したい。グラフィック再現を重視

### Unityソースの場所（このコンテナ内・参照用）
`/home/claude/unity/football-chess-app-master/`
- ゲーム本体ロジック: `Assets/_Chess/Scripts/`
- 画像素材: `Assets/_ChessBundles/Resources/Static/Texture/002_InGame/`
  - `field.png`, `Hud/`（time_bar, score_bg, game_time_bar, turn_end_btn, shoot_btn 等）
  - `Piece/`（fw/mf/df/gk × b/r）, `Ball/`, `Cost/`, `cutin/`（演出18種）

---

## 6. このリポジトリのGit運用について

このリポジトリは Claude のコンテナ内でローカルに `git init` しコミットしたもの。
**リモートへのPushはユーザー自身の環境で行う**（認証情報を要するため）。手順は同梱の `PUSH_GUIDE.md` を参照。
