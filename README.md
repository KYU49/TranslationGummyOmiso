# Translation Gummy Omiso
岩崎 修登 氏の開発したTranslation Gummyに触発して作ったインストールに制限のある環境用、論文ページ専用のほん訳コンニャクです。

## 概要
* 論文ページのRead OnlineのページをそのままDeepLで翻訳する。
* 会社のソフトウェアのインストールに制限がある環境でも使用可能。
* ローカルで翻訳サーバーを起動、ブラウザ上でブックマークレットを使用することで翻訳する。
* Chromeだけは必須。
* ブラウザ用のブックマークレットはFirefox, Chrome, Edgeで動作確認。
* いんたーねっとえくす...そんなブラウザはいなかった。

## 導入方法
### 共通
* 「[OmisoServer.ps1](./OmisoServer.ps1)」,「 [StartOmisoServer.bat](./StartOmisoServer.bat)」をダウンロードして、同じディレクトリに保存する。
* 「OmisoServer.ps1」をメモ帳などで開き、13行目の「$chrome =」の後にChrome.exeのパスを入力する。  
†ほとんどの場合は11行目か12行目に書いた場所にあるはず。
* ブラウザで適当なページをブックマークする。
### Firefoxの場合
* 先程のブックマークを右クリック。
* 「ブックマークを編集」をクリック。
* 「名前(N)」に任意の名前(『翻訳』など)を入力。
* 「URL(U)」に「[OmisoServer.js](./OmisoBookmarklet.js)」の文字列をコピペ。
### Chromeの場合
* 先程のブックマークを右クリック。
* 「編集...」をクリック。
* 「名前」に任意の名前(『翻訳』など)を入力。
* 「URL」に「[OmisoServer.js](./OmisoBookmarklet.js)」の文字列をコピペ。

## 使用方法
* ダウンロードしたStartOmisoServer.batをクリックすると、コマンドプロンプトが開く。
* コマンドプロンプトが開いたまま、翻訳したい論文ページをブラウザで開く。
* 先ほど作成した「翻訳」ブックマークを開くと、10秒ちょっとで翻訳される。
## うまく動かない場合
### セキュリティ的にlocalhostへの接続が制限されている場合
* 「OmisoServer.ps1」をメモ帳などで開き、16行目の「$true」を「$false」に書き換える。
* 「OmisoBookmarklet.js」から「localhostEnable=true」を検索し、「localhostEnable=false」に書き換えて、ブックマークの編集をやり直す。