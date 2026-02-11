---
description: "パターン4: 競合情報マトリクス — 複数競合を並列調査し比較レポート生成"
---

# パターン4: 競合情報マトリクス（Subagent版）

## Step 0: プロファイル読込 + competitor-watchlist.md

## Step 1: 並列競合調査（Input）
指定された各競合企業に対し `competitor-analyst` を **並列** 起動（最大5社）。
各レポートをワークスペースの `research/` に保存。

## Step 2: 比較マトリクス生成（Process）
- `strategist` — 全レポートを統合し、比較マトリクスを生成
- 軸: 製品機能、価格、ターゲット、技術、強み/弱み

## Step 3: 示唆レポート
- `content-writer` — 比較マトリクスを基に「自社への示唆」レポートを作成
ワークスペースに `final_competitor_matrix.md` として保存。

## ワークスペース
タスク開始時に `workspaces/{YYYY-MM-DD}_{テーマ名}/` を作成し、全成果物をその中に保存する。
他のワークスペースのファイルは、ユーザーから明示的に指示された場合を除き参照しない。

$ARGUMENTS
