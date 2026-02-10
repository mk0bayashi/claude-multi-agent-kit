---
description: "パターン9: 提案書ビルダー — クライアント向けテーラーメイド提案書"
---

# パターン9: 提案書ビルダー

## Step 0: プロファイル読込

## Step 1: 情報収集（Input — 並列）
- `deep-researcher` — クライアント企業の事業概要・業界動向・課題
- `competitor-analyst` — クライアントの競合と市場ポジション
- `deep-researcher` — 社内の類似案件・成功事例を `research/` から検索

## Step 2: 戦略設計（Process）
- `strategist` — ソリューション戦略構築・ROI算出

## Step 3: 提案書作成（Process）
- `proposal-writer` — 調査・戦略結果を基に提案書作成
ドラフトを `outputs/proposals/draft_*.md` に保存。

## Step 4: 多視点レビュー（Quality — 並列）
- `persona-reviewer`（ペルソナ: クライアントCTO）— 技術的妥当性
- `persona-reviewer`（ペルソナ: クライアント経営企画部長）— ROIの納得度
- `editor` — 構成・論理・ブランド整合性

## Step 5: 修正 → `outputs/proposals/final_*.md` に保存。

$ARGUMENTS
