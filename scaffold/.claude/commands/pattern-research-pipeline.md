---
description: "パターン1: リサーチ・パイプライン — 情報収集→分析→統合の順次処理"
---

# パターン1: リサーチ・パイプライン

ユーザーが指定したテーマの調査レポートを作成します。

## Step 0: プロファイル読込
`.claude/research-profiles/` の business-context.md, brand-voice.md, target-personas.md を読み込む。

## Step 1: 並列リサーチ（Input）
以下のSubagentを **並列** 起動:
- `deep-researcher` — テーマの市場規模・成長率・主要プレイヤー調査
- `competitor-analyst` — 主要プレイヤー3社の詳細分析（3回起動）
- `deep-researcher` — トレンドと課題の調査
結果をワークスペースの `research/` に保存。

## Step 2: 戦略分析（Process）
- `strategist` — Step 1の結果を基に分析フレームワーク適用
結果をワークスペースの `research/` に保存。

## Step 3: レポート執筆（Process）
- `content-writer` — Step 1, 2の結果を基に本文を執筆
ドラフトをワークスペースに `draft_report.md` として保存。

## Step 4: 品質ゲート（Quality）
1. `editor` — 構造・論理レビュー
2. `fact-checker` — 数値・引用検証
3. `persona-reviewer` — ターゲット読者視点レビュー
NG項目はStep 3のSubagentにフィードバック付き差し戻し。

## Step 5: 最終版をワークスペースに `final_report.md` として保存。

## ワークスペース
タスク開始時に `workspaces/{YYYY-MM-DD}_{テーマ名}/` を作成し、全成果物をその中に保存する。
他のワークスペースのファイルは、ユーザーから明示的に指示された場合を除き参照しない。

$ARGUMENTS
