# Translation Gummy Omiso
[岩崎 修登 氏](https://twitter.com/cabernet_rock)の開発した[Translation Gummy](https://github.com/iwasakishuto/Translation-Gummy)に触発して作ったインストールに制限のある環境用、論文ページ専用のほん訳コンニャクお味噌味です。

## 概要
* 論文ページのRead OnlineのページをそのままDeepLで翻訳する。
* 会社などでソフトウェアのインストールに制限がある環境でも使用可能。
* ローカルで翻訳サーバーを起動、ブラウザ上でブックマークレットを使用することで翻訳する。
* Chromeだけは必須。
* ブラウザ用のブックマークレットはFirefox, Chrome, Edgeで動作確認。
* いんたーねっとえくす...そんなブラウザはいなかった。

## 導入方法
### 共通
* 「**[ここをクリック](https://github.com/KYU49/TranslationGummyOmiso/archive/refs/heads/main.zip)**」してzipファイルをダウンロードし、解凍する。  
    * セキュリティ的にダウンロードができない場合
        * 「[OmisoServer.ps1](./OmisoServer.ps1)」,「[StartOmisoServer.bat](./StartOmisoServer.bat)」を開く。
        * 右上の「Raw」から文字列を表示して、それぞれを別のメモ帳にコピペする。
        * それぞれを「OmisoServer.ps1」「StartOmisoServer.bat」の名前で保存する。
* ブラウザで「**[このリンク](https://kyu49.github.io/TranslationGummyOmiso/)**」を開き、指示に従う。
## 使用方法
* ダウンロードしたディレクトリにある「StartOmisoServer.bat」をクリックすると、コマンドプロンプトが開く。
* コマンドプロンプトが開いたまま、翻訳したい論文ページをブラウザで開く。
* 先ほど作成した「翻訳」ブックマークを開くと、10秒ちょっとで翻訳される。
* 🔄を押すと、翻訳前の英語と切り替えができる。
* 翻訳が終わったらコマンドプロンプトは閉じてもOK。
## 仕組み
* batファイルからPowerShell Scriptを呼び出して、.NetのHttpListenerという機能でローカルサーバーを作っています。
* ブラウザ上ではブックマークレットで、\<p\>タグの中身を順にローカルサーバーにGetで送ります。
* ローカルサーバーでは、Headless Chromeを起動し、Getリクエストで渡された文字列をDeepLで翻訳させます。
* Headless Chrome上でDeepLが翻訳後の文章を表示したら、それを取得します。
* 取得した文字列はリクエスト元にJSONPとして返却されます。
* リクエスト元のブックマークレットがcallbackを受け取り、翻訳後の文字列に置換します。
## うまく動かない場合
### セキュリティ的にlocalhostへの接続が制限されている場合
* 「OmisoServer.ps1」をメモ帳などで開き、16行目の「$true」を「$false」に書き換える。
* 「OmisoBookmarklet.js」から「localhostEnable%3Dtrue」を検索し、「localhostEnable%3Dfalse」に書き換えて、ブックマークの編集をやり直す。
### インターネットが著しく遅い場合
* 「OmisoServer.ps1」をメモ帳などで開き、77行目(たぶん)の「--virtual-time-budget=10000」の10000を20000など、少し大きい数字に設定してみてください。
### Chrome not foundと表示される場合
* 「OmisoServer.ps1」をメモ帳などで開き、11行目の「$chrome =」の後にChrome.exeのパスを入力する。前後を「"」で挟むこと。
## 参考
* [管理者権限のないプレーンなWindowsでWebサーバを立てる戦い](https://qiita.com/koyoru1214/items/721e528c86ee2baff871)


## 更新履歴
### 210910
連続リクエストを行うと、DeepLが一時的にアクセスをブロックすることがわかったため、翻訳を随時行うように変更。