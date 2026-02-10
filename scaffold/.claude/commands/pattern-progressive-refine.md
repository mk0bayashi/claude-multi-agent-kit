---
description: "パターン7: 段階的精緻化パイプライン — 構想→ドラフト→精緻化→完成"
---

# パターン7: 段階的精緻化パイプライン

## Step 0: プロファイル読込

## Step 1: 構想→構造化
- `strategist` — ユーザーの構想メモからアウトライン・章立て構成を作成

## Step 2: ドラフト作成
- `content-writer` — アウトラインに沿って本文ドラフトを執筆

## Step 3: データ補強
- `deep-researcher` — ドラフトの主張を裏付けるデータ・引用・図表候補を収集
- `content-writer` — データを埋め込んで精緻化

## Step 4: 品質ゲート
1. `editor` — 全体レビュー
2. `fact-checker` — 数値・引用検証

## Step 5: 最終仕上げ
`outputs/reports/final_*.md` に保存。

$ARGUMENTS
