---
description: "パターン2 Agent Teams版: 多視点レビュー — レビュワー間で直接反論・補足が可能"
---

# パターン2: 多視点レビュー（Agent Teams版）

指定された成果物を複数視点からレビューします。
**Subagent版との違い**: レビュワー同士が直接やりとりし、
ある指摘に対して別のレビュワーが反論や補足ができます。

## 手順

### Step 1: Agent Teamを作成
以下のTeammateを生成してください:

1. **structure-reviewer** — 構造・論理の観点でレビュー。editor の観点に従う
2. **accuracy-reviewer** — 正確性の観点でレビュー。fact-checker の観点に従う
3. **persona-reviewer-1** — ターゲットペルソナ1の視点でレビュー
4. **persona-reviewer-2** — ターゲットペルソナ2の視点でレビュー

### Step 2: レビュー実行の指示
各Teammateに以下を指示:
- `.claude/research-profiles/` のプロファイルを読み込む
- 指定された成果物をレビューする
- レビュー結果を他のTeammateと共有する
- **他のTeammateの指摘に対して反論・補足・同意を表明する**

### Step 3: 議論の収束
全Teammateの議論が収束したら、Team Lead（あなた）が:
- 全指摘を重要度順に整理
- 合意点と論点を区別
- 統合フィードバックを `outputs/analysis/review_*.md` に保存

### 運用テクニック
- Teammateが議論を始めない場合: `broadcast` で「他のTeammateのレビュー結果を読んで、賛否を表明してください」
- 議論が発散する場合: `broadcast` で「主要な3点に絞って結論を出してください」

$ARGUMENTS
