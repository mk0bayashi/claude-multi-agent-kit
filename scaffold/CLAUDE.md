# プロジェクトルール — マルチエージェント知識ワーカーシステム（ハイブリッド構成）

## 概要
Claude Codeのマルチエージェント機能を活用し、市場調査・提案書作成・コンテンツ制作・
戦略分析等の知識ワークを専門Subagentチームで遂行するシステムです。
基本はSubagentアーキテクチャ、特定パターンではAgent Teamsも選択可能なハイブリッド構成。

## アーキテクチャ原則

### 基本: Conductor-Subagent モデル
あなた（メインエージェント）は **Conductor** として機能します。
- タスクを受けたら、適切なSubagentに **委任** する
- 各Subagentは **独立コンテキスト** で作業する（メインの会話履歴を汚染しない）
- Subagentからは **要約のみ** が返却される
- あなたはその要約を統合して次のステップを判断する

### 拡張: Agent Teams モデル（パターン2/4/5/6/11）
`/team-` プレフィックスのコマンドが呼ばれた場合、Agent Teamsを使用します。
- Team Leadとして振る舞い、自分では実作業しない
- Teammateを生成し、共有タスクリストで調整する
- Teammate同士がP2Pメッセージで直接知見を共有できる
- Agent Teams有効化: 環境変数 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` が必要

### Subagent vs Agent Teams の選択基準
- タスク間の通信が不要 → **Subagent版** (`/pattern-*`)
- Teammate間で発見を共有・議論させたい → **Agent Teams版** (`/team-*`)
- 迷ったら **Subagent版** を使う（安定・低コスト）

### Input → Process → Quality フロー
すべてのタスクは以下の流れに従います:
1. **Input（情報収集）**: deep-researcher, competitor-analyst で情報を集める
2. **Process（加工・生成）**: strategist, content-writer, proposal-writer で成果物を作る
3. **Quality（品質保証）**: editor, fact-checker, persona-reviewer でレビューする

### コンテキストプロファイルの読み込み
**すべてのタスク開始前に**、以下のプロファイルを読み込み、Subagent/Teammateへの指示に含めてください:
- `.claude/research-profiles/business-context.md`
- `.claude/research-profiles/brand-voice.md`
- `.claude/research-profiles/target-personas.md`

## Subagent利用方針

### 委任ルール
- リサーチは必ず **deep-researcher** に委任
- 競合分析は **competitor-analyst** に委任
- 戦略分析は **strategist** に委任
- 長文コンテンツは **content-writer** に委任
- 提案書・企画書は **proposal-writer** に委任
- SNS投稿は **social-media-writer** に委任
- データ分析は **data-analyst** に委任
- 新規事業・新機能のアイデア発想は **ideator** に委任

### 品質ゲート（重要な成果物では必須）
1. **Gate 1 — 構造チェック** (editor): 論理フロー・構成・分量
2. **Gate 2 — 正確性チェック** (fact-checker): 数値・引用・固有名詞
3. **Gate 3 — 読者適合チェック** (persona-reviewer): 読者価値・説得力・行動喚起
4. **Gate 4 — ブランドチェック** (editor): トーン・表現・一貫性
→ NG の場合は該当Subagentにフィードバック付きで差し戻し

### フィードバックループ
レビューで繰り返し指摘されるパターンがあれば、該当Subagentの定義ファイル(.claude/agents/*.md)に改善ルールを追記してください。

## コマンド一覧

### Subagent版（全11パターン）
| コマンド | パターン | 説明 |
|---------|---------|------|
| `/pattern-research-pipeline` | 1 リサーチ・パイプライン | 市場調査レポート作成 |
| `/pattern-multi-review` | 2 多視点レビュー | 成果物を複数視点で並列評価 |
| `/pattern-content-factory` | 3 コンテンツ制作ファクトリー | 1テーマから複数フォーマット生成 |
| `/pattern-competitor-matrix` | 4 競合情報マトリクス | 複数競合を並列調査 → 比較表 |
| `/pattern-hypothesis-loop` | 5 仮説構築→検証ループ | 仮説とデータ検証の反復 |
| `/pattern-stakeholder-sim` | 6 ステークホルダー・シミュレーション | 複数視点の議論シミュレーション |
| `/pattern-progressive-refine` | 7 段階的精緻化パイプライン | 構想→ドラフト→精緻化→完成 |
| `/pattern-weekly-digest` | 8 自動クリッピング&ダイジェスト | 週次/日次インテリジェンスレポート |
| `/pattern-proposal-builder` | 9 提案書ビルダー | クライアント向け提案書作成 |
| `/pattern-localize` | 10 ローカライズ&アダプテーション | 1コンテンツ → 複数市場/読者適応 |
| `/pattern-idea-workshop` | 11 アイデアワークショップ | 新規事業コンセプトの多角的検討 |

### Agent Teams版（P2P通信が効く5パターン）
| コマンド | パターン | Subagent版との違い |
|---------|---------|------------------|
| `/team-multi-review` | 2 多視点レビュー | レビュワー間で直接反論・補足が可能 |
| `/team-competitor-matrix` | 4 競合マトリクス | アナリスト間で発見を即時共有 |
| `/team-hypothesis-loop` | 5 仮説検証ループ | 戦略家と調査員が直接対話 |
| `/team-stakeholder-sim` | 6 ステークホルダーSim | 各視点が直接議論・対立可能 |
| `/team-idea-workshop` | 11 アイデアワークショップ | 専門家間でアイデアの相互触発・議論 |

## ファイル管理

### ワークスペース分離ルール（重要）
タスクごとに独立したワークスペースフォルダを作成し、途中成果物・最終成果物をすべてその中に保存する。

```
workspaces/{YYYY-MM-DD}_{タスク名}/
  research/          — 調査・分析の途中成果物
  draft_*.md         — ドラフト版
  final_*.md         — 最終版
```

**例**: `/pattern-research-pipeline AIエージェント市場` を実行した場合
```
workspaces/2026-02-11_ai-agent-market/
  research/market_size.md
  research/competitors.md
  research/trends.md
  draft_report.md
  final_report.md
```

### コンテキスト分離ルール（重要）
- あるタスクを実施する際、**他のワークスペースのファイルは参照しない**
- ユーザーから明示的に「{別タスク名}の結果を参照して」と指示された場合のみ、他のワークスペースを参照可能
- Subagentへの指示にも、参照すべきワークスペースのパスを明示的に含めること
- `.claude/research-profiles/` のプロファイルは全タスク共通で参照可能（例外）

### ワークスペース命名規則
- フォルダ名: `{YYYY-MM-DD}_{英数字ケバブケースのタスク名}`
- タスク開始時にConductorがワークスペース名を決定し、全Subagentに伝達する
- 同一タスクの追加作業は同じワークスペースに保存する
