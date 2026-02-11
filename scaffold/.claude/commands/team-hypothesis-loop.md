---
description: "パターン5 Agent Teams版: 仮説検証ループ — 戦略家と調査員が直接対話"
---

# パターン5: 仮説構築→検証ループ（Agent Teams版）

仮説を立てデータで検証する反復プロセスを実行します。
**Subagent版との違い**: 戦略家と調査員が直接対話し、
調査中に見つかった予想外のデータに基づいて仮説を即座に修正できます。

## 手順

### Step 1: Agent Teamを作成

1. **hypothesis-builder** — 戦略家。仮説を構築し確信度を管理する。strategist の原則に従う
2. **data-verifier** — 調査員。仮説をデータで検証する。deep-researcher の原則に従う

### Step 2: ループ開始の指示
- hypothesis-builder にテーマを共有し、初期仮説3つの構築を依頼
- 仮説が構築されたら data-verifier に検証を依頼
- **重要**: data-verifier が予想外のデータを発見した場合、
  hypothesis-builder に直接メッセージして仮説の修正を提案できる
- hypothesis-builder は検証結果と新しい示唆に基づいて仮説を精緻化

### Step 3: 収束判定
- 各仮説の確信度が「高」になるか、3回ループしたら終了
- Team Leadが最終仮説と検証過程を整理
- ワークスペースに `final_hypothesis.md` として保存

## ワークスペース
タスク開始時に `workspaces/{YYYY-MM-DD}_{テーマ名}/` を作成し、全成果物をその中に保存する。
他のワークスペースのファイルは、ユーザーから明示的に指示された場合を除き参照しない。

$ARGUMENTS
