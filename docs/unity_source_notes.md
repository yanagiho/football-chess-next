# Unity版ソース調査メモ

調査元: `GadeDev/football-chess-app`

## 正典として扱う場所

- 画像: `Assets/_ChessBundles/Resources/Static/Texture`
- MasterData: `Assets/StreamingAssets/MasterData`
- 盤面定義: `Assets/_Chess/Scripts/Data/Def/BoardDef.cs`
- セル定義: `Assets/_Chess/Scripts/Data/Def/CellDef.cs`
- 駒定義: `Assets/_Chess/Scripts/Data/Def/PieceDef.cs`
- 座標反転: `Assets/_Chess/Scripts/Domain/Calculator/BoardCalculator.cs`
- 画面構成: `Assets/Scenes`

## 盤面

Unity版はHEXではなく、`CellPosition(x, y)` による小さな抽象サッカー盤を使う。

- 通常セル: 5列 x 6段
- x: `-2` から `2`
- y: `-2` から `3`
- 上ゴール: `(0, -3)`
- 下ゴール: `(0, 4)`

## 座標反転

`BoardCalculator.Flip()` は `FlipX()` と `FlipY()` を組み合わせる。

```text
FlipX: x = -x
FlipY: y = -y + 1
```

そのため、相手側初期配置を自分側に反転する場合は `(-x, -y + 1)` を使う。

## 駒表示

Unity版の駒は以下を重ねて表示する。

- ポジション画像: `002_InGame/Piece/fw_b.png` など
- コスト画像: `002_InGame/Cost/cost30.png` など
- 選択表示: `002_InGame/Piece/piece_active.png`
- ボール保持表示: `002_InGame/Piece/have_ball.png`

チーム色サフィックス:

- `_b`: 自分側
- `_r`: 相手側

## 初期チーム

`DefaultTeamMaster.json` を初期配置として使う。

反対側チームは `Flip()` で反転して配置する。

