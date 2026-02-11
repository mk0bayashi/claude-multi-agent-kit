---
description: "パターン8: 自動クリッピング＆ダイジェスト — 週次/日次インテリジェンスレポート"
---

# パターン8: 自動クリッピング＆ダイジェスト

## Step 0: プロファイル読込 + competitor-watchlist.md

## Step 1: 並列情報収集（Input）
以下を **並列** 起動:
- `deep-researcher` — 業界ニュース（直近1週間）
- `competitor-analyst` — 競合の動き（watchlist記載企業）
- `deep-researcher` — 技術トレンド（自社関連技術）

## Step 2: キュレーション（Process）
- `strategist` — 重要度ランク付け・自社への影響度評価

## Step 3: ダイジェスト生成
- `content-writer` — 週次レポートを作成
ワークスペースに `final_weekly_digest.md` として保存。

## ワークスペース
タスク開始時に `workspaces/{YYYY-MM-DD}_{テーマ名}/` を作成し、全成果物をその中に保存する。
他のワークスペースのファイルは、ユーザーから明示的に指示された場合を除き参照しない。

$ARGUMENTS
