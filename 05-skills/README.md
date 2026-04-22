![Chapter 05: Skills System](images/chapter-header.png)

> **Copilot がチームのベストプラクティスを毎回説明することなく自動的に適用できたら、どうでしょうか？**

このチャプターでは、Agent Skills について学びます。これは、タスクに関連する場合に Copilot が自動的にロードする命令のフォルダです。エージェントが Copilot の思考方法を変えるのに対して、スキルは Copilot に特定のタスク完了方法を教えます。セキュリティ監査スキルを作成して Copilot がセキュリティについて質問されるときに適用させ、チームの標準レビュー基準を構築して一貫したコード品質を確保し、Copilot CLI、VS Code、GitHub Copilot クラウドエージェント全体でスキルがどのように動作するかを学びます。


## 🎯 学習目標

このチャプターの終了時に、以下のことができるようになります：

- Agent Skills がどのように動作し、いつ使用するかを理解する
- SKILL.md ファイルでカスタムスキルを作成する
- 共有リポジトリからコミュニティスキルを使用する
- スキル、エージェント、MCP をいつ使い分けるかを知る

> ⏱️ **所要時間**: 約 55 分（読んで 20 分 + 実践 35 分）

---

## 🧩 実例：パワーツール

汎用ドリルは便利ですが、特殊なアタッチメントにより強力になります。
<img src="images/power-tools-analogy.png" alt="Power Tools - Skills Extend Copilot's Capabilities" width="800"/>


スキルも同じ方法で機能します。異なるジョブに対してドリルビットを交換するのと同じように、異なるタスク用に Copilot にスキルを追加できます：

| スキルアタッチメント | 目的 |
|------------|---------|
| `commit` | 一貫性のある commit メッセージを生成 |
| `security-audit` | OWASP 脆弱性をチェック |
| `generate-tests` | 包括的な pytest テストを作成 |
| `code-checklist` | チームのコード品質基準を適用 |



*スキルは Copilot ができることを拡張する特殊なアタッチメントです*

---

---

# スキルのしくみ

<img src="images/how-skills-work.png" alt="Glowing RPG-style skill icons connected by light trails on a starfield background representing Copilot skills" width="800"/>

スキルが何であるか、なぜ重要なのか、エージェントと MCP とどう違うのかを学びます。

---

## *スキル初心者向け* ここから始めよう！

1. **利用可能なスキルを確認：**
   ```bash
   copilot
   > /skills list
   ```
   これは、Copilot が見つけることができるすべてのスキルを表示します。これには、CLI 自体に付属する**組み込みスキル**、およびプロジェクトと個人フォルダからのスキルが含まれます。

   > 💡 **組み込みスキル**：Copilot CLI にはあらかじめインストールされたスキルが付属しています。例えば、`customizing-copilot-cloud-agents-environment` スキルは Copilot クラウドエージェントの環境をカスタマイズするためのガイドを提供します。これらを使用するために何もインストールする必要はありません。`/skills list` を実行して利用可能なものを確認してください。

2. **実際のスキルファイルを確認：** 提供されている [code-checklist SKILL.md](../.github/skills/code-checklist/SKILL.md) をチェックしてパターンを確認します。YAML frontmatter とマークダウン命令だけです。

3. **基本的な概念を理解：** スキルはタスク固有の命令で、プロンプトがスキルの説明に一致する場合に Copilot が**自動的にロード**します。アクティベートする必要はなく、自然に質問するだけです。


## スキルの理解

Agent Skills は、Copilot がタスクに**関連する場合に自動的にロード**する命令、スクリプト、リソースを含むフォルダです。Copilot はプロンプトを読み、スキルが一致するかをチェックし、関連する命令を自動的に適用します。

```bash
copilot

> Check books.py against our quality checklist
# Copilot detects this matches your "code-checklist" skill
# and automatically applies its Python quality checklist

> Generate tests for the BookCollection class
# Copilot loads your "pytest-gen" skill
# and applies your preferred test structure

> What are the code quality issues in this file?
# Copilot loads your "code-checklist" skill
# and checks against your team's standards
```

> 💡 **重要な洞察**：スキルはプロンプトがスキルの説明に一致するかどうかに基づいて**自動的にトリガーされます**。自然に質問するだけで、Copilot が関連するスキルをバックグラウンドで適用します。次に学習するように、スキルを直接呼び出すこともできます。

> 🧰 **すぐに使えるテンプレート**：[.github/skills](../.github/skills/) フォルダで、試すことができるシンプルなコピー＆ペーストスキルを確認してください。

### 直接スラッシュコマンドによる呼び出し

オートトリガーはスキルが機能する主要な方法ですが、スラッシュコマンドを使用してスキル名を使ってスキルを**直接呼び出す**こともできます：

```bash
> /generate-tests Create tests for the user authentication module

> /code-checklist Check books.py for code quality issues

> /security-audit Check the API endpoints for vulnerabilities
```

これにより、特定のスキルが使用されることを確実にしたい場合に明示的な制御ができます。

> 📝 **スキルとエージェントの呼び出し**：スキル呼び出しとエージェント呼び出しを混同しないでください：
> - **Skills**：`/skill-name <prompt>`、例：`/code-checklist Check this file`
> - **Agents**：`/agent`（リストから選択）または `copilot --agent <name>`（コマンドライン）
>
> スキルとエージェントで同じ名前がある場合（例："code-reviewer"）、`/code-reviewer` と入力するとエージェントではなく**スキル**を呼び出します。

### スキルが使用されたかどうかはどうやってわかる？

Copilot に直接質問できます：

```bash
> What skills did you use for that response?

> What skills do you have available for security reviews?
```

### スキル vs エージェント vs MCP

スキルは GitHub Copilot の拡張モデルの一部に過ぎません。エージェントと MCP サーバーと比較してみましょう。

> *MCP についてはまだ心配しないでください。[チャプター 06](../06-mcp-servers/) で説明します。スキルがどのように全体像に適合するかを確認できるように、ここに含まれています。*

<img src="images/skills-agents-mcp-comparison.png" alt="Comparison diagram showing the differences between Agents, Skills, and MCP Servers and how they combine into your workflow" width="800"/>

| 機能 | 説明 | 使用時期 |
|---------|--------------|-------------|
| **Agents** | AI の思考方法を変える | 多くのタスクで専門知識が必要 |
| **Skills** | タスク固有の命令を提供 | 詳細な手順を持つ特定の反復可能なタスク |
| **MCP** | 外部サービスに接続 | API からライブデータが必要 |

広範な専門知識にはエージェントを、特定のタスク命令にはスキルを、外部データには MCP を使用してください。エージェントは会話中に 1 つ以上のスキルを使用できます。例えば、コードをチェックするようにエージェントに指示する場合、`security-audit` スキルと `code-checklist` スキルの両方を自動的に適用する可能性があります。

> 📚 **詳細情報**：スキル形式とベストプラクティスに関する完全なリファレンスは、公式の [About Agent Skills](https://docs.github.com/copilot/concepts/agents/about-agent-skills) ドキュメントを参照してください。

---

## 手動プロンプトから自動専門知識へ

スキルの作成方法を詳しく学ぶ前に、*なぜ*学ぶ価値があるのかを確認しましょう。一貫性の向上を見ると、「方法」がより理にかなっています。

### スキル前：一貫性のないレビュー

コードレビューのたびに、何かを忘れるかもしれません：

```bash
copilot

> Review this code for issues
# Generic review - might miss your team's specific concerns
```

または、毎回長いプロンプトを書きます：

```bash
> Review this code checking for bare except clauses, missing type hints,
> mutable default arguments, missing context managers for file I/O,
> functions over 50 lines, print statements in production code...
```

時間：**30 秒以上** かかります。一貫性：**メモリに依存します**。

### スキル後：自動ベストプラクティス

`code-checklist` スキルがインストールされていると、自然に質問するだけです：

```bash
copilot

> Check the book collection code for quality issues
```

**バックグラウンドで起こること**：
1. Copilot がプロンプト内の「code quality」と「issues」を認識
2. スキル説明をチェックし、`code-checklist` スキルが一致することを見つけ
3. チーム品質チェックリストを自動的にロード
4. 一覧表示しなくてもすべてのチェックを適用

<img src="images/skill-auto-discovery-flow.png" alt="How Skills Auto-Trigger - 4-step flow showing how Copilot automatically matches your prompt to the right skill" width="800"/>

*自然に質問するだけ。Copilot が自動的にプロンプトを正しいスキルにマッチさせて適用します。*

**出力**：
```
## Code Checklist: books.py

### Code Quality
- [PASS] All functions have type hints
- [PASS] No bare except clauses
- [PASS] No mutable default arguments
- [PASS] Context managers used for file I/O
- [PASS] Functions are under 50 lines
- [PASS] Variable and function names follow PEP 8

### Input Validation
- [FAIL] User input is not validated - add_book() accepts any year value
- [FAIL] Edge cases not fully handled - empty strings accepted for title/author
- [PASS] Error messages are clear and helpful

### Testing
- [FAIL] No corresponding pytest tests found

### Summary
3 items need attention before merge
```

**違い**：チーム標準が毎回自動的に適用され、入力する必要がなくなります。

---

<details>
<summary>🎬 See it in action!</summary>

![Skill Trigger Demo](images/skill-trigger-demo.gif)

*Demo output varies. Your model, tools, and responses will differ from what's shown here.*

</details>

---

---

## スケールでの一貫性：チーム PR レビュースキル

チームに 10 項目の PR チェックリストがあると想像してください。スキルなしでは、すべての開発者が 10 項目すべてを記憶する必要があり、誰かが必ずその 1 つを忘れます。`pr-review` スキルを使用すれば、チーム全体が一貫したレビューを取得します：

```bash
copilot

> Can you review this PR?
```

Copilot が自動的にチームの `pr-review` スキルをロードし、すべての 10 項目をチェックします：

```
PR Review: feature/user-auth

## Security ✅
- No hardcoded secrets
- Input validation present
- No bare except clauses

## Code Quality ⚠️
- [WARN] print statement on line 45 - remove before merge
- [WARN] TODO on line 78 missing issue reference
- [WARN] Missing type hints on public functions

## Testing ✅
- New tests added
- Edge cases covered

## Documentation ❌
- [FAIL] Breaking change not documented in CHANGELOG
- [FAIL] API changes need OpenAPI spec update
```

**パワー**：チームメンバーがすべて同じ基準を自動的に適用します。新入社員はスキルがそれを処理するため、チェックリストを暗記する必要がありません。

---

---

# カスタムスキルの作成

<img src="images/creating-managing-skills.png" alt="Human and robotic hands building a wall of glowing LEGO-like blocks representing skill creation and management" width="800"/>

SKILL.md ファイルから独自のスキルを構築します。

---

## スキルの場所

スキルは `.github/skills/`（プロジェクト固有）または `~/.copilot/skills/`（ユーザーレベル）に保存されます。

### Copilot がスキルを見つける方法

Copilot はこれらの場所を自動的にスキルでスキャンします：

| 場所 | スコープ |
|----------|-------|
| `.github/skills/` | プロジェクト固有（git 経由でチームと共有） |
| `~/.copilot/skills/` | ユーザー固有（個人的なスキル） |

### スキルの構造

各スキルは `SKILL.md` ファイルを含む独自のフォルダにあります。オプションでスクリプト、例、またはその他のリソースを含めることができます：

```
.github/skills/
└── my-skill/
    ├── SKILL.md           # Required: Skill definition and instructions
    ├── examples/          # Optional: Example files Copilot can reference
    │   └── sample.py
    └── scripts/           # Optional: Scripts the skill can use
        └── validate.sh
```

> 💡 **ヒント**：ディレクトリ名は SKILL.md frontmatter の `name`（小文字、ハイフン）と一致する必要があります。

### SKILL.md 形式

スキルはシンプルなマークダウン形式と YAML frontmatter を使用します：

```markdown
---
name: code-checklist
description: Comprehensive code quality checklist with security, performance, and maintainability checks
license: MIT
---

# Code Checklist

When checking code, look for:

## Security
- SQL injection vulnerabilities
- XSS vulnerabilities
- Authentication/authorization issues
- Sensitive data exposure

## Performance
- N+1 query problems (running one query per item instead of one query for all items)
- Unnecessary loops or computations
- Memory leaks
- Blocking operations

## Maintainability
- Function length (flag functions > 50 lines)
- Code duplication
- Missing error handling
- Unclear naming

## Output Format
Provide issues as a numbered list with severity:
- [CRITICAL] - Must fix before merge
- [HIGH] - Should fix before merge
- [MEDIUM] - Should address soon
- [LOW] - Nice to have
```

**YAML プロパティ：**

| プロパティ | 必須 | 説明 |
|----------|----------|-------------|
| `name` | **はい** | 一意の識別子（小文字、スペースの代わりにハイフン） |
| `description` | **はい** | スキルの説明と Copilot がそれを使用する時期 |
| `license` | いいえ | このスキルに適用されるライセンス |

> 📖 **公式ドキュメント**：[About Agent Skills](https://docs.github.com/copilot/concepts/agents/about-agent-skills)

### 最初のスキルを作成

OWASP Top 10 脆弱性をチェックするセキュリティ監査スキルを構築しましょう：

```bash
# Create skill directory
mkdir -p .github/skills/security-audit

# Create the SKILL.md file
cat > .github/skills/security-audit/SKILL.md << 'EOF'
---
name: security-audit
description: Security-focused code review checking OWASP (Open Web Application Security Project) Top 10 vulnerabilities
---

# Security Audit

Perform a security audit checking for:

## Injection Vulnerabilities
- SQL injection (string concatenation in queries)
- Command injection (unsanitized shell commands)
- LDAP injection
- XPath injection

## Authentication Issues
- Hardcoded credentials
- Weak password requirements
- Missing rate limiting
- Session management flaws

## Sensitive Data
- Plaintext passwords
- API keys in code
- Logging sensitive information
- Missing encryption

## Access Control
- Missing authorization checks
- Insecure direct object references
- Path traversal vulnerabilities

## Output
For each issue found, provide:
1. File and line number
2. Vulnerability type
3. Severity (CRITICAL/HIGH/MEDIUM/LOW)
4. Recommended fix
EOF

# Test your skill (skills load automatically based on your prompt)
copilot

> @samples/book-app-project/ Check this code for security vulnerabilities
# Copilot detects "security vulnerabilities" matches your skill
# and automatically applies its OWASP checklist
```

**予想される出力**（結果は異なります）：

```
Security Audit: book-app-project

[HIGH] Hardcoded file path (book_app.py, line 12)
  File path is hardcoded rather than configurable
  Fix: Use environment variable or config file

[MEDIUM] No input validation (book_app.py, line 34)
  User input passed directly to function without sanitization
  Fix: Add input validation before processing

✅ No SQL injection found
✅ No hardcoded credentials found
```

---

## 優れたスキル説明を書く

SKILL.md の `description` フィールドは極めて重要です！これは Copilot がスキルをロードするかどうかを決定する方法です：

```markdown
---
name: security-audit
description: Use for security reviews, vulnerability scanning,
  checking for SQL injection, XSS, authentication issues,
  OWASP Top 10 vulnerabilities, and security best practices
---
```

> 💡 **ヒント**：自然に質問する方法と一致するキーワードを含めます。「security review」と言う場合は、説明に「security review」を含めます。

### スキルとエージェントの組み合わせ

スキルとエージェントは一緒に機能します。エージェントが専門知識を提供し、スキルが特定の命令を提供します：

```bash
# Start with a code-reviewer agent
copilot --agent code-reviewer

> Check the book app for quality issues
# code-reviewer agent's expertise combines
# with your code-checklist skill's checklist
```

---

# スキルの管理と共有

インストールされたスキルを見つけ、コミュニティスキルを見つけ、独自のスキルを共有します。

<img src="images/managing-sharing-skills.png" alt="Managing and Sharing Skills - showing the discover, use, create, and share cycle for CLI skills" width="800" />

---

## `/skills` コマンドでスキルを管理

`/skills` コマンドを使用してインストール済みスキルを管理します：

| コマンド | 説明 |
|---------|--------------|
| `/skills list` | インストール済みのすべてのスキルを表示 |
| `/skills info <name>` | 特定のスキルの詳細を取得 |
| `/skills add <name>` | スキルを有効にする（リポジトリまたはマーケットプレイスから） |
| `/skills remove <name>` | スキルを無効にするか、アンインストール |
| `/skills reload` | SKILL.md ファイル編集後、スキルをリロード |

> 💡 **覚えておいて**：各プロンプトでスキルを「アクティベート」する必要はありません。インストール後、プロンプトが説明と一致する場合、スキルは**自動的にトリガー**されます。これらのコマンドは、スキルの使用方法ではなく、どのスキルが利用可能かを管理するためのものです。

### 例：スキルを表示

```bash
copilot

> /skills list

Available skills:
- security-audit: Security-focused code review checking OWASP Top 10
- generate-tests: Generate comprehensive unit tests with edge cases
- code-checklist: Team code quality checklist
...

> /skills info security-audit

Skill: security-audit
Source: Project
Location: .github/skills/security-audit/SKILL.md
Description: Security-focused code review checking OWASP Top 10 vulnerabilities
```

---

<details>
<summary>実際の動作を見てください！</summary>

![List Skills Demo](images/list-skills-demo.gif)

*デモ出力は異なります。モデル、ツール、応答は表示されているものと異なります。*

</details>

---

### `/skills reload` をいつ使用するか

スキルの SKILL.md ファイルを作成または編集した後、Copilot を再起動せずに変更を取得するために `/skills reload` を実行します：

```bash
# Edit your skill file
# Then in Copilot:
> /skills reload
Skills reloaded successfully.
```

> 💡 **良い情報**：`/compact` を使用して会話履歴を要約しても、スキルは有効です。コンパクトにした後、リロードする必要はありません。

---

## コミュニティスキルの検索と使用

### プラグインを使用してスキルをインストール

> 💡 **プラグインとは？** プラグインはスキル、エージェント、MCP サーバー設定をバンドルできるインストール可能なパッケージです。Copilot CLI の「アプリストア」拡張と考えてください。

`/plugin` コマンドでこれらのパッケージを参照してインストールできます：

```bash
copilot

> /plugin list
# Shows installed plugins

> /plugin marketplace
# Browse available plugins

> /plugin install <plugin-name>
# Install a plugin from the marketplace
```

プラグインは複数の機能をバンドルできます。1 つのプラグインに関連するスキル、エージェント、MCP サーバー設定が含まれる場合があります。

### コミュニティスキルリポジトリ

事前構築されたスキルもコミュニティリポジトリから入手できます：

- **[Awesome Copilot](https://github.com/github/awesome-copilot)** - スキルドキュメントと例を含む公式 GitHub Copilot リソース

### コミュニティスキルの手動インストール

GitHub リポジトリでスキルを見つけた場合、スキルフォルダをスキルディレクトリにコピーします：

```bash
# Clone the awesome-copilot repository
git clone https://github.com/github/awesome-copilot.git /tmp/awesome-copilot

# Copy a specific skill to your project
cp -r /tmp/awesome-copilot/skills/code-checklist .github/skills/

# Or for personal use across all projects
cp -r /tmp/awesome-copilot/skills/code-checklist ~/.copilot/skills/
```

> ⚠️ **インストール前に確認**：スキルをプロジェクトにコピーする前に、常にスキルの `SKILL.md` を読みます。スキルは Copilot の動作を制御し、悪意のあるスキルは有害なコマンドの実行を指示したり、予期しない方法でコードを変更したりする可能性があります。

---

# 実践

<img src="../images/practice.png" alt="Warm desk setup with monitor showing code, lamp, coffee cup, and headphones ready for hands-on practice" width="800"/>

学習したことを応用して、独自のスキルを構築してテストします。

---

## ▶️ 自分でやってみよう

### より多くのスキルを構築

異なるパターンを示す 2 つのスキルがあります。上記の「最初のスキルを作成」から同じ `mkdir` + `cat` ワークフローに従うか、スキルをコピーして適切な場所に貼り付けます。詳細な例は [.github/skills](../.github/skills) で利用可能です。

### pytest テスト生成スキル

コードベース全体で一貫した pytest 構造を確保するスキル：

```bash
mkdir -p .github/skills/pytest-gen

cat > .github/skills/pytest-gen/SKILL.md << 'EOF'
---
name: pytest-gen
description: Generate comprehensive pytest tests with fixtures and edge cases
---

# pytest Test Generation

Generate pytest tests that include:

## Test Structure
- Use pytest conventions (test_ prefix)
- One assertion per test when possible
- Clear test names describing expected behavior
- Use fixtures for setup/teardown

## Coverage
- Happy path scenarios
- Edge cases: None, empty strings, empty lists
- Boundary values
- Error scenarios with pytest.raises()

## Fixtures
- Use @pytest.fixture for reusable test data
- Use tmpdir/tmp_path for file operations
- Mock external dependencies with pytest-mock

## Output
Provide complete, runnable test file with proper imports.
EOF
```

### チーム PR レビュースキル

チーム全体の一貫した PR レビュー基準を強制するスキル：

```bash
mkdir -p .github/skills/pr-review

cat > .github/skills/pr-review/SKILL.md << 'EOF'
---
name: pr-review
description: Team-standard PR review checklist
---

# PR Review

Review code changes against team standards:

## Security Checklist
- [ ] No hardcoded secrets or API keys
- [ ] Input validation on all user data
- [ ] No bare except clauses
- [ ] No sensitive data in logs

## Code Quality
- [ ] Functions under 50 lines
- [ ] No print statements in production code
- [ ] Type hints on public functions
- [ ] Context managers for file I/O
- [ ] No TODOs without issue references

## Testing
- [ ] New code has tests
- [ ] Edge cases covered
- [ ] No skipped tests without explanation

## Documentation
- [ ] API changes documented
- [ ] Breaking changes noted
- [ ] README updated if needed

## Output Format
Provide results as:
- ✅ PASS: Items that look good
- ⚠️ WARN: Items that could be improved
- ❌ FAIL: Items that must be fixed before merge
EOF
```

### さらに詳しく

1. **スキル作成チャレンジ**：3 項目チェックリストを実行する `quick-review` スキルを作成します：
   - bare except clauses
   - missing type hints
   - unclear variable names

   「Do a quick review of books.py」と聞いてテストしてください。

2. **スキル比較**：詳細なセキュリティレビュープロンプトを手動で書く時間を計測します。次に、「Check for security issues in this file」と聞いて、セキュリティ監査スキルを自動的にロードさせます。スキルはどのくらいの時間を節約しましたか？

3. **チームスキルチャレンジ**：チームのコードレビューチェックリストについて考えます。スキルとしてエンコードできますか？スキルが常にチェックすべき 3 つのことを書き出します。

**自己チェック**：`description` フィールドが重要な理由を説明できる場合、スキルを理解しています（Copilot がスキルをロードするかどうかを決定する方法です）。

---

## 📝 課題

### メインチャレンジ：書籍サマリースキルを構築

上記の例では `pytest-gen` と `pr-review` スキルを作成しました。これで、まったく異なる種類のスキルを作成することを実践します。データからフォーマットされた出力を生成するためのものです。

1. 現在のスキルをリスト：Copilot を実行して `/skills list` を渡します。`ls .github/skills/` でプロジェクトスキルを確認するか、`ls ~/.copilot/skills/` で個人スキルを確認することもできます。
2. `.github/skills/book-summary/SKILL.md` に `book-summary` スキルを作成し、書籍コレクションの書式設定されたマークダウンサマリーを生成します。
3. スキルには以下が必要です：
   - 明確な名前と説明（説明はマッチングに重要です！）
   - 特定の形式設定ルール（例：タイトル、著者、年、読み取り状態のマークダウンテーブル）
   - 出力規則（例：読み取り状態に ✅/❌ を使用、年でソート）
4. スキルをテスト：`@samples/book-app-project/data.json Summarize the books in this collection`
5. `/skills list` をチェックしてスキルが自動的にトリガーされることを確認
6. `/book-summary Summarize the books in this collection` で直接呼び出してみてください

**成功基準**：Copilot が書籍コレクションについて尋ねるときに自動的に適用される、動作する `book-summary` スキルがあります。

<details>
<summary>💡 ヒント（クリックして展開）</summary>

**スターターテンプレート**：`.github/skills/book-summary/SKILL.md` を作成します：

```markdown
---
name: book-summary
description: Generate a formatted markdown summary of a book collection
---

# Book Summary Generator

Generate a summary of the book collection following these rules:

1. Output a markdown table with columns: Title, Author, Year, Status
2. Use ✅ for read books and ❌ for unread books
3. Sort by year (oldest first)
4. Include a total count at the bottom
5. Flag any data issues (missing authors, invalid years)

Example:
| Title | Author | Year | Status |
|-------|--------|------|--------|
| 1984 | George Orwell | 1949 | ✅ |
| Dune | Frank Herbert | 1965 | ❌ |

**Total: 2 books (1 read, 1 unread)**
```

**テスト：**
```bash
copilot
> @samples/book-app-project/data.json Summarize the books in this collection
# The skill should auto-trigger based on the description match
```

**トリガーしない場合**：`/skills reload` を試してからもう一度聞いてください。

</details>

### ボーナスチャレンジ：Commit メッセージスキル

1. 一貫した形式で従来の commit メッセージを生成する `commit-message` スキルを作成
2. ステージされた変更を実行して、「Generate a commit message for my staged changes」と聞いてテスト
3. スキルを文書化し、GitHub で `copilot-skill` トピックと共有

---

<details>
<summary>🔧 <strong>一般的な間違いとトラブルシューティング</strong> （クリックして展開）</summary>

### 一般的な間違い

| 間違い | 何が起こるか | 修正 |
|---------|--------------|-----|
| `SKILL.md` 以外の何かにファイルに名前を付ける | スキルが認識されない | ファイルの名前は正確に `SKILL.md` である必要があります |
| 曖昧な `description` フィールド | スキルは自動的にロードされません | Description は主な発見メカニズムです。特定のトリガーワードを使用します |
| frontmatter に `name` または `description` がない | スキルが読み込めない | YAML frontmatter に両方のフィールドを追加します |
| 間違ったフォルダーの場所 | スキルが見つかりません | `.github/skills/skill-name/`（プロジェクト）または `~/.copilot/skills/skill-name/`（個人）を使用します |

### トラブルシューティング

**スキルが使用されていません** - Copilot が予想される場合にスキルを使用していない場合：

1. **説明を確認**：質問方法と一致していますか？
   ```markdown
   # Bad: Too vague
   description: Reviews code

   # Good: Includes trigger words
   description: Use for code reviews, checking code quality,
     finding bugs, security issues, and best practice violations
   ```

2. **ファイルの場所を確認**：
   ```bash
   # Project skills
   ls .github/skills/

   # User skills
   ls ~/.copilot/skills/
   ```

3. **SKILL.md 形式を確認**：Frontmatter が必須：
   ```markdown
   ---
   name: skill-name
   description: What the skill does and when to use it
   ---

   # Instructions here
   ```

**スキルが表示されない** - フォルダ構造を確認します：
```
.github/skills/
└── my-skill/           # Folder name
    └── SKILL.md        # Must be exactly SKILL.md (case-sensitive)
```

スキルを作成または編集した後、`/skills reload` を実行して変更が取得されることを確認します。

**スキルがロードされるかをテスト** - Copilot に直接聞いてください：
```bash
> What skills do you have available for checking code quality?
# Copilot will describe relevant skills it found
```

**スキルが実際に機能しているかどうかはどうやってわかる？**

1. **出力形式を確認**：スキルが出力形式を指定している場合（`[CRITICAL]` タグなど）、応答でそれを探します
2. **直接聞いて**：応答を得た後、「Did you use any skills for that?」と聞きます
3. **比較**：`--no-custom-instructions` で同じプロンプトを試してみてください：
   ```bash
   # With skills
   copilot --allow-all -p "Review @file.py for security issues"

   # Without skills (baseline comparison)
   copilot --allow-all -p "Review @file.py for security issues" --no-custom-instructions
   ```
4. **特定のチェックを確認**：スキルに特定のチェック（「50 行を超える関数」など）が含まれている場合、それらが出力に表示されるかどうかを確認します

</details>

---

# 概要

## 🔑 重要なポイント

1. **スキルは自動**：Copilot はプロンプトがスキルの説明と一致する場合にロードします
2. **直接呼び出し**：スラッシュコマンド `/skill-name` を使用してスキルを直接呼び出すこともできます
3. **SKILL.md 形式**：YAML frontmatter（name、description、オプションの license）とマークダウン命令
4. **場所は重要**：プロジェクト/チーム共有の `.github/skills/`、個人的な使用の場合は `~/.copilot/skills/`
5. **説明が鍵**：自然に質問する方法に一致する説明を書きます

> 📋 **クイックリファレンス**：完全なコマンドリストとショートカットについては、[GitHub Copilot CLI コマンドリファレンス](https://docs.github.com/en/copilot/reference/cli-command-reference)を参照してください。

---

## ➡️ 次のステップ

スキルは自動ロードされた命令で Copilot ができることを拡張します。外部サービスに接続するにはどうしたらよいでしょうか？そこで MCP が登場します。

**[チャプター 06：MCP サーバー](../06-mcp-servers/README.md)** では、以下を学びます：

- MCP（Model Context Protocol）とは
- GitHub、ファイルシステム、ドキュメントサービスへの接続
- MCP サーバーの設定
- マルチサーバーワークフロー

---

**[← チャプター 04 に戻る](../04-agents-custom-instructions/README.md)** | **[チャプター 06 に続く →](../06-mcp-servers/README.md)**
