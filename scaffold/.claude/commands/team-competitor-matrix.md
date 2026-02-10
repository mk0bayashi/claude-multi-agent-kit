---
description: "パターン4 Agent Teams版: 競合マトリクス — アナリスト間で発見を即時共有"
---

# パターン4: 競合情報マトリクス（Agent Teams版）

複数競合を調査し、比較マトリクスを生成します。
**Subagent版との違い**: アナリスト同士が発見を即時共有。
「競合Aがこの市場に参入した」→「競合Bがそれに対抗して値下げした」
のような相互影響を発見できます。

## 手順

### Step 1: Agent Teamを作成
指定された各競合企業に対して1人ずつTeammateを生成:

1. **analyst-{企業A名}** — 企業Aの詳細分析
2. **analyst-{企業B名}** — 企業Bの詳細分析
3. **analyst-{企業C名}** — 企業Cの詳細分析
（最大5社）

### Step 2: 調査の指示
各Teammateに以下を指示:
- `.claude/research-profiles/competitor-watchlist.md` を読み込む
- competitor-analyst の分析フレームワークに従って調査
- **発見した重要情報（新製品、値下げ、提携、撤退等）は即座に他のTeammateに共有**
- 他のTeammateから共有された情報が自社の分析に影響する場合は分析を更新

### Step 3: マトリクス統合
全Teammateの調査完了後、Team Leadが:
- 比較マトリクスを生成
- 相互影響の分析を追加
- `outputs/analysis/competitor_matrix_*.md` に保存

$ARGUMENTS
