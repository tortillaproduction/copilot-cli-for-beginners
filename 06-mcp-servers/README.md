![Chapter 06: MCP Servers](images/chapter-header.png)

> **Copilot があなたの GitHub issue を読んだり、データベースをチェックしたり、PR を作成できたらどうしますか？すべてターミナルから。**

これまで、Copilot は直接提供されたもの（`@` で参照するファイル、会話履歴、その学習データ）だけで機能していました。しかし、自分で GitHub リポジトリをチェックしたり、プロジェクトファイルを参照したり、ライブラリの最新ドキュメントを検索したりすることができたらどうでしょうか？

それが MCP (Model Context Protocol) の役割です。これは Copilot を外部サービスに接続し、ライブなリアルワールドデータにアクセスさせる方法です。Copilot が接続する各サービスを「MCP server」と呼びます。このチャプターでは、いくつかの接続を設定し、それらが Copilot をいかに劇的に便利にするかを確認します。

> 💡 **MCP をすでに知ってますか？** [クイックスタートにジャンプして](#-use-the-built-in-github-mcp)、それが機能していることを確認し、サーバーの設定を開始してください。

## 🎯 学習目標

このチャプターの終わりまでに、あなたは以下ができるようになります：

- MCP が何で、なぜ重要なのかを理解する
- `/mcp` コマンドを使用して MCP サーバーを管理する
- GitHub、ファイルシステム、ドキュメント用の MCP サーバーを設定する
- book app プロジェクトで MCP 対応のワークフローを使用する
- カスタム MCP サーバーを構築する時期と方法を理解する（オプション）

> ⏱️ **推定時間**: 約 50 分（読書 15 分 + ハンズオン 35 分）

---

## 🧩 実世界の類例：ブラウザ拡張

<img src="images/browser-extensions-analogy.png" alt="MCP Servers are like Browser Extensions" width="800"/>

MCP サーバーをブラウザ拡張のように考えてください。ブラウザだけで Web ページを表示できますが、拡張機能はそれを外部サービスに接続します：

| ブラウザ拡張 | 接続先 | MCP 相当物 |
|-------------------|---------------------|----------------|
| パスワードマネージャー | パスワードボルト | **GitHub MCP** → あなたのリポジトリ、issue、PR |
| Grammarly | 文法チェックサービス | **Context7 MCP** → ライブラリドキュメント |
| ファイルマネージャー | クラウドストレージ | **Filesystem MCP** → ローカルプロジェクトファイル |

拡張機能がなくても、ブラウザは役に立ちますが、あるとパワフルになります。MCP サーバーは Copilot にとって同じことをします。GitHub issue を読んだり、ファイルシステムを参照したり、最新のドキュメントを取得したりできるよう、リアルなライブデータソースに接続します。

***MCP サーバーは Copilot を外部世界に接続します：GitHub、リポジトリ、ドキュメントなど***

> 💡 **重要な洞察**：MCP がない場合、Copilot は `@` で明示的に共有するファイルのみが見えます。MCP を使用すると、プロジェクトを主体的に探索したり、GitHub リポジトリをチェックしたり、ドキュメントを検索したりすることができます。すべて自動です。

---

<img src="images/quick-start-mcp.png" alt="Power cable connecting with bright electrical spark surrounded by floating tech icons representing MCP server connections" width="800"/>

# クイックスタート：30 秒で MCP をマスター

## 組み込みの GitHub MCP サーバーをスタート
何も設定する前に、今すぐ MCP の実行を見てみましょう。
GitHub MCP サーバーはデフォルトで含まれています。試してみてください：

```bash
copilot
> List the recent commits in this repository
```

Copilot が実際のコミットデータを返したら、あなたは MCP の実行を見たばかりです。それは GitHub MCP サーバーが GitHub に代わってアクセスしています。しかし GitHub は単なる *1 つ* のサーバーです。このチャプターは、より多く（ファイルシステムアクセス、最新ドキュメント、その他）を追加し、Copilot がさらに多くできるようにする方法を示します。

---

## `/mcp show` コマンド

`/mcp show` を使用して、どの MCP サーバーが設定されており、有効になっているかを確認します：

```bash
copilot

> /mcp show

MCP Servers:
✓ github (enabled) - GitHub integration
✓ filesystem (enabled) - File system access
```

> 💡 **GitHub サーバーのみが見えますか？** それは予期されています！まだ追加の MCP サーバーを追加していない場合、GitHub のみが表示されます。次のセクションでさらに追加します。

> 📚 **すべての MCP 管理コマンドを見たいですか？** チャット内で `/mcp` スラッシュコマンドを使用するか、ターミナルから `copilot mcp` を直接使用してサーバーを管理できます。このチャプターの最後にある[完全なコマンドリファレンス](#-additional-mcp-commands)を参照してください。

<details>
<summary>🎬 実際に動作しているのを見てください！</summary>

![MCP Status Demo](images/mcp-status-demo.gif)

*デモの出力は異なります。あなたのモデル、ツール、応答はここに示されているものとは異なります。*

</details>

---

## MCP で何が変わるか？

実際に MCP がもたらす違いは以下です：

**MCP なし：**
```bash
> What's in GitHub issue #42?

"I don't have access to GitHub. You'll need to copy and paste the issue content."
```

**MCP あり：**
```bash
> What's in GitHub issue #42 of this repository?

Issue #42: Login fails with special characters
Status: Open
Labels: bug, priority-high
Description: Users report that passwords containing...
```

MCP は Copilot を実際の開発環境に認識させます。

> 📚 **公式ドキュメント**：[About MCP](https://docs.github.com/copilot/concepts/context/mcp) GitHub Copilot で MCP がどのように機能するかの詳細については、こちらを参照してください。

---

# MCP サーバーの設定

<img src="images/configuring-mcp-servers.png" alt="Hands adjusting knobs and sliders on a professional audio mixing board representing MCP server configuration" width="800"/>

MCP の動作を確認したので、追加のサーバーをセットアップしましょう。このセクションでは、設定ファイル形式と新しいサーバーの追加方法を説明します。

---

## MCP 設定ファイル

MCP サーバーは `~/.copilot/mcp-config.json`（ユーザーレベル、すべてのプロジェクトに適用）または `.vscode/mcp.json`（プロジェクトレベル、現在のワークスペースのみに適用）で設定されます。

```json
{
  "mcpServers": {
    "server-name": {
      "type": "local",
      "command": "npx",
      "args": ["@package/server-name"],
      "tools": ["*"]
    }
  }
}
```

*ほとんどの MCP サーバーは npm パッケージとして配布され、`npx` コマンドで実行されます。*

<details>
<summary>💡 <strong>JSON が初めてですか？</strong> クリックして各フィールドの意味を学んでください</summary>

| フィールド | 意味 |
|-------|---------------|
| `"mcpServers"` | すべての MCP サーバー設定のコンテナ |
| `"server-name"` | 選択した名前（例："github"、"filesystem"） |
| `"type": "local"` | サーバーはあなたのマシン上で実行されます |
| `"command": "npx"` | 実行するプログラム（npx は npm パッケージを実行） |
| `"args": [...]` | コマンドに渡されるアーギュメント |
| `"tools": ["*"]` | このサーバーからのすべてのツールを許可 |

**重要な JSON ルール：**
- 文字列には二重引用符 `"` を使用します（単一引用符ではなく）
- 最後の項目の後に末尾のコンマはありません
- ファイルは有効な JSON である必要があります（確実でない場合は [JSON validator](https://jsonlint.com/) を使用してください）

</details>

---

## MCP サーバーの追加

GitHub MCP サーバーは組み込まれており、セットアップは不要です。以下は追加できる追加サーバーです。**興味のあるものを選ぶか、順番に進めてください。**

| やりたいこと | ジャンプ先 |
|---|---|
| Copilot にプロジェクトファイルを参照させる | [Filesystem Server](#filesystem-server) |
| 最新のライブラリドキュメントを取得する | [Context7 Server](#context7-server-documentation) |
| オプション機能を探索（カスタムサーバー、web_fetch） | [Beyond the Basics](#beyond-the-basics) |

<details>
<summary><strong>Filesystem Server</strong> - Copilot にプロジェクトファイルを探索させる</summary>
<a id="filesystem-server"></a>

### Filesystem Server

```json
{
  "mcpServers": {
    "filesystem": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."],
      "tools": ["*"]
    }
  }
}
```

> 💡 **`.` パス**：`.` は「現在のディレクトリ」を意味します。Copilot は起動した場所からの相対的なファイルにアクセスできます。Codespace では、これはワークスペースルートです。必要に応じて `/workspaces/copilot-cli-for-beginners` のような絶対パスを使用することもできます。

これを `~/.copilot/mcp-config.json` に追加して、Copilot を再起動してください。

</details>

<details>
<summary><strong>Context7 Server</strong> - 最新のライブラリドキュメントを取得</summary>
<a id="context7-server-documentation"></a>

### Context7 Server (ドキュメント)

Context7 は Copilot に人気フレームワークとライブラリの最新ドキュメントへのアクセスを提供します。古い可能性のある学習データに依存するのではなく、Copilot は実際の現在のドキュメントを取得します。

```json
{
  "mcpServers": {
    "context7": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"],
      "tools": ["*"]
    }
  }
}
```

- ✅ **API キー不要** 
- ✅ **アカウント不要** 
- ✅ **コードはローカルのまま**

これを `~/.copilot/mcp-config.json` に追加して、Copilot を再起動してください。

</details>

<details>
<summary><strong>Beyond the Basics</strong> - カスタムサーバーと Web アクセス（オプション）</summary>
<a id="beyond-the-basics"></a>

これらはコア サーバーに満足した場合のオプション機能です。

### Microsoft Learn MCP Server

これまで見てきたすべての MCP サーバー（filesystem、Context7）はマシン上でローカルで実行されます。しかし、MCP サーバーはリモートで実行することもできます。つまり、URL を指定するだけで、後は自動で処理されます。`npx` も `python` も、ローカルプロセスも、インストールするべき依存関係もありません。

[Microsoft Learn MCP Server](https://github.com/microsoftdocs/mcp) は良い例です。これは Copilot CLI に公式 Microsoft ドキュメント（Azure、Microsoft Foundry と AI トピック、.NET、Microsoft 365 など）への直接アクセスを提供するため、モデルの学習データに依存するのではなく、ドキュメントを検索し、完全なページをフェッチし、公式コード例を見つけることができます。

- ✅ **API キー不要** 
- ✅ **アカウント不要** 
- ✅ **ローカルインストール不要**

**`/plugin install` でのクイックインストール：**

JSON 設定ファイルを手動で編集する代わりに、1 つのコマンドでインストールできます：

```bash
copilot

> /plugin install microsoftdocs/mcp
```

これはサーバーと関連するエージェントスキルを自動的に追加します。インストールされるスキルは以下を含みます：

- **microsoft-docs**：コンセプト、チュートリアル、事実確認
- **microsoft-code-reference**：API 検索、コード例、トラブルシューティング
- **microsoft-skill-creator**：Microsoft テクノロジについてカスタムスキルを生成するためのメタスキル

**使用方法：**
```bash
copilot

> What's the recommended way to deploy a Python app to Azure App Service? Search Microsoft Learn.
```

📚 詳細情報：[Microsoft Learn MCP Server overview](https://learn.microsoft.com/training/support/mcp-get-started)

### `web_fetch` での Web アクセス

Copilot CLI には、任意の URL からコンテンツをフェッチできる組み込みの `web_fetch` ツールが含まれています。これは README、API ドキュメント、リリースノートをターミナルを離れずに取得するのに役立ちます。MCP サーバーは不要です。

`~/.copilot/config.json`（一般 Copilot 設定）を使用してアクセス可能な URL を制御できます。これは `~/.copilot/mcp-config.json`（MCP サーバー定義）とは別です。

```json
{
  "permissions": {
    "allowedUrls": [
      "https://api.github.com/**",
      "https://docs.github.com/**",
      "https://*.npmjs.org/**"
    ],
    "blockedUrls": [
      "http://**"
    ]
  }
}
```

**使用方法：**
```bash
copilot

> Fetch and summarize the README from https://github.com/facebook/react
```

### カスタム MCP サーバーの構築

Copilot を独自の API、データベース、または内部ツールに接続したいですか？Python でカスタム MCP サーバーを構築できます。プリビルト サーバー（GitHub、filesystem、Context7）がほとんどのユースケースをカバーしているため、これは完全にオプションです。

📖 book app を例として使用した完全なウォークスルーについては、[Custom MCP Server Guide](mcp-custom-server.md) を参照してください。

📚 詳細については、[MCP for Beginners course](https://github.com/microsoft/mcp-for-beginners) を参照してください。

</details>

<a id="complete-configuration-file"></a>

### 完全な設定ファイル

Filesystem と Context7 サーバーを含む完全な `mcp-config.json` を以下に示します：

> 💡 **注意**：GitHub MCP は組み込まれています。設定ファイルに追加する必要はありません。

```json
{
  "mcpServers": {
    "filesystem": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."],
      "tools": ["*"]
    },
    "context7": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"],
      "tools": ["*"]
    }
  }
}
```

これを `~/.copilot/mcp-config.json` でグローバルアクセスとして、または `.vscode/mcp.json` でプロジェクト固有の設定として保存してください。

---

# MCP サーバーの使用

MCP サーバーが設定されたので、何ができるかを見てみましょう。

<img src="images/using-mcp-servers.png" alt="Using MCP Servers - Hub-and-spoke diagram showing a Developer CLI connected to GitHub, Filesystem, Context7, and Custom/Web Fetch servers" width="800" />

---

## サーバー使用例

**サーバーを選んで探索するか、順番に進めてください。**

| 試したいもの | ジャンプ先 |
|---|---|
| GitHub リポジトリ、issue、PR | [GitHub Server](#github-server-built-in) |
| プロジェクトファイルの参照 | [Filesystem Server Usage](#filesystem-server-usage) |
| ライブラリドキュメント検索 | [Context7 Server Usage](#context7-server-usage) |
| カスタムサーバー、Microsoft Learn MCP、web_fetch 使用法 | [Beyond the Basics Usage](#beyond-the-basics-usage) |

<details>
<summary><strong>GitHub Server (Built-in)</strong> - リポジトリ、issue、PR などにアクセス</summary>
<a id="github-server-built-in"></a>

### GitHub Server (組み込み)

GitHub MCP サーバーは **組み込まれています**。Copilot にログインした場合（初期セットアップ時にしたはず）、すでに機能しています。設定は不要です！

> 💡 **動作しませんか？** `/login` を実行して GitHub を使用して再認証してください。

<details>
<summary><strong>Dev Containers での認証</strong></summary>

- **GitHub Codespaces**（推奨）：認証は自動です。`gh` CLI は Codespace トークンを継承します。アクションは不要です。
- **ローカル dev container (Docker)**：コンテナが開始した後に `gh auth login` を実行してから、Copilot を再起動してください。

**認証トラブルシューティング：**
```bash
# 認証されているか確認
gh auth status

# ログインしていない場合
gh auth login

# GitHub MCP が接続されていることを確認
copilot
> /mcp show
```

</details>

| 機能 | 例 |
|---------|----------|
| **リポジトリ情報** | コミット、ブランチ、貢献者を表示 |
| **Issue** | Issue をリスト、作成、検索、コメント |
| **Pull Request** | PR を表示、diff、PR を作成、ステータスをチェック |
| **コード検索** | リポジトリ全体でコードを検索 |
| **Actions** | ワークフロー実行とステータスをクエリ |

```bash
copilot

# このリポジトリの最近の活動を参照
> List the last 5 commits in this repository

Recent commits:
1. abc1234 - Update chapter 05 skills examples (2 days ago)
2. def5678 - Add book app test fixtures (3 days ago)
3. ghi9012 - Fix typo in chapter 03 README (4 days ago)
...

# リポジトリ構造を探索
> What branches exist in this repository?

Branches:
- main (default)
- chapter6 (current)

# リポジトリ全体でコードパターンを検索
> Search this repository for files that import pytest

Found 1 file:
- samples/book-app-project/tests/test_books.py
```

> 💡 **自分のフォークで作業していますか？** このコースリポジトリをフォークした場合、issue の作成や PR などのライト操作も試すことができます。以下の演習でそれを実践します。

> ⚠️ **結果が見えませんか？** GitHub MCP はローカルファイルだけでなく、リポジトリのリモート（github.com）で動作します。リポジトリがリモートを持っていることを確認してください：`git remote -v` を実行してチェックしてください。

</details>

<details>
<summary><strong>Filesystem Server</strong> - プロジェクトファイルを参照・分析</summary>
<a id="filesystem-server-usage"></a>

### Filesystem Server

設定されると、filesystem MCP は Copilot が自動的に使用できるツールを提供します：

```bash
copilot

> How many Python files are in the book-app-project directory?

Found 3 Python files in samples/book-app-project/:
- book_app.py
- books.py
- utils.py

> What's the total size of the data.json file?

samples/book-app-project/data.json: 2.4 KB

> Find all functions that don't have type hints in the book app

Found 2 functions without type hints:
- samples/book-app-project/utils.py:10 - get_user_choice()
- samples/book-app-project/utils.py:14 - get_book_details()
```

</details>

<details>
<summary><strong>Context7 Server</strong> - ライブラリドキュメントを参照</summary>
<a id="context7-server-usage"></a>

### Context7 Server

```bash
copilot

> What are the best practices for using pytest fixtures?

From pytest Documentation:

Fixtures - Use fixtures to provide a fixed baseline for tests:

    import pytest

    @pytest.fixture
    def sample_books():
        return [
            {"title": "1984", "author": "George Orwell", "year": 1949},
            {"title": "Dune", "author": "Frank Herbert", "year": 1965},
        ]

    def test_find_by_author(sample_books):
        # fixture is automatically passed as argument
        results = [b for b in sample_books if "Orwell" in b["author"]]
        assert len(results) == 1

Best practices:
- Use fixtures instead of setup/teardown methods
- Use tmp_path fixture for temporary files
- Use monkeypatch for modifying environment
- Scope fixtures appropriately (function, class, module, session)

> How can I apply this to the book app's test file?

# Copilot now knows the official pytest patterns
# and can apply them to samples/book-app-project/tests/test_books.py
```

</details>

<details>
<summary><strong>Beyond the Basics</strong> - カスタムサーバーと web_fetch 使用法</summary>
<a id="beyond-the-basics-usage"></a>

### Beyond the Basics

**カスタム MCP Server**：[Custom MCP Server Guide](mcp-custom-server.md) から book-lookup サーバーを構築した場合、book collection を直接クエリできます：

```bash
copilot

> Look up information about "1984" using the book lookup server. Search for books by George Orwell
```

**Microsoft Learn MCP**：[Microsoft Learn MCP server](#microsoft-learn-mcp-server) をインストールした場合、公式 Microsoft ドキュメントを直接参照できます：

```bash
copilot

> How do I configure managed identity for an Azure Function? Search Microsoft Learn.
```

**Web Fetch**：組み込みの `web_fetch` ツールを使用して、任意の URL からコンテンツをプルイン：

```bash
copilot

> Fetch and summarize the README from https://github.com/facebook/react
```

</details>

---

## マルチサーバーワークフロー

これらのワークフローは、開発者が「これなしで仕事をしたくない」と言う理由を示しています。各例は、1 つのセッションで複数の MCP サーバーを組み合わせています。

<img src="images/issue-to-pr-workflow.png" alt="Issue to PR Workflow using MCP - Shows the complete flow from getting a GitHub issue through creating a pull request" width="800"/>

*完全な MCP ワークフロー：GitHub MCP がリポジトリデータを取得し、Filesystem MCP がコードを見つけ、Context7 MCP がベストプラクティスを提供し、Copilot が分析を処理*

以下の各例は自己完結しています。**興味のあるものを 1 つ選ぶか、すべてを読んでください。**

| 見たいもの | ジャンプ先 |
|---|---|
| 複数のサーバーが一緒に機能 | [Multi-Server Exploration](#multi-server-exploration) |
| Issue から PR へ、1 つのセッションで | [Issue-to-PR Workflow](#issue-to-pr-workflow) |
| クイックなプロジェクトヘルスチェック | [Health Dashboard](#health-dashboard) |

<details>
<summary><strong>Multi-Server Exploration</strong> - 1 つのセッションで filesystem、GitHub、Context7 を組み合わせる</summary>
<a id="multi-server-exploration"></a>

#### 複数の MCP サーバーで Book App を探索

```bash
copilot

# ステップ 1：filesystem MCP を使用して book app を探索
> List all Python files in samples/book-app-project/ and summarize
> what each file does

Found 3 Python files:
- book_app.py: CLI entry point with command routing (list, add, remove, find)
- books.py: BookCollection class with data persistence via JSON
- utils.py: Helper functions for user input and display

# ステップ 2：GitHub MCP を使用して最近の変更をチェック
> What were the last 3 commits that touched files in samples/book-app-project/?

Recent commits affecting book app:
1. abc1234 - Add test fixtures for BookCollection (2 days ago)
2. def5678 - Add find_by_author method (5 days ago)
3. ghi9012 - Initial book app setup (1 week ago)

# ステップ 3：Context7 MCP を使用してベストプラクティスを参照
> What are Python best practices for JSON data persistence?

From Python Documentation:
- Use context managers (with statements) for file I/O
- Handle JSONDecodeError for corrupted files
- Use dataclasses for structured data
- Consider atomic writes to prevent data corruption

# ステップ 4：推奨事項を合成
> Based on the book app code and these best practices,
> what improvements would you suggest?

Suggestions:
1. Add input validation in add_book() for empty strings and invalid years
2. Consider atomic writes in save_books() to prevent data corruption
3. Add type hints to utils.py functions (get_user_choice, get_book_details)
```

<details>
<summary>🎬 MCP ワークフローが実際に動作しているのを見てください！</summary>

![MCP Workflow Demo](images/mcp-workflow-demo.gif)

*デモの出力は異なります。あなたのモデル、ツール、応答はここに示されているものとは異なります。*

</details>

**結果**：コード探索 → 履歴レビュー → ベストプラクティス検索 → 改善計画。**1 つのターミナルセッションから、3 つの MCP サーバーを一緒に使用してすべてができます。**

</details>

<details>
<summary><strong>Issue-to-PR Workflow</strong> - GitHub issue から PR へ、ターミナルを離れずに</summary>
<a id="issue-to-pr-workflow"></a>

#### Issue から PR へのワークフロー（自分のリポジトリで）

これは、ライトアクセス権を持つ自分のフォークまたはリポジトリで最適です：

> 💡 **今これを試せない場合は心配しないでください。** 読み取り専用クローンを使用している場合、課題で実践します。今のところ、フローを理解するために読んでください。

```bash
copilot

> Get the details of GitHub issue #1

Issue #1: Add input validation for book year
Status: Open
Description: The add_book function accepts any year value...

> @samples/book-app-project/books.py Fix the issue described in issue #1

[Copilot implements year validation in add_book()]

> Run the tests to make sure the fix works

All 8 tests passed ✓

> Create a pull request titled "Add year validation to book app"

✓ Created PR #2: Add year validation to book app
```

**コピーペーストなし。コンテキストスイッチなし。1 つのターミナルセッション。**

</details>

<details>
<summary><strong>Health Dashboard</strong> - 複数のサーバーを使用したクイックなプロジェクトヘルスチェック</summary>
<a id="health-dashboard"></a>

#### Book App ヘルスダッシュボード

```bash
copilot

> Give me a health report for the book app project:
> 1. List all functions across the Python files in samples/book-app-project/
> 2. Check which functions have type hints and which don't
> 3. Show what tests exist in samples/book-app-project/tests/
> 4. Check the recent commit history for this directory

Book App Health Report
======================

📊 Functions Found:
- books.py: 8 methods in BookCollection (all have type hints ✓)
- book_app.py: 6 functions (4 have type hints, 2 missing)
- utils.py: 3 functions (1 has type hints, 2 missing)

🧪 Test Coverage:
- test_books.py: 8 test functions covering BookCollection
- Missing: no tests for book_app.py CLI functions
- Missing: no tests for utils.py helper functions

📝 Recent Activity:
- 3 commits in the last week
- Most recent: added test fixtures

Recommendations:
- Add type hints to utils.py functions
- Add tests for book_app.py CLI handlers
- All files well-sized (<100 lines) - good structure!
```

**結果**：複数のデータソースが数秒で集約されます。手動で行う場合、grep の実行、行数のカウント、git log のチェック、テストファイルの参照が必要で、簡単に 15 分以上の作業になります。

</details>

---

# 実践

<img src="../images/practice.png" alt="Warm desk setup with monitor showing code, lamp, coffee cup, and headphones ready for hands-on practice" width="800"/>

**🎉 エッセンシャルを理解しました！** MCP を理解し、サーバーの設定方法を見て、実際のワークフローの動作を確認しました。今はあなた自身が試す番です。

---

## ▶️ 自分で試してみてください

これらの演習を完了して、book app プロジェクトで MCP サーバーを使用する実践を行います。

### 演習 1：MCP ステータスをチェック

利用可能な MCP サーバーを確認することから始めます：

```bash
copilot

> /mcp show
```

GitHub サーバーが有効として表示されるはずです。そうでない場合は、`/login` を実行して認証してください。

---

### 演習 2：Filesystem MCP で Book App を探索

filesystem サーバーを設定した場合は、それを使用して book app を探索します：

```bash
copilot

> How many Python files are in samples/book-app-project/?
> What functions are defined in each file?
```

**予想される結果**：Copilot が `book_app.py`、`books.py`、`utils.py` をそれぞれの関数とともにリストします。

> 💡 **filesystem MCP をまだ設定していませんか？** 上の[Complete Configuration](#complete-configuration-file) セクションから設定ファイルを作成してください。その後、Copilot を再起動してください。

---

### 演習 3：GitHub MCP でリポジトリ履歴をクエリ

組み込みの GitHub MCP を使用してこのコースリポジトリを探索します：

```bash
copilot

> List the last 5 commits in this repository

> What branches exist in this repository?
```

**予想される結果**：Copilot が GitHub リモートから最近のコミットメッセージとブランチ名を表示します。

> ⚠️ **Codespace にいますか？** これは自動的に機能します。認証は継承されます。ローカルクローンを使用している場合は、`gh auth status` が認証されていることを示していることを確認してください。

---

### 演習 4：複数の MCP サーバーを組み合わせる

1 つのセッションで filesystem と GitHub MCP を組み合わせます：

```bash
copilot

> Read samples/book-app-project/data.json and tell me what books are
> in the collection. Then check the recent commits to see when this
> file was last modified.
```

**予想される結果**：Copilot が JSON ファイルを読み取り（filesystem MCP）、「The Hobbit」、「1984」、「Dune」、「To Kill a Mockingbird」、「Mysterious Book」を含む 5 冊をリストし、その後 GitHub にコミット履歴をクエリします。

**セルフチェック**：「Check my repo's commit history」が手動で `git log` を実行して出力をプロンプトに貼り付けるより優れている理由を説明できる場合、MCP を理解しています。

---

## 📝 課題

### メインチャレンジ：Book App MCP 探索

Book app プロジェクトで MCP サーバーを一緒に使用する実践をしてください。これらのステップを 1 つの Copilot セッションで完了してください：

1. **MCP が機能していることを確認**：`/mcp show` を実行し、少なくても GitHub サーバーが有効になっていることを確認します
2. **Filesystem MCP をセットアップ**（まだの場合）：filesystem サーバー設定で `~/.copilot/mcp-config.json` を作成します
3. **コードを探索**：Copilot に filesystem サーバーを使用するように依頼して：
   - `samples/book-app-project/books.py` のすべての関数をリストする
   - `samples/book-app-project/utils.py` で型ヒントがない関数をチェックする
   - `samples/book-app-project/data.json` を読み取ってデータ品質の問題を特定する（ヒント：最後のエントリを見てください）
4. **リポジトリアクティビティをチェック**：Copilot に GitHub MCP を使用するように依頼して：
   - `samples/book-app-project/` 内のファイルに影響した最近のコミットをリストする
   - オープンな issue または PR があるかをチェックする
5. **サーバーを組み合わせ**：1 つのプロンプトで、Copilot に以下をするように依頼してください：
   - `samples/book-app-project/tests/test_books.py` のテストファイルを読む
   - テストされた関数を `books.py` のすべての関数と比較する
   - 欠落しているテストカバレッジを要約する

**成功基準**：1 つの Copilot セッションで filesystem と GitHub MCP デ をシームレスに組み合わせることができ、各 MCP サーバーが応答にどのように貢献したかを説明できます。

<details>
<summary>💡 ヒント（クリックして展開）</summary>

**ステップ 1：MCP を確認**
```bash
copilot
> /mcp show
# GitHub が有効として表示されるはず
# そうでない場合は、実行してください： /login
```

**ステップ 2：設定ファイルを作成**

上の [Complete Configuration](#complete-configuration-file) セクションから JSON を使用して、`~/.copilot/mcp-config.json` として保存してください。

**ステップ 3：データ品質の問題を探す**

`data.json` の最後の本は：
```json
{
  "title": "Mysterious Book",
  "author": "",
  "year": 0,
  "read": false
}
```
空の著者と 0 の年です。それはデータ品質の問題です！

**ステップ 5：テストカバレッジ比較**

`test_books.py` のテストはカバーしています：`add_book`、`mark_as_read`、`remove_book`、`get_unread_books`、`find_book_by_title`。`load_books`、`save_books`、`list_books` のような関数は直接テストがありません。`book_app.py` の CLI 関数と `utils.py` のヘルパー関数にはテストがまったくありません。

**MCP が機能していない場合**：設定ファイルを編集した後、Copilot を再起動してください。

</details>

### ボーナスチャレンジ：カスタム MCP サーバーを構築

もっと深く学ぶ準備ができていますか？[Custom MCP Server Guide](mcp-custom-server.md) に従って、任意の API に接続する Python で独自の MCP サーバーを構築してください。

---

<details>
<summary>🔧 <strong>よくある間違い＆トラブルシューティング</strong>（クリックして展開）</summary>

### よくある間違い

| 間違い | 何が起こるか | 修正方法 |
|---------|--------------|-----|
| GitHub MCP が組み込まれていることを知らない | 手動でインストール/設定しようとする | GitHub MCP はデフォルトで含まれています。試してみてください：「List the recent commits in this repo」 |
| 設定が間違ったロケーションにある | MCP 設定が見つからないか編集できない | ユーザーレベルの設定は `~/.copilot/mcp-config.json`、プロジェクトレベルは `.vscode/mcp.json` です |
| 設定ファイルの JSON が無効 | MCP サーバーがロードされない | `/mcp show` を使用して設定をチェックしてください；JSON 構文を検証してください |
| MCP サーバーの認証を忘れる | 「認証に失敗しました」エラー | 一部の MCP には別の認証が必要です。各サーバーの要件をチェックしてください |

### トラブルシューティング

**「MCP server not found」** - 以下をチェックしてください：
1. npm パッケージが存在するか：`npm view @modelcontextprotocol/server-github`
2. 設定が有効な JSON か
3. サーバー名が設定と一致するか

`/mcp show` を使用して現在の設定を確認してください。

**「GitHub authentication failed」** - 組み込みの GitHub MCP は `/login` 認証情報を使用します。試してください：

```bash
copilot
> /login
```

これはあなたを GitHub で再認証します。問題が続く場合は、GitHub アカウントがアクセスしようとしているリポジトリの必要な権限を持っていることを確認してください。

**「MCP server failed to start」** - サーバーログをチェックしてください：
```bash
# サーバーコマンドを手動で実行してエラーを確認
npx -y @modelcontextprotocol/server-github
```

**MCP ツールが使用できない** - サーバーが有効になっていることを確認してください：
```bash
copilot

> /mcp show
# サーバーがリストされ、有効になっているかをチェック
```

サーバーが無効化されている場合は、以下の[追加の `/mcp` コマンド](#-additional-mcp-commands)を参照して、それを再度有効にする方法を確認してください。

</details>

---

<details>
<summary>📚 <strong>追加の MCP コマンド</strong>（クリックして展開）</summary>
<a id="-additional-mcp-commands"></a>

MCP サーバーを 2 つの方法で管理できます：チャットセッション内で **スラッシュコマンド** を使用するか、**`copilot mcp` コマンド** をターミナルから直接使用します（チャットセッション不要）。

### オプション 1：スラッシュコマンド（チャットセッション内）

これらは `copilot` の内部にいる場合に機能します：

| コマンド | 実行内容 |
|---------|--------------|
| `/mcp show` | すべての設定済み MCP サーバーとそのステータスを表示 |
| `/mcp add` | 新しいサーバーを追加するためのインタラクティブセットアップ |
| `/mcp edit <server-name>` | 既存のサーバー設定を編集 |
| `/mcp enable <server-name>` | 無効化されたサーバーを有効化（セッション間で保持） |
| `/mcp disable <server-name>` | サーバーを無効化（セッション間で保持） |
| `/mcp delete <server-name>` | サーバーを永続的に削除 |
| `/mcp auth <server-name>` | OAuth を使用する MCP サーバーで再認証（アカウント切り替え後など） |

### オプション 2：`copilot mcp` コマンド（ターミナルから）

チャットセッションを最初に開始せずに、ターミナルから直接 MCP サーバーを管理することもできます：

```bash
# すべての設定済み MCP サーバーをリスト
copilot mcp list

# サーバーを有効化
copilot mcp enable filesystem

# サーバーを無効化
copilot mcp disable context7
```

> 💡 **どれを使用すればよいですか？** チャットセッション内にいるときは `/mcp` スラッシュコマンドを使用してください。セッションを開始する前にサーバー設定を素早くチェックしたり変更したりしたい場合は、ターミナルから `copilot mcp` を使用してください。

このコースのほとんどでは、`/mcp show` で十分です。他のコマンドは、時間の経過とともにさらに多くのサーバーを管理する場合に便利になります。

</details>

---

# 要約

## 🔑 重要なポイント

1. **MCP** は Copilot を外部サービス（GitHub、ファイルシステム、ドキュメント）に接続します
2. **GitHub MCP は組み込まれています** - 設定不要。`/login` するだけ
3. **Filesystem と Context7** は `~/.copilot/mcp-config.json` を経由して設定されます
4. **マルチサーバーワークフロー** は 1 つのセッションで複数のソースからデータを結合します
5. **2 つのサーバー管理方法**：チャット内で `/mcp` スラッシュコマンドを使用するか、ターミナルから `copilot mcp` を使用します
6. **カスタムサーバー** は任意の API の接続を可能にします（オプション、付録ガイドで説明）

> 📋 **クイックリファレンス**：完全なコマンドとショートカットのリストについては、[GitHub Copilot CLI command reference](https://docs.github.com/en/copilot/reference/cli-command-reference) を参照してください。

---

## ➡️ 次は何ですか？

すべてのビルディングブロックができました：modes、context、workflows、agents、skills、MCP。すべてを一緒に持ってくる時間です。

**[Chapter 07: Putting It All Together](../07-putting-it-together/README.md)** では、以下を学びます：

- Agents、skills、MCP をユニファイドワークフローに組み合わせる
- アイデアからマージされた PR まで完全な機能開発
- フック使用してのオートメーション
- チーム環境でのベストプラクティス

---

**[← Chapter 05 に戻る](../05-skills/README.md)** | **[Chapter 07 に進む →](../07-putting-it-together/README.md)**
