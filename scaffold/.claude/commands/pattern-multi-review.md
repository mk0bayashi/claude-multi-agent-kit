---
description: "パターン2: 多視点レビュー — 成果物を複数の専門視点で並列評価"
---

# パターン2: 多視点レビュー（Subagent版）

指定された成果物を複数視点から並列レビューし、統合フィードバックを作成します。

## Step 0: プロファイル読込

## Step 1: 並列レビュー（Quality）
以下のSubagentを **並列** 起動:
- `editor` — 構造・論理・正確性レビュー
- `fact-checker` — 数値・引用・固有名詞の検証
- `persona-reviewer` — ターゲット読者視点（ペルソナ1）
- `persona-reviewer` — 別の読者視点（ペルソナ2）
各レビュー結果を取得。

## Step 2: 統合フィードバック
Conductorが全レビュー結果を統合し、重要度順に整理。
統合フィードバックを `outputs/analysis/review_*.md` に保存。

## Step 3: 修正適用
フィードバックに基づき修正版を作成。

$ARGUMENTS
