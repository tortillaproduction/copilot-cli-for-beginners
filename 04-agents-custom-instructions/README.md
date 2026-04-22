!\[Chapter 04: Agents and Custom Instructions](images/chapter-header.png)

> \\\\\\\*\\\\\\\*Pythonコードレビュアー、テストエキスパート、セキュリティレビュアー...すべてが1つのツールに統合されているとしたら、どうだろう？\\\\\\\*\\\\\\\*

第3章では、不可欠なワークフローをマスターしました：code review、refactoring、debugging、test generation、git integration。これらは GitHub Copilot CLI での生産性を大幅に向上させます。さあ、次のステップへ進みましょう。

これまで Copilot CLI を汎用アシスタントとして使用してきました。Agent を使うと、型ヒントと PEP 8 を強制するコードレビュアーや pytest テストケースを書くテストヘルパーなど、特定のペルソナと組み込み標準を持つ設定ができます。同じプロンプトでも、対象を絞った命令を持つ agent に処理されると、著しく良い結果が得られることがわかります。

## 🎯 学習目標

このチャプター終了時に、以下ができるようになります：

* ビルトイン agent の使用：Plan (`/plan`)、Code-review (`/review`)、自動 agent の理解（Explore、Task）
* agent ファイル（`.agent.md`）を使用した特化した agent の作成
* ドメイン固有のタスクへの agent の使用
* `/agent` と `--agent` を使用した agent 間の切り替え
* プロジェクト固有の標準のためのカスタム命令ファイルの作成

> ⏱️ \\\\\\\*\\\\\\\*所要時間\\\\\\\*\\\\\\\*: 約 55 分（20 分リーディング + 35 分ハンズオン）

\---

## 🧩 実世界の類似例：専門家の雇用

家の修理が必要なとき、1人の「汎用ヘルパー」を呼びません。専門家を呼びます：

|問題|専門家|理由|
|-|-|-|
|パイプの水漏れ|配管工|配管コードを知っており、専門ツールを持っている|
|配線工事|電気技師|安全要件を理解し、規格に準拠している|
|屋根の修理|屋根工|材料と地元の気象条件を知っている|

Agent も同じ方法で機能します。汎用的な AI ではなく、特定のタスクに焦点を当てた agent を使用し、正しいプロセスに従うことを知っている agent を使用します。命令を一度設定すれば、その専門性が必要なときはいつでも再利用できます：code review、testing、security、documentation。

<img src="images/hiring-specialists-analogy.png" alt="Hiring Specialists Analogy - Just as you call specialized tradespeople for house repairs, AI agents are specialized for specific tasks like code review, testing, security, and documentation" width="800" />

\---

# Agent の使用

ビルトインと カスタム agent をすぐに使い始めましょう。

\---

## *Agent を初めて使う方へ* まずはこちらから！

Agent を使用したことがない方、作成したことがない方へ。始めるために必要なすべてがここにあります。

1. **ビルトイン agent を今すぐ試してみてください：**

```bash
   copilot
   > /plan Add input validation for book year in the book app
   ```

これは Plan agent を呼び出して、段階的な実装計画を作成します。

2. **カスタム agent の例を見てください：** agent の命令を定義するのは簡単です。提供されている [python-reviewer.agent.md](../.github/agents/python-reviewer.agent.md) ファイルを見て、パターンを確認してください。
3. **基本概念を理解してください：** Agent は汎用家とではなく、専門家に相談するようなものです。「frontend agent」は accessibility とコンポーネントパターンに自動的に焦点を当てます。その agent の命令で既に指定されているため、何度も思い出させる必要がありません。



   ## ビルトイン Agent

   **第3章の開発ワークフローで既にいくつかのビルトイン agent を使用しています！**
<br>`/plan` と `/review` は実は ビルトイン agent です。これで内部で何が起こっているかわかりました。完全なリストはこちらです：

|Agent|呼び出し方|機能|
|-|-|-|
|**Plan**|`/plan` または `Shift+Tab`（モード切り替え）|コーディング前の段階的な実装計画を作成|
|**Code-review**|`/review`|ステージされた/ステージされていない変更に対して、焦点を絞ったアクショナブルなフィードバックを提供|
|**Init**|`/init`|プロジェクト設定ファイル（命令、agent）を生成|
|**Explore**|*自動*|codebase を探索または分析するよう依頼された場合に内部で使用|
|**Task**|*自動*|テスト、ビルド、lint、依存関係インストールなどのコマンドを実行|

<br>

**実行中のビルトイン agent** - Plan、Code-review、Explore、Task を呼び出す例

```bash
copilot

# Plan agent を呼び出して実装計画を作成
> /plan Add input validation for book year in the book app

# 変更に対して Code-review agent を呼び出し
> /review

# Explore と Task agent は関連する場合に自動的に呼び出されます：
> Run the test suite        # Task agent を使用

> Explore how book data is loaded    # Explore agent を使用
```

Task Agent はどうですか？これはバックグラウンドで機能して、起こっていることを管理・追跡し、クリーンで明確な形式で報告します：

|結果|表示内容|
|-|-|
|✅ **成功**|簡潔な要約（例：「All 247 tests passed」、「Build succeeded」）|
|❌ **失敗**|スタックトレース、コンパイラエラー、詳細ログを含む完全な出力|



> 📚 \\\\\\\*\\\\\\\*公式ドキュメンテーション\\\\\\\*\\\\\\\*: \\\\\\\[GitHub Copilot CLI Agents](https://docs.github.com/copilot/how-tos/use-copilot-agents/use-copilot-cli#use-custom-agents)

\---

# Copilot CLI への Agent の追加

独自の agent を定義して、ワークフローの一部にすることができます！一度定義すれば、その後は指定するだけです。

<img src="images/using-agents.png" alt="Four colorful AI robots standing together, each with different tools representing specialized agent capabilities" width="800"/>

## 🗂️ Agent を追加する

Agent ファイルは `.agent.md` 拡張子を持つ markdown ファイルです。2つの部分があります：YAML frontmatter（メタデータ）と markdown 命令。

> 💡 \\\\\\\*\\\\\\\*YAML frontmatter は初めてですか？\\\\\\\*\\\\\\\* これは `---` マーカーに囲まれたファイルの上部にある小さな設定ブロックです。YAML は単なる `key: value` ペアです。残りのファイルは通常の markdown です。

最小限の agent はこちらです：

```markdown
---
name: my-reviewer
description: Code reviewer focused on bugs and security issues
---

# Code Reviewer

You are a code reviewer focused on finding bugs and security issues.

When reviewing code, always check for:
- SQL injection vulnerabilities
- Missing error handling
- Hardcoded secrets
```

> 💡 \\\\\\\*\\\\\\\*必須 vs オプション\\\\\\\*\\\\\\\*: `description` フィールドは必須です。`name`、`tools`、`model` などの他のフィールドはオプションです。

## Agent ファイルの配置場所

|場所|スコープ|最適用途|
|-|-|-|
|`.github/agents/`|プロジェクト固有|プロジェクト規約を持つチーム共有 agent|
|`\\\\\\\~/.copilot/agents/`|グローバル（すべてのプロジェクト）|、すべてのプロジェクトで使用する個人用 agent|

**このプロジェクトは** [**.github/agents/**](../.github/agents/) **フォルダにサンプル agent ファイルを含んでいます**。独自のものを作成することも、既に提供されているものをカスタマイズすることもできます。

<details>
<summary>📂 このコースのサンプル agent を参照</summary>

|ファイル|説明|
|-|-|
|`hello-world.agent.md`|最小限の例 - ここから始めてください|
|`python-reviewer.agent.md`|Python コード品質レビュアー|
|`pytest-helper.agent.md`|Pytest テスト専門家|

```bash
# または個人用 agent フォルダにコピー（すべてのプロジェクトで利用可能）
cp .github/agents/python-reviewer.agent.md \\\\\\\~/.copilot/agents/
```

コミュニティ agent の詳細については、[github/awesome-copilot](https://github.com/github/awesome-copilot) を参照してください。

</details>



## 🚀 カスタム agent を使用する 2 つの方法

### インタラクティブモード

インタラクティブモード内で、`/agent` を使用して agent を一覧表示し、agent を選択して作業を開始します。
agent を選択して会話を続けてください。

```bash
copilot
> /agent
```

別の agent に切り替えるか、デフォルトモードに戻るには、`/agent` コマンドを再度使用します。

### プログラマティックモード

agent を使用した新しいセッションを直接起動します。

```bash
copilot --agent python-reviewer
> Review @samples/book-app-project/books.py
```

> 💡 \\\\\\\*\\\\\\\*Agent の切り替え\\\\\\\*\\\\\\\*: `/agent` または `--agent` を再度使用して、いつでも別の agent に切り替えることができます。標準の Copilot CLI エクスペリエンスに戻るには、`/agent` を使用して \\\\\\\*\\\\\\\*no agent\\\\\\\*\\\\\\\* を選択します。

\---

# Agent をより深く理解する

<img src="images/creating-custom-agents.png" alt="Robot being assembled on a workbench surrounded by components and tools representing custom agent creation" width="800"/>

> 💡 \\\\\\\*\\\\\\\*このセクションはオプションです。\\\\\\\*\\\\\\\* ビルトイン agent（`/plan`、`/review`）はほとんどのワークフローで十分に強力です。特化した専門知識が作業全体で一貫して適用される必要がある場合、カスタム agent を作成します。

以下の各トピックは自己完結型です。**興味のあるものを選択してください - すべてを一度に読む必要はありません。**

|実現したいこと|ジャンプ先|
|-|-|
|Agent が汎用プロンプトより優れている理由を理解する|[Specialist vs Generic](#specialist-vs-generic-see-the-difference)|
|機能で複数の agent を組み合わせる|[Working with Multiple Agents](#working-with-multiple-agents)|
|Agent の整理、命名、共有|[Organizing \& Sharing Agents](#organizing--sharing-agents)|
|常時プロジェクトコンテキストをセットアップ|[Configuring Your Project for Copilot](#configuring-your-project-for-copilot)|
|YAML プロパティと tool を参照|[Agent File Reference](#agent-file-reference)|

以下のシナリオを選択して展開してください。

\---

<a id="specialist-vs-generic-see-the-difference"></a>

<details>
<summary><strong>Specialist vs Generic: 違いを見てみましょう</strong> - agent が汎用プロンプトより優れた出力を生成する理由</summary>

## Specialist vs Generic: 違いを見てみましょう

ここが agent が価値を証明する場所です。違いを見てください：

### Agent なし（汎用 Copilot）

```bash
copilot

> Add a function to search books by year range in the book app
```

**汎用出力**:

```python
def search\\\\\\\_by\\\\\\\_year\\\\\\\_range(books, start\\\\\\\_year, end\\\\\\\_year):
    results = \\\\\\\[]
    for book in books:
        if book\\\\\\\['year'] >= start\\\\\\\_year and book\\\\\\\['year'] <= end\\\\\\\_year:
            results.append(book)
    return results
```

基本的です。機能します。でもたくさん不足しています。

\---

### Python Reviewer Agent を使用

```bash
copilot

> /agent
# "python-reviewer" を選択

> Add a function to search books by year range in the book app
```

**専門家出力**:

```python
from typing import List, Dict, Any

def search\\\\\\\_by\\\\\\\_year\\\\\\\_range(
    books: List\\\\\\\[Dict\\\\\\\[str, Any]],
    start\\\\\\\_year: int,
    end\\\\\\\_year: int
) -> List\\\\\\\[Dict\\\\\\\[str, Any]]:
    """
    Search for books within a specified year range.

    Args:
        books: List of book dictionaries
        start\\\\\\\_year: Starting year (inclusive)
        end\\\\\\\_year: Ending year (inclusive)

    Returns:
        List of books published within the year range

    Raises:
        ValueError: If start\\\\\\\_year is greater than end\\\\\\\_year
        TypeError: If year values are not integers
    """
    if not isinstance(start\\\\\\\_year, int) or not isinstance(end\\\\\\\_year, int):
        raise TypeError("Year values must be integers")

    if start\\\\\\\_year > end\\\\\\\_year:
        raise ValueError(f"Start year ({start\\\\\\\_year}) cannot be greater than end year ({end\\\\\\\_year})")

    return \\\\\\\[
        book for book in books
        if isinstance(book.get('year'), int)
        and start\\\\\\\_year <= book\\\\\\\['year'] <= end\\\\\\\_year
    ]
```

**python-reviewer agent が自動的に含むもの**:

* ✅ すべてのパラメータと戻り値の型ヒント
* ✅ Args/Returns/Raises を含む包括的な docstring
* ✅ 適切なエラー処理を伴う入力検証
* ✅ より良いパフォーマンスのためのリスト内包表記
* ✅ エッジケース処理（不足/無効な年の値）
* ✅ PEP 8 準拠のフォーマット
* ✅ 防御的プログラミング実践

**違い**: 同じプロンプト、劇的に優れた出力。agent は尋ねるのを忘れる専門知識をもたらします。

</details>

\---

<a id="working-with-multiple-agents"></a>

<details>
<summary><strong>複数の Agent で作業する</strong> - 専門家を組み合わせ、セッション中に切り替え、tool として agent を使用</summary>

## 複数の Agent で作業する

実際の力は、専門家が機能で協力するときに得られます。

### 例：シンプルな機能を構築する

```bash
copilot

> I want to add a "search by year range" feature to the book app

# python-reviewer でデザインする
> /agent
# "python-reviewer" を選択

> @samples/book-app-project/books.py Design a find\\\\\\\_by\\\\\\\_year\\\\\\\_range method. What's the best approach?

# pytest-helper に切り替えてテストデザイン
> /agent
# "pytest-helper" を選択

> @samples/book-app-project/tests/test\\\\\\\_books.py Design test cases for a find\\\\\\\_by\\\\\\\_year\\\\\\\_range method.
> What edge cases should we cover?

# 両方のデザインを統合
> Create an implementation plan that includes the method implementation and comprehensive tests.
```

**重要な洞察**: あなたはアーキテクトで専門家を指示しています。彼らが詳細を処理し、あなたがビジョンを処理します。

<details>
<summary>🎬 実際の動作を見てください！</summary>

!\[Python Reviewer Demo](images/python-reviewer-demo.gif)

*デモ出力は異なります - あなたのモデル、ツール、応答はここに示されているものと異なります。*

</details>

### Tool としての Agent

Agent が設定されているとき、Copilot は複雑なタスク中に tool として呼び出すこともできます。フルスタック機能をリクエストすれば、Copilot は自動的に適切な専門家 agent に部分をデリゲートする可能性があります。

</details>

\---

<a id="organizing--sharing-agents"></a>

<details>
<summary><strong>Agent の整理と共有</strong> - 命名、ファイルの配置、命令ファイル、チーム共有</summary>

## Agent の整理と共有

### Agent に名前を付ける

agent ファイルを作成するとき、名前が重要です。`/agent` または `--agent` の後に入力する内容であり、チームメートが agent リストで見るものです。

|✅ 良い名前|❌ 避ける|
|-|-|
|`frontend`|`my-agent`|
|`backend-api`|`agent1`|
|`security-reviewer`|`helper`|
|`react-specialist`|`code`|
|`python-backend`|`assistant`|

**命名規約:**

* 小文字とハイフンを使用: `my-agent-name.agent.md`
* ドメインを含める: `frontend`、`backend`、`devops`、`security`
* 必要に応じて具体的にする: `react-typescript` vs `frontend`だけ

\---

### チームとの共有

agent ファイルを `.github/agents/` に配置すると、バージョン管理されます。repo にプッシュすれば、すべてのチームメンバーが自動的にそれらを取得します。ただし agent はコピロットが読み取るファイルタイプの 1 つに過ぎません。それは `/agent` を実行する必要なく、すべてのセッションに自動的に適用される **命令ファイル** もサポートしています。

このように考えてください：agent は呼び出した専門家であり、命令ファイルはいつも活動しているチームルールです。

### ファイルを配置する場所

上記の [Agent ファイルの配置場所](#agent-ファイルの配置場所) で 2 つの主な場所はすでに認識しています。この決定木を使用して選択してください：

<img src="images/agent-file-placement-decision-tree.png" alt="Decision tree for where to put agent files: experimenting → current folder, team use → .github/agents/, everywhere → \\\\\\\~/.copilot/agents/" width="800"/>

**シンプルに始める:** プロジェクトフォルダに単一の `\\\\\\\*.agent.md` ファイルを作成してください。満足したら、永続的な場所に移動してください。

Agent ファイル以外に、Copilot は `/agent` を必要とせずに **プロジェクトレベル命令ファイル** を自動的に読み込みます。下記の [Configuring Your Project for Copilot](#configuring-your-project-for-copilot) で `AGENTS.md`、`.instructions.md`、`/init` を参照してください。

</details>

\---

<a id="configuring-your-project-for-copilot"></a>

<details>
<summary><strong>Copilot のためのプロジェクト設定</strong> - AGENTS.md、命令ファイル、/init セットアップ</summary>

## Copilot のためのプロジェクト設定

Agent はオンデマンドで呼び出す専門家です。**プロジェクト設定ファイル** は異なります：Copilot はプロジェクトの規約、テックスタック、ルールを理解するためにすべてのセッションで自動的にそれらを読み込みます。誰も `/agent` を実行する必要はありません。repo で働いている誰もがコンテキストはいつもアクティブです。

### /init による快速セットアップ

最も速く始めるには、Copilot が設定ファイルを生成するようにさせます：

```bash
copilot
> /init
```

Copilot はプロジェクトをスキャンして、カスタマイズされた命令ファイルを作成します。その後で編集できます。

### 命令ファイルフォーマット

|ファイル|スコープ|注記|
|-|-|-|
|`AGENTS.md`|プロジェクトルートまたはネストされた|**クロスプラットフォーム標準** - Copilot と他の AI アシスタントで機能|
|`.github/copilot-instructions.md`|プロジェクト|GitHub Copilot 固有|
|`.github/instructions/\\\\\\\*.instructions.md`|プロジェクト|粒度の細かい、トピック固有の命令|
|`CLAUDE.md`、`GEMINI.md`|プロジェクトルート|互換性のためにサポート|

> 🎯 \\\\\\\*\\\\\\\*始めたばかりですか？\\\\\\\*\\\\\\\* プロジェクト命令には `AGENTS.md` を使用してください。後で必要に応じて他のフォーマットを探索できます。

### AGENTS.md

`AGENTS.md` は推奨フォーマットです。これは Copilot と他の AI コーディングツールで機能する [オープン標準](https://agents.md/) です。repository ルートに配置すれば、Copilot が自動的に読み込みます。このプロジェクト独自の [AGENTS.md](../AGENTS.md) は、機能する例です。

典型的な `AGENTS.md` はプロジェクトコンテキスト、コードスタイル、セキュリティ要件、テスト標準を説明します。生成するには `/init` を使用するか、例ファイルのパターンに従って自分で作成してください。

### カスタム命令ファイル（.instructions.md）

より粒度の細かい制御が必要なチームの場合は、命令をトピック固有のファイルに分割してください。各ファイルは 1 つの関心事を扱い、自動的に適用されます：

```
.github/
└── instructions/
    ├── python-standards.instructions.md
    ├── security-checklist.instructions.md
    └── api-design.instructions.md
```

> 💡 \\\\\\\*\\\\\\\*注記\\\\\\\*\\\\\\\*: 命令ファイルはどの言語でも機能します。この例は、コースプロジェクトに合わせて Python を使用していますが、TypeScript、Go、Rust、チームが使用する他のテクノロジーに対して同様のファイルを作成できます。

**コミュニティ命令ファイルの検索**: [github/awesome-copilot](https://github.com/github/awesome-copilot) で .NET、Angular、Azure、Python、Docker、その他多くのテクノロジーをカバーする事前作成された命令ファイルを参照してください。

### カスタム命令の無効化

Copilot がすべてのプロジェクト固有設定を無視する必要がある場合（デバッグや動作比較に便利）:

```bash
copilot --no-custom-instructions
```

</details>

\---

<a id="agent-file-reference"></a>

<details>
<summary><strong>Agent ファイルリファレンス</strong> - YAML プロパティ、tool aliases、完全な例</summary>

## Agent ファイルリファレンス

### より完全な例

上記の [最小限の agent フォーマット](#-agent-を追加する) を見てきました。こちらは `tools` プロパティを使用する、より包括的な agent です。`\\\\\\\~/.copilot/agents/python-reviewer.agent.md` を作成してください：

```markdown
---
name: python-reviewer
description: Python code quality specialist for reviewing Python projects
tools: \\\\\\\["read", "edit", "search", "execute"]
---

# Python Code Reviewer

You are a Python specialist focused on code quality and best practices.

\\\\\\\*\\\\\\\*Your focus areas:\\\\\\\*\\\\\\\*
- Code quality (PEP 8, type hints, docstrings)
- Performance optimization (list comprehensions, generators)
- Error handling (proper exception handling)
- Maintainability (DRY principles, clear naming)

\\\\\\\*\\\\\\\*Code style requirements:\\\\\\\*\\\\\\\*
- Use Python 3.10+ features (dataclasses, type hints, pattern matching)
- Follow PEP 8 naming conventions
- Use context managers for file I/O
- All functions must have type hints and docstrings

\\\\\\\*\\\\\\\*When reviewing code, always check:\\\\\\\*\\\\\\\*
- Missing type hints on function signatures
- Mutable default arguments
- Proper error handling (no bare except)
- Input validation completeness
```

### YAML プロパティ

|プロパティ|必須|説明|
|-|-|-|
|`name`|いいえ|表示名（デフォルトはファイル名）|
|`description`|**はい**|agent が何をするか - Copilot がそれを示唆するときに理解するのを助ける|
|`tools`|いいえ|許可された tool のリスト（省略 = すべての tool が利用可能）。以下の tool alias を参照してください。|
|`target`|いいえ|`vscode` または `github-copilot` のみに制限|

### Tool Aliases

`tools` リストでこれらの名前を使用してください：

* `read` - ファイルコンテンツの読み込み
* `edit` - ファイルの編集
* `search` - ファイル検索（grep/glob）
* `execute` - shell コマンドの実行（また: `shell`、`Bash`）
* `agent` - 他のカスタム agent を呼び出す

> 📖 \\\\\\\*\\\\\\\*公式ドキュメンテーション\\\\\\\*\\\\\\\*: \\\\\\\[Custom agents configuration](https://docs.github.com/copilot/reference/custom-agents-configuration)
>
> ⚠️ \\\\\\\*\\\\\\\*VS Code のみ\\\\\\\*\\\\\\\*: `model` プロパティ（AI モデルを選択用）は VS Code で機能しますが、GitHub Copilot CLI ではサポートされていません。クロスプラットフォーム agent ファイルのために安全に含めることができます。GitHub Copilot CLI は無視します。

### その他の Agent テンプレート

> 💡 \\\\\\\*\\\\\\\*初心者のための注記\\\\\\\*\\\\\\\*: 下記の例はテンプレートです。\\\\\\\*\\\\\\\*特定のテクノロジーをプロジェクトが使用するものに置き換えてください。\\\\\\\*\\\\\\\* 重要なのは agent の\\\\\\\*構造\\\\\\\*であり、言及する特定のテクノロジーではありません。

このプロジェクトは [.github/agents/](../.github/agents/) フォルダにワーキング例を含んでいます：

* [hello-world.agent.md](../.github/agents/hello-world.agent.md) - 最小限の例、ここから始めてください
* [python-reviewer.agent.md](../.github/agents/python-reviewer.agent.md) - Python code quality reviewer
* [pytest-helper.agent.md](../.github/agents/pytest-helper.agent.md) - Pytest テスト専門家

コミュニティ agent の場合、[github/awesome-copilot](https://github.com/github/awesome-copilot) を参照してください。

</details>

\---

# 実践

<img src="../images/practice.png" alt="Warm desk setup with monitor showing code, lamp, coffee cup, and headphones ready for hands-on practice" width="800"/>

独自の agent を作成し、実際に動作を見てください。

\---

## ▶️ 自分で試してみてください

```bash

# agent ディレクトリを作成（存在しない場合）
mkdir -p .github/agents

# code reviewer agent を作成
cat > .github/agents/reviewer.agent.md << 'EOF'
---
name: reviewer
description: Senior code reviewer focused on security and best practices
---

# Code Reviewer Agent

You are a senior code reviewer focused on code quality.

\\\\\\\*\\\\\\\*Review priorities:\\\\\\\*\\\\\\\*
1. Security vulnerabilities
2. Performance issues
3. Maintainability concerns
4. Best practice violations

\\\\\\\*\\\\\\\*Output format:\\\\\\\*\\\\\\\*
Provide issues as a numbered list with severity tags:
\\\\\\\[CRITICAL], \\\\\\\[HIGH], \\\\\\\[MEDIUM], \\\\\\\[LOW]
EOF

# documentation agent を作成
cat > .github/agents/documentor.agent.md << 'EOF'
---
name: documentor
description: Technical writer for clear and complete documentation
---

# Documentation Agent

You are a technical writer who creates clear documentation.

\\\\\\\*\\\\\\\*Documentation standards:\\\\\\\*\\\\\\\*
- Start with a one-sentence summary
- Include usage examples
- Document parameters and return values
- Note any gotchas or limitations
EOF

# 今すぐ使用する
copilot --agent reviewer
> Review @samples/book-app-project/books.py

# または agent を切り替え
copilot
> /agent
# "documentor" を選択
> Document @samples/book-app-project/books.py
```

\---

## 📝 課題

### メインチャレンジ：特化した Agent チームを構築

ハンズオン例は `reviewer` と `documentor` agent を作成しました。今度は、book app のデータ検証を改善するための異なるタスク用の agent を作成することをプラクティスしてください：

1. 3 つの agent ファイル（`.agent.md`）を book app のために作成し、`.github/agents/` に配置（1 agent あたり 1 ファイル）
2. あなたの agent：

   * **data-validator**: `data.json` で失われたまたは不正形式のデータをチェック（空の author、year=0、不足フィールド）
   * **error-handler**: Python コードで一貫性のないエラーハンドリングをレビューし、統一されたアプローチを提案
   * **doc-writer**: docstring と README コンテンツを生成または更新
3. 各 agent を book app で使用：

   * `data-validator` → `@samples/book-app-project/data.json` を監査
   * `error-handler` → `@samples/book-app-project/books.py` と `@samples/book-app-project/utils.py` をレビュー
   * `doc-writer` → `@samples/book-app-project/books.py` に docstring を追加
4. 協力：`error-handler` でエラーハンドリングのギャップを特定し、`doc-writer` で改善されたアプローチを記録

**成功基準**: 3 つのワーキング agent があり、一貫した高品質な出力を生成し、`/agent` で切り替えることができます。

<details>
<summary>💡 ヒント（クリックして展開）</summary>

**スターターテンプレート**: `.github/agents/` に 1 つのファイルを agent ごとに作成：

`data-validator.agent.md`:

```markdown
---
description: Analyzes JSON data files for missing or malformed entries
---

You analyze JSON data files for missing or malformed entries.

\\\\\\\*\\\\\\\*Focus areas:\\\\\\\*\\\\\\\*
- Empty or missing author fields
- Invalid years (year=0, future years, negative years)
- Missing required fields (title, author, year, read)
- Duplicate entries
```

`error-handler.agent.md`:

```markdown
---
description: Reviews Python code for error handling consistency
---

You review Python code for error handling consistency.

\\\\\\\*\\\\\\\*Standards:\\\\\\\*\\\\\\\*
- No bare except clauses
- Use custom exceptions where appropriate
- All file operations use context managers
- Consistent return types for success/failure
```

`doc-writer.agent.md`:

```markdown
---
description: Technical writer for clear Python documentation
---

You are a technical writer who creates clear Python documentation.

\\\\\\\*\\\\\\\*Standards:\\\\\\\*\\\\\\\*
- Google-style docstrings
- Include parameter types and return values
- Add usage examples for public methods
- Note any exceptions raised
```

**Agent をテストする：**

> 💡 \\\\\\\*\\\\\\\*注記:\\\\\\\*\\\\\\\* このリポジトリのローカルコピーに既に `samples/book-app-project/data.json` があるはずです。失われている場合は、ソース repo から元のバージョンをダウンロードしてください：
> \\\\\\\[data.json](https://github.com/github/copilot-cli-for-beginners/blob/main/samples/book-app-project/data.json)

```bash
copilot
> /agent
# リストから "data-validator" を選択
> @samples/book-app-project/data.json Check for books with empty author fields or invalid years
```

**ヒント:** YAML frontmatter の `description` フィールドは、agent が機能するために必須です。

</details>

### ボーナスチャレンジ：命令ライブラリ

オンデマンドで呼び出す agent を構築しました。今度は反対側を試してください：\*\*/agent を必要としない、Copilot がすべてのセッションで自動的に読み込む **命令ファイル**。

`.github/instructions/` フォルダを少なくとも 3 つの命令ファイルで作成：

* PEP 8 と型ヒント規約を強制するための `python-style.instructions.md`
* test ファイルで pytest 規約を強制するための `test-standards.instructions.md`
* JSON データエントリを検証するための `data-quality.instructions.md`

book app コードで各命令ファイルをテストしてください。

\---

<details>
<summary>🔧 <strong>一般的なミスと トラブルシューティング</strong>（クリックして展開）</summary>

### 一般的なミス

|ミス|起こること|修正|
|-|-|-|
|agent frontmatter に `description` がない|Agent が読み込まれないか、発見可能ではない|YAML frontmatter に常に `description:` を含める|
|Agent のファイル場所が間違っている|agent を使用しようとするときに agent が見つからない|`\\\\\\\~/.copilot/agents/`（個人用）または `.github/agents/`（プロジェクト）に配置|
|`.md` の代わりに `.agent.md` を使用していない|ファイルが agent として認識されない可能性がある|`python-reviewer.agent.md` のようにファイルに名前を付ける|
|agent プロンプトが長すぎる|30,000 文字の制限に達する可能性がある|agent 定義を絞り込む；詳細な命令には skill を使用|

### トラブルシューティング

**Agent が見つからない** - agent ファイルが次のいずれかの場所に存在することを確認してください：

* `\\\\\\\~/.copilot/agents/`
* `.github/agents/`

利用可能な agent を一覧表示：

```bash
copilot
> /agent
# すべての利用可能な agent を表示
```

**Agent が命令に従わない** - プロンプトで明示的にして、agent 定義に詳細を追加します：

* 特定の framework/library とバージョン
* チーム規約
* コードパターン例

**カスタム命令が読み込まれていない** - プロジェクトでプロジェクト固有の命令をセットアップするには `/init` を実行します：

```bash
copilot
> /init
```

または、それらが無効化されていないかチェック：

```bash
# カスタム命令が読み込まれるようにしたい場合、--no-custom-instructions を使用しないでください
copilot  # これはデフォルトでカスタム命令を読み込みます
```

</details>

\---

# 要約

## 🔑 重要なポイント

1. **ビルトイン agent**: `/plan` と `/review` は直接呼び出される；Explore と Task は自動で機能
2. **カスタム agent** は `.agent.md` ファイルで定義される専門家
3. **良い agent** は明確な専門知識、標準、出力形式を持つ
4. **複数 agent での協力** は専門知識を組み合わせることで複雑な問題を解く
5. **命令ファイル** (`.instructions.md`) はチーム標準を自動適用のためにエンコード
6. **一貫した出力** は明確に定義された agent 命令から来る

> 📋 \\\\\\\*\\\\\\\*クイックリファレンス\\\\\\\*\\\\\\\*: \\\\\\\[GitHub Copilot CLI コマンドリファレンス](https://docs.github.com/en/copilot/reference/cli-command-reference) でコマンドとショートカットの完全なリストを参照してください。

\---

## ➡️ 次は何か

Agent は Copilot がコードに*どのようにアプローチし、ターゲットアクションを取る*か変わります。次に、*どのステップ*を実行するかを変わる **skill** について学びます。agent と skill の違いが気になりますか？第5章はそれに正面から取り組みます。

[**第5章：Skill システム**](../05-skills/README.md) では、以下を学習します：

* Skill が prompt から自動トリガーされる方法（slash コマンドは不要）
* コミュニティ skill のインストール
* SKILL.md ファイルでカスタム skill を作成
* agent、skill、MCP の違い
* 各 1 つをいつ使用するか

\---

[**← 第 3 章に戻る**](../03-development-workflows/README.md) | [**第 5 章に続く →**](../05-skills/README.md)

