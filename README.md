# Translation Gummy Omiso
DeepLによる論文ページのページ翻訳をインストールに制限のある環境でも実現したほん訳コンニャクお味噌味。

## 概要
* 論文ページのRead OnlineのページをそのままDeepLで翻訳する。
* 会社などでソフトウェアのインストールに制限がある環境でも使用可能。
* ローカルで翻訳サーバーを起動、ブラウザ上でブックマークレットを使用することで翻訳する。
* Chromeだけは必須。
* ブラウザ用のブックマークレットはFirefox, Chrome, Edgeで動作確認。
* いんたーねっとえくす...そんなブラウザはいなかった。
* [岩崎 修登 氏](https://twitter.com/cabernet_rock)の開発した[Translation Gummy](https://github.com/iwasakishuto/Translation-Gummy)に触発されて作成。

## 導入方法
* 「**[ここをクリック](../../releases/latest/download/TranslationGummyOmiso.zip)**」してzipファイルをダウンロードし、解凍する。  
* ブラウザで「**[このリンク](https://kyu49.github.io/TranslationGummyOmiso/)**」を開き、指示に従ってブックマークレットを登録する。
### セキュリティ的にダウンロードができない場合
* 「[OmisoServer.ps1](./OmisoServer.ps1)」,「[StartOmisoServer.bat](./StartOmisoServer.bat)」を開く。
* 右上の「Raw」からプログラムを表示して、それぞれを別のメモ帳にコピペする。
* それぞれを「OmisoServer.ps1」「StartOmisoServer.bat」の名前で保存する。
## 使用方法
* ダウンロードしたディレクトリにある「StartOmisoServer.bat」をクリックすると、コマンドプロンプトが開く。
* コマンドプロンプトが開いたまま、翻訳したい論文ページをブラウザで開く。
* 先ほど作成した「Omiso翻訳」ブックマークを開くと、10秒ちょっとで翻訳される。
* 🔄を押すと、翻訳前の英語と切り替えができる。
* 翻訳が終わったらコマンドプロンプトは閉じてもOK。
## 仕組み
* batファイルからPowerShell Scriptを呼び出して、.NetのHttpListenerという機能でローカルサーバーを立てる。
* ブラウザ上ではブックマークレットで、\<p\>タグの中身を順にローカルサーバーにGetで送る。
* ローカルサーバーでは、Headless Chromeを起動し、Getリクエストで渡された文字列をDeepLで翻訳させる。
* Headless Chrome上でDeepLが翻訳後の文章を表示したら、それを取得する。
* 取得した文字列はリクエスト元にJSONPとして返却される。
* リクエスト元のブックマークレットがcallbackを受け取り、翻訳後の文字列に置換する。
## うまく動かない場合
### セキュリティ的にlocalhostへの接続が制限されている場合
* 「OmisoServer.ps1」をメモ帳などで開き、22行目の「$true」を「$false」に書き換える。
* ブラウザで「[このリンク](https://kyu49.github.io/TranslationGummyOmiso/)」を開き、下部の薄い文字で書かれた指示に従う。
### インターネットが著しく遅い場合
* 「OmisoServer.ps1」をメモ帳などで開き、83行目(たぶん)の「--virtual-time-budget=10000」の10000を20000など、少し大きい数字に設定する。
### Chrome not foundと表示される場合
* 「OmisoServer.ps1」をメモ帳などで開き、11行目の「$chrome =」の後にChrome.exeのパスを入力する。※前後を「"」で挟むこと。
### 翻訳されるべき文章が消えていく
* 使いすぎでDeepL側からアクセス制限がかかっていると思われる。
* 2 hほどDeepLを使わないと改善されるはず。
* 同一IPで使用している人が多いと、自分の使用量が少なくても起こりうるため注意。
### そもそもps1やbatも使用が禁止
* 機能が大幅に落ちるが、IE以外なら動く「[EasyDeepL](https://github.com/KYU49/EasyDeepL)」の使用を推奨。

## 参考
* [管理者権限のないプレーンなWindowsでWebサーバを立てる戦い](https://qiita.com/koyoru1214/items/721e528c86ee2baff871)
* [ダウンロードしたファイルの「ブロック解除」をコマンドで](https://qiita.com/gentaro/items/3beb65a8f2f89089a042)


## 更新履歴
### 210915
一部手順を簡略化したバージョンをアップロード
### 210910
連続リクエストを行うと、DeepLが一時的にアクセスをブロックすることがわかったため、翻訳を随時行うように変更。