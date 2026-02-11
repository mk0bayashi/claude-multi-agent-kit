---
description: "パターン3: コンテンツ制作ファクトリー — 1テーマから複数フォーマット並列生成"
---

# パターン3: コンテンツ制作ファクトリー

## Step 0: プロファイル読込

## Step 1: リサーチ（Input）
- `deep-researcher` — ターゲット市場のペインポイントと検索トレンド調査

## Step 2: 戦略策定（Process）
- `strategist` — コンテンツ戦略（テーマ・ターゲット・チャネル別方針）

## Step 3: 並列コンテンツ生成（Process）
以下を **並列** 起動:
- `content-writer` — メインブログ記事（2000字）
- `social-media-writer` — Twitter 5投稿 + LinkedIn 2投稿
- `content-writer` — ニュースレター用ダイジェスト
- `proposal-writer` — プレスリリース
各結果をワークスペースの `research/` に保存。

## Step 4: 品質チェック（Quality）
- `editor` — 全コンテンツのクロスチェック（メッセージ一貫性）
- `fact-checker` — 数値・主張の検証

## Step 5: 最終版をワークスペースに `final_*.md` として保存。

## ワークスペース
タスク開始時に `workspaces/{YYYY-MM-DD}_{テーマ名}/` を作成し、全成果物をその中に保存する。
他のワークスペースのファイルは、ユーザーから明示的に指示された場合を除き参照しない。

$ARGUMENTS
