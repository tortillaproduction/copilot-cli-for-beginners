![Chapter 00: Quick Start](images/chapter-header.png)

ようこそ！このチャプターでは、GitHub Copilot CLI（コマンドラインインターフェース）をインストールし、GitHub アカウントでサインインして、すべてが正常に動作することを確認します。これはクイックセットアップチャプターです。セットアップが完了したら、本格的なデモは Chapter 01 から始まります！

## 🎯 学習目標

このチャプターを終了するまでに、以下のことができるようになります：

- GitHub Copilot CLI をインストールする
- GitHub アカウントでサインインする
- シンプルなテストで動作を確認する

> ⏱️ **所要時間**: 約 10 分（読了 5 分 + ハンズオン 5 分）

---

## ✅ 前提条件

- **GitHub アカウント**と Copilot アクセス。[サブスクリプションオプションを確認してください](https://github.com/features/copilot/plans)。学生・教育者は [GitHub Education](https://education.github.com/pack) 経由で Copilot Pro に無料でアクセスできます。
- **ターミナル基礎知識**: `cd` や `ls` などのコマンドが使える

### "Copilot アクセス" の意味

GitHub Copilot CLI にはアクティブな Copilot サブスクリプションが必要です。ステータスは [github.com/settings/copilot](https://github.com/settings/copilot) で確認できます。以下のいずれかが表示されるはずです：

- **Copilot Individual** - 個人サブスクリプション
- **Copilot Business** - 組織経由
- **Copilot Enterprise** - エンタープライズ経由
- **GitHub Education** - 認証済みの学生・教育者向け無料

「You don't have access to GitHub Copilot」と表示されている場合は、無料オプションを利用するか、プランにサブスクライブするか、アクセス権を提供する組織に参加する必要があります。

---

## インストール

> ⏱️ **所要時間**: インストールは 2～5 分。認証に追加で 1～2 分かかります。

### GitHub Codespaces（セットアップ不要）

前提条件をインストールしたくない場合は、GitHub Copilot CLI が既にセットアップされた GitHub Codespaces を使用できます（サインインが必要）。Python と pytest も事前インストールされています。

1. [このリポジトリをフォーク](https://github.com/github/copilot-cli-for-beginners/fork)してください
2. **Code** > **Codespaces** > **Create codespace on main** を選択
3. コンテナのビルドが完了するまで数分待ちます
4. 準備完了です！ターミナルが Codespace 環境で自動的に開きます。

> 💡 **Codespace での確認**: `cd samples/book-app-project && python book_app.py help` を実行して、Python とサンプルアプリが動作していることを確認します。

### ローカルインストール

ローカルマシンでコース用サンプルとともに Copilot CLI を実行したい場合は、以下の手順に従ってください。

1. リポジトリをクローンして、マシンにコースサンプルを取得します：

    ```bash
    git clone https://github.com/github/copilot-cli-for-beginners
    cd copilot-cli-for-beginners
    ```

2. 次のいずれかのオプションを使用して Copilot CLI をインストールします。

    > 💡 **どちらを選んだらいいか分からない場合？** Node.js がインストールされている場合は `npm` を使用してください。そうでない場合は、お使いのシステムに合致するオプションを選択してください。

    ### すべてのプラットフォーム（npm）

    ```bash
    # Node.js がインストールされている場合、これが最速の方法です
    npm install -g @github/copilot
    ```

    ### macOS/Linux（Homebrew）

    ```bash
    brew install copilot-cli
    ```

    ### Windows（WinGet）

    ```bash
    winget install GitHub.Copilot
    ```

    ### macOS/Linux（インストールスクリプト）

    ```bash
    curl -fsSL https://gh.io/copilot-install | bash
    ```

---

## 認証

`copilot-cli-for-beginners` リポジトリのルートでターミナルウィンドウを開き、CLI を起動してフォルダへのアクセスを許可してください。

```bash
copilot
```

リポジトリを含むフォルダを信頼するかどうかを尋ねられます（まだ信頼していない場合）。1 回限りの信頼または今後のすべてのセッションで信頼できます。

<img src="images/copilot-trust.png" alt="Copilot CLI でフォルダ内のファイルを信頼する" width="800"/>

フォルダを信頼した後、GitHub アカウントでサインインできます。

```
> /login
```

**次に起こること：**

1. Copilot CLI は 1 回限りのコード（例：`ABCD-1234`）を表示します
2. ブラウザが GitHub のデバイス認可ページを開きます。まだ GitHub にサインインしていない場合はサインインしてください。
3. プロンプトが表示されたときコードを入力します
4. 「Authorize」を選択して GitHub Copilot CLI にアクセスを許可します
5. ターミナルに戻ります。サインイン完了です！

<img src="images/auth-device-flow.png" alt="デバイス認可フロー - ターミナルのログインからサインイン確認までの 5 ステップのプロセスを表示" width="800"/>

*デバイス認可フロー：ターミナルがコードを生成し、ブラウザで検証し、Copilot CLI が認証されます。*

**ヒント**: サインインはセッション間で保持されます。トークンが有効期限切れになるか、明示的にサインアウトしない限り、このステップを実行する必要があるのは 1 回だけです。

---

## 動作確認

### ステップ 1: Copilot CLI をテストする

サインインが完了しました。Copilot CLI が正常に動作していることを確認しましょう。ターミナルで、まだ CLI を起動していない場合は起動してください：

```bash
> Say hello and tell me what you can help with
```

応答を受け取った後、CLI を終了できます：

```bash
> /exit
```

---

<details>
<summary>🎬 実際の動作を見る！</summary>

![Hello デモ](images/hello-demo.gif)

*デモ出力は異なります。お使いのモデル、ツール、応答はここに示されているものと異なります。*

</details>

---

**予想される出力**: Copilot CLI の機能をリストアップしたフレンドリーな応答。

### ステップ 2: サンプルの書籍アプリを実行する

このコースには、コース全体を通じて CLI を使用して探索・改善するサンプルアプリが用意されています。（このコードは `/samples/book-app-project` で確認できます）。開始する前に、*Python 書籍管理ターミナルアプリ*が動作することを確認してください。お使いのシステムに応じて `python` または `python3` を実行してください。

> **注意**: コース全体で示される主な例は Python（`samples/book-app-project`）を使用しているため、そのオプションを選択した場合、ローカルマシンに [Python 3.10+](https://www.python.org/downloads/) がインストールされている必要があります。（Codespace は既にインストール済み）。JavaScript（`samples/book-app-project-js`）と C#（`samples/book-app-project-cs`）バージョンも利用可能です。各サンプルには、その言語でアプリを実行するための手順が記載された README があります。

```bash
cd samples/book-app-project
python book_app.py list
```

**予想される出力**: 「The Hobbit」「1984」「Dune」を含む 5 冊のリスト。

### ステップ 3: 書籍アプリで Copilot CLI を試す

ステップ 2 を実行した場合は、まずリポジトリのルートに戻ります：

```bash
cd ../..   # 必要に応じてリポジトリのルートに戻る
copilot 
> What does @samples/book-app-project/book_app.py do?
```

**予想される出力**: 書籍アプリのメイン機能とコマンドの概要。

エラーが表示される場合は、下の[トラブルシューティングセクション](#トラブルシューティング)を確認してください。

完了したら Copilot CLI を終了できます：

```bash
> /exit
```

---

## ✅ 準備完了！

インストール部分は以上です。本格的な学習は Chapter 01 から始まります。そこでは以下のことを行います：

- AI が書籍アプリをレビューして、コード品質の問題を即座に発見する様子を見る
- Copilot CLI を使用する 3 つの異なる方法を学ぶ
- 平易な英語からワーキングコードを生成する

**[Chapter 01: 最初のステップへ →](../01-setup-and-first-steps/README.md)**

---

## トラブルシューティング

### 「copilot: command not found」

CLI がインストールされていません。別のインストール方法を試してください：

```bash
# brew が失敗した場合は npm を試してください：
npm install -g @github/copilot

# またはインストールスクリプト：
curl -fsSL https://gh.io/copilot-install | bash
```

### 「You don't have access to GitHub Copilot」

1. [github.com/settings/copilot](https://github.com/settings/copilot) で Copilot サブスクリプションを確認してください
2. 仕事用アカウントを使用している場合は、組織が CLI アクセスを許可しているか確認してください

### 「Authentication failed」

再度認証してください：

```bash
copilot
> /login
```

### ブラウザが自動的に開かない

[github.com/login/device](https://github.com/login/device) にアクセスして、ターミナルに表示されているコードを入力してください。

### トークンの有効期限切れ

もう一度 `/login` を実行するだけです：

```bash
copilot
> /login
```

### それでも解決しない場合

- [GitHub Copilot CLI ドキュメント](https://docs.github.com/copilot/concepts/agents/about-copilot-cli)を確認してください
- [GitHub Issues](https://github.com/github/copilot-cli/issues) で検索してください

---

## 🔑 主な要点

1. **GitHub Codespace はすぐに始める最速の方法** - Python、pytest、GitHub Copilot CLI が既にプレインストールされているため、すぐにデモに進めます
2. **複数のインストール方法** - お使いのシステムに合った方法を選択できます（Homebrew、WinGet、npm、またはインストールスクリプト）
3. **1 回限りの認証** - ログインはトークンが有効期限切れになるまで保持されます
4. **書籍アプリが動作** - コース全体を通じて `samples/book-app-project` を使用します

> 📚 **公式ドキュメント**: [Copilot CLI をインストール](https://docs.github.com/copilot/how-tos/copilot-cli/cli-getting-started)でインストールオプションと要件を確認してください。

> 📋 **クイックリファレンス**: [GitHub Copilot CLI コマンドリファレンス](https://docs.github.com/en/copilot/reference/cli-command-reference)でコマンドとショートカットの完全なリストを参照してください。

---

**[Chapter 01: 最初のステップへ →](../01-setup-and-first-steps/README.md)**
