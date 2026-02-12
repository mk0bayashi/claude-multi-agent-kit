# claude-multi-agent-kit

[![npm version](https://img.shields.io/npm/v/claude-multi-agent-kit.svg)](https://www.npmjs.com/package/claude-multi-agent-kit)

Claude Code用マルチエージェント知識ワーカーシステムのスキャフォールディングツール。

市場調査・提案書作成・コンテンツ制作・戦略分析等の知識ワークを、11の専門Subagentと16のワークフローコマンドで遂行するシステムを、任意のプロジェクトに `npx` 一発でセットアップできます。

## インストール

### npx（推奨 — インストール不要）

```bash
npx claude-multi-agent-kit init
```

### グローバルインストール

```bash
npm install -g claude-multi-agent-kit
cmak init
```

### GitHubから直接

```bash
npx github:mk0bayashi/claude-multi-agent-kit init
```

## Quick Start

```bash
# 1. セットアップ（npx一発）
npx claude-multi-agent-kit init

# 2. プロファイルを自社情報で編集
#    .claude/research-profiles/business-context.md
#    .claude/research-profiles/brand-voice.md
#    .claude/research-profiles/target-personas.md

# 3. Claude Code を起動してタスクを自然言語で伝える
claude
# 「AIエージェント市場について調べて」← 最適パターンを自動推薦
# /pattern-research-pipeline AIエージェント市場調査  ← 直接指定もOK
```

## タスク自動ルーティング（v1.4.0〜）

スラッシュコマンドを知らなくても、自然言語でタスクを伝えるだけで最適なパターンが自動推薦されます。

```
ユーザー: 「AIエージェント市場について調べて」

AI: 以下の実行方法を推薦します:
  ✅ P1: リサーチ・パイプライン（推奨）
     → 市場規模・トレンド・主要プレイヤーを体系的に調査しレポート化
  📊 P4: 競合マトリクス
     → 特定の競合企業を比較分析する場合
  🔧 その他

ユーザー: P1を選択 → 自動実行
```

判定ロジック:
- **単一エージェント判定**: SNS投稿、契約書レビュー等はパターンなしで直接委任
- **パターン選定**: タスク特性に基づき11パターンから最適を選定
- **Subagent / Teams選択**: 議論・対話が必要な場合のみTeams版を推薦
- **スラッシュコマンド直接指定**: 従来通り即実行（推薦プロセスをスキップ）

## 同梱コンポーネント

### 11 Subagent定義 (`.claude/agents/`)
| エージェント | 役割 |
|:------------|:-----|
| deep-researcher | Web検索を駆使した深掘り調査 |
| competitor-analyst | 競合企業・製品の詳細分析 |
| strategist | 戦略フレームワーク適用・仮説構築 |
| content-writer | ブログ・ホワイトペーパー等の長文執筆 |
| proposal-writer | 提案書・企画書・ビジネスプラン作成 |
| social-media-writer | SNS投稿の作成 |
| data-analyst | データ分析・KPI算出・トレンド分析 |
| ideator | 新規事業・新機能のアイデア大量生成 |
| editor | 文書の構造・ブランドチェック |
| fact-checker | 事実・数値・引用の検証 |
| persona-reviewer | ターゲット読者視点でのレビュー |

### 16 ワークフローコマンド (`.claude/commands/`)

**Subagent版 (11パターン)**
| コマンド | 説明 |
|:---------|:-----|
| `/pattern-research-pipeline` | 情報収集→分析→統合のリサーチパイプライン |
| `/pattern-multi-review` | 複数専門視点での並列評価 |
| `/pattern-content-factory` | 1テーマから複数フォーマット生成 |
| `/pattern-competitor-matrix` | 複数競合の並列調査→比較表 |
| `/pattern-hypothesis-loop` | 仮説構築→データ検証の反復 |
| `/pattern-stakeholder-sim` | 複数視点の議論シミュレーション |
| `/pattern-progressive-refine` | 段階的精緻化パイプライン |
| `/pattern-weekly-digest` | 週次/日次インテリジェンスレポート |
| `/pattern-proposal-builder` | クライアント向け提案書作成 |
| `/pattern-localize` | 1コンテンツ→複数市場/読者適応 |
| `/pattern-idea-workshop` | 新規事業アイデアの多角的検討 |

**Agent Teams版 (5パターン)** — Teammate間の直接対話が可能
| コマンド | 説明 |
|:---------|:-----|
| `/team-multi-review` | レビュワー間で反論・補足が可能 |
| `/team-competitor-matrix` | アナリスト間で発見を即時共有 |
| `/team-hypothesis-loop` | 戦略家と調査員が直接対話 |
| `/team-stakeholder-sim` | 各視点が直接議論・対立 |
| `/team-idea-workshop` | 専門家間でアイデアの相互触発 |

## CLI コマンド

```bash
cmak init      # セットアップ
cmak status    # 状態確認
cmak update    # パッケージ更新を適用
cmak clean     # アンインストール
```

### init オプション
```bash
cmak init --with-examples    # 使用例も含めてコピー
cmak init --force            # 既存ファイルを強制上書き
cmak init --skip-profiles    # research-profiles をスキップ
cmak init --dry-run          # プレビューのみ
```

### update オプション
```bash
cmak update                     # ユーザー変更済みファイルはスキップ
cmak update --include-profiles  # research-profiles も更新
cmak update --force             # バックアップ後に強制上書き
cmak update --dry-run           # プレビューのみ
```

### clean オプション
```bash
cmak clean                  # 管理ファイルのみ削除（成果物保持）
cmak clean --keep-profiles  # research-profiles を残す
cmak clean --all            # 成果物含め全削除
```

## カスタマイズ

### プロファイル設定

`init` 後、以下のファイルを自社情報で編集してください:

- `.claude/research-profiles/business-context.md` — 企業情報・事業内容・競争優位性
- `.claude/research-profiles/brand-voice.md` — ブランドトーン・表現ガイドライン
- `.claude/research-profiles/target-personas.md` — ターゲット読者の詳細プロファイル
- `.claude/research-profiles/competitor-watchlist.md` — 監視対象の競合企業リスト

### プロジェクト固有プロファイルの追加

```bash
# 例: プロジェクト専用のコンテキストファイルを追加
cp my-project-context.md .claude/research-profiles/
```

## アーキテクチャ

```
Input（情報収集）→ Process（加工・生成）→ Quality（品質保証）

Input:   deep-researcher, competitor-analyst
Process: strategist, content-writer, proposal-writer, ideator
Quality: editor, fact-checker, persona-reviewer
```

品質ゲート（重要成果物で必須）:
1. Gate 1 — 構造チェック (editor)
2. Gate 2 — 正確性チェック (fact-checker)
3. Gate 3 — 読者適合チェック (persona-reviewer)
4. Gate 4 — ブランドチェック (editor)

## 前提条件

- Node.js >= 18
- Claude Code CLI がインストール済み
- Agent Teams版を使用する場合: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 環境変数（`init` で自動設定）

## License

MIT
