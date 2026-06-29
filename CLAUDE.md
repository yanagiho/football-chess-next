# CLAUDE.md — Football Chess Web

Unity版 Football Chess（サッカー×将棋の同時ターン制対戦ゲーム / GadeDev・GADE Inc.）を
Web/PWA + Cloudflare へ移植するプロジェクト。開発依頼者は**非エンジニア**。日本語で、一歩ずつ
わかる言葉で説明しながら進めること。

## 公開URL / デプロイ

- 本番: https://football-chess-next.yanagiho.workers.dev
- 遊べるゲーム（プロト）: https://football-chess-next.yanagiho.workers.dev/**play/**
- デプロイ: `npm run build && npx wrangler deploy`（wrangler は yanagiho@gade.jp で認証済み・再ログイン不要）
- 公開は外部公開にあたるため、実行前にユーザーの許可を取る。

## リポジトリ構成（2系統あることに注意）

| 場所 | 役割 |
|---|---|
| `prototype/football-chess-prototype.html` | **遊べるゲーム本体（現時点の正）**。単一HTMLにCSS+JS+base64画像を全部入れた自己完結ファイル。1人 vs COM が動く |
| `prototype/*.json`, `prototype/assets/` | プロトの素材（HTMLに埋め込み済みなので実行時は不要な中間ファイル） |
| `src/` | React + Vite + TS（**将来の本命の土台**。現状はタイトル＋静的盤面のみ。ゲームロジック未実装） |
| `public/unity/` | Unity版の画像素材・MasterData |
| `docs/` | 引き継ぎ・移植方針（`HANDOFF.md` が最重要） |
| `scripts/sync-prototype.mjs` | build/dev/preview の前に prototype を `public/play/index.html` へ自動コピー |

- 元ファイルは `prototype/` の**1つだけ**。`public/play/` は自動生成なので gitignore 済み（直接編集しない）。
- 技術スタック: React19 / Vite / TypeScript / Cloudflare Workers(+Hono) / 将来 Durable Objects・D1。

## 正典（仕様の根拠）

- Unity版リポジトリ `GadeDev/football-chess-app`（private・yanagiho権限で閲覧可）が**正典**。
  ルール/数値/操作で迷ったら Unity の C# を確認する（`Assets/_Chess/Scripts/`）。
- 方針: 広告なし・**サブスク課金**・スマホ前提。フレームワーク(Zenject/UniRx/MagicOnion)は移植せず、
  ルールは純粋ロジックとしてJS/TSへ、画像はそのまま流用。

## プロト(/play/)の実装状況

実装済み: 盤面/エリア・デフォルト編成・同時ターン制・パス連鎖・パスカット・確率テーブル・
相手AI・カットイン演出・ChessClock に加え、
- 試合構成: 前半15＋AT(0〜1) → ハーフタイム → 後半15＋AT(1〜3) → 試合終了・勝敗判定
- シュート: ゴール前遮蔽で必ずブロック → 敵DFブロック抽選 → GKセーブ(GKが必ずキャッチ)。PK=75%/FK=50%固定
- こぼれ球: 同マスの駒（複数ならコスト最大）が確保。GK/DFは自陣で前方へクリア
- オフサイド: 相手守備の後ろから2番目をライン、前方パスをライン前で受けたら確率判定→位置戻し＋守備側ボール
- 操作(Unity風): 駒タップで**駒中心に放射状メニュー**（保持駒=ドリブル/パス/シュート、非保持=移動、下に保持/キャンセル）＋選択駒を拡大、重なりは散らす

### 盤目キャリブレーション（重要）
`prototype/` 内の `FIELD={L:4.5,R:95.3,T:5.3,B:92.0}` と `cellRect()/cellCenter()` が、
field.png の白ライン実測値に基づくセル配置の単一の真実。座標→画面%変換はここに集約。
盤面の `aspect-ratio` は画像比 `705/1143`。駒位置がズレたらまず `FIELD` を調整する。

## 作業の進め方・検証

- ブラウザでの目視確認に制約がある（claude-in-chrome は localhost に到達不可、重い /play/ ページは
  スクショ/ビューポート取得が 0x0 で失敗）。**公開URLなら**テキスト取得・コンソール確認は可能。
- プロトHTML編集後の検証手順:
  1. `<script>`本文を取り出して `node --check`（構文）
  2. DOMスタブで読み込み実行しランタイムエラー確認（getElementById等をモックして eval）
  3. ロジックはnodeで小さく再現してシミュレーション（例: ターン進行・メニュー生成）
- コミットは日本語メッセージ。末尾に `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。
- ブランチは main。push はユーザー依頼時のみ。

## 最終ゴールと残課題

サブスク課金＋Web対戦（オンライン対人）。残（大）:
1. サーバー審判（Durable Objects）— 公平な課金/ランク対戦にはルール判定をサーバー側でも実行（不正防止）。
   プロトのルールJSをTS部品に抽出し client/server 共用が橋渡し。
2. アカウント/ログイン（マッチング・課金判定に必須。Unity素材にソーシャルログインあり）
3. 決済 — **未決定の分岐**: Web配信(Stripe・低手数料) vs アプリ配信(ストア課金15〜30%)。設計を左右。
4. wrangler.toml に DO/D1 バインディング追加（現状 ASSETS のみ）。

詳細は `docs/HANDOFF.md`、補足方針は `AGENTS.md` を参照。
