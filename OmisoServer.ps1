# コマンドプロンプトに以下を入力して、OmisoServer.ps1を呼び出すことで使用。
# メモ帳にコピペして、「～～.bat」で保存すると便利。
# PowerShell -ExecutionPolicy RemoteSigned .\OmisoServer.ps1
# 
# 下記URLにアクセスすると、翻訳後の文字列が得られる。
# http://localhost:8000/?「翻訳したい文字列(encodeが必要)」
# localhostへのアクセスに制限がある場合は、コード中のコメントアウトを入れ替えて、下記のURLを使用。
# http://+:80/Temporary_Listen_Addresses/?「翻訳したい文字列(encodeが必要)」

# Chromeの場所を指定
$chrome = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"

# DeepLのURLと何語から何語に変化するかを入力
$deepl = "https://www.deepl.com/translator#en/ja/"

# .NetでローカルHTTPサーバーを作成
$listener = New-Object Net.HttpListener

# セキュリティ的にlocalhostに接続できない場合は下記のコメントアウトを入れ替えること
$listener.Prefixes.Add("http://localhost:8000/")
# $listener.Prefixes.Add("http://+:80/Temporary_Listen_Addresses/")

try {
    # サーバースタート
    $listener.Start()
    while ($true) {
        # アクセスが有った場合に走る
        $context = $listener.GetContext()
        $response = $context.Response

        # URLの?より後ろを取得
        $url = $deepl + $context.Request.RawUrl.Substring(2)

        # Headless Chromeを起動する準備
        $pinfo = New-Object System.Diagnostics.ProcessStartInfo
        $pinfo.FileName = $chrome
        $pinfo.RedirectStandardError = $true
        $pinfo.RedirectStandardOutput = $true
        $pinfo.UseShellExecute = $false
        $pinfo.StandardOutputEncoding = [Text.Encoding]::UTF8

        # 読み込み後、翻訳にかかる時間を考慮して10 s待つように設定
        $pinfo.Arguments = $url, "--headless --dump-dom --run-all-compositor-stages-before-draw --virtual-time-budget=10000"

        $p = New-Object System.Diagnostics.Process
        $p.StartInfo = $pinfo

        # 起動。Out-Nullは標準出力の抑制
        $p.Start() | Out-Null
        $stdout = $p.StandardOutput.ReadToEnd()
        $stderr = $p.StandardError.ReadToEnd()

        # Chromeの応答待ち
        $p.WaitForExit()

        # 得られた結果の改行コードを修正し、翻訳済みの文章を抜き出す。
        $stdout -replace "`n", "" -match "<div.+?id=`"target-dummydiv`".+?>(.+?)<\/div>" | Out-Null

        # タグを外した中身
        $translated = $matches[1]

        # 出力用にbyteに変換
        $content = [System.Text.Encoding]::Default.GetBytes($translated)

        # ブラウザに結果を出力
        $response.OutputStream.Write($content, 0, $content.Length)
        $response.Close()
    }
}
catch {
    Write-Error($_.Exception)
}