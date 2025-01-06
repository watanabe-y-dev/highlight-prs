# はじめに

Github の PR 画面を開いたとき、自分がレビュアーとして登録されている PR が強調表示される Chrome 拡張です。
今のところ公開する予定はなく、各自ローカルに clone してご使用ください。

# 使い方

1. Github トークンの登録

`src/content.ts` 内の以下の部分に自分の Github トークンを入力してください。

```ts
chrome.storage.sync.get("githubToken", (data) => {
  highlightAssignedPRs("MY_GITHUB_TOKEN"); // <- ここ
});
```

2. パッケージのインストール

以下のコマンドでパッケージをインストールします。

```bash
$ npm install
```

3. tsc コマンドの実行

プロジェクトルートで `tsc` コマンドを実行して Typescript をコンパイルしてください。
`tsc` は Typescript をインストールすれば使えるようになります。

```bash
$ npm install -g typescript
```

`tsc` を実行すると `dist` ディレクトリにコンパイルされた js ファイルが生成されます。

4. Chrome 拡張に登録

Chorme の URL バーに `chrome://extensions/` を入力する。
表示された画面の右上にある「デベロッパーモード」をオンにする。
「バッケージ化されていない拡張機能を読み込む」ボタンをクリックし、プロジェクトのディレクトリを選択する。
