---
description: "パターン6: ステークホルダー・シミュレーション — 複数視点の議論シミュレーション"
---

# パターン6: ステークホルダー・シミュレーション（Subagent版）

## Step 0: プロファイル読込

## Step 1: 各視点からの評価（並列）
提案内容に対し、以下のSubagentを **並列** 起動:
- `persona-reviewer`（ペルソナ: CEO）— 経営判断の観点
- `persona-reviewer`（ペルソナ: CFO）— 財務的観点
- `persona-reviewer`（ペルソナ: エンドユーザー）— 使い勝手の観点
- `persona-reviewer`（ペルソナ: 競合他社の戦略担当）— 市場への影響

## Step 2: 意見統合
Conductorが全評価を統合し、強み・弱み・主要論点を整理。

## Step 3: 最終レポート
- `strategist` — 論点を基に推奨アクションを策定
ワークスペースに `final_stakeholder_sim.md` として保存。

## ワークスペース
タスク開始時に `workspaces/{YYYY-MM-DD}_{テーマ名}/` を作成し、全成果物をその中に保存する。
他のワークスペースのファイルは、ユーザーから明示的に指示された場合を除き参照しない。

$ARGUMENTS
