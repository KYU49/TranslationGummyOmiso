# コマンドプロンプトに以下を入力して、OmisoServer.ps1を呼び出すことで使用。
# メモ帳にコピペして、「～～.bat」で保存すると便利。
# PowerShell -ExecutionPolicy RemoteSigned .\OmisoServer.ps1
# 
# 下記URLにアクセスすると、翻訳後の文字列をJSONPで返す。
# http://localhost:8000/?「翻訳したい文字列(encodeが必要)」&「ID (そのまま返ってくる)」
# localhostへのアクセスに制限がある場合は、コード中のコメントアウトを入れ替えて、下記のURLを使用。
# http://127.0.0.1/Temporary_Listen_Addresses/?「翻訳したい文字列(encodeが必要)」&「ID (そのまま返ってくる)」

# Chromeの場所を指定
# $chrome = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
# $chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"

# localhostへアクセスできない場合は$falseを指定
$localhost_enable = $true

# 非同期での同時翻訳数を指定
$maxJob = 5

# DeepLのURLと何語から何語に変化するかを入力
$deepl = "https://www.deepl.com/translator#en/ja/"

# .NetでローカルHTTPサーバーを作成
$listener = New-Object Net.HttpListener

# セキュリティ的にlocalhostに接続できない場合用に場合分け
if($localhost_enable){
    $listener.Prefixes.Add("http://localhost:8000/")
}else{
    $listener.Prefixes.Add("http://+:80/Temporary_Listen_Addresses/")
}
"Translation Gummy Omiso server is running..."

try {
    # サーバースタート
    $listener.Start()
    $jobArray = New-Object System.Collections.ArrayList
    $responseArray = New-Object System.Collections.ArrayList
    $task =$null
    # getContextの永続化、getContextの受付、getContextへの返答をこの繰り返し内で全部やる。
    while ($listener.IsListening) {
        # リクエストが来ない場合に、getContextが複数立ち上がらないようにするため。
        if($null -eq $task){
            $task = $listener.GetContextAsync()
        }
        # requestが来たら翻訳処理をJobとして実行し、jobArrayに追加
        if(($task.IsCompleted) -And ($jobArray.Count -lt $maxJob)){
            $context = $task.GetAwaiter().GetResult()
            # 次のリクエスト受付をスタートするため
            $task = $null
            $response = $context.Response
            # URLの?より後ろを取得(?や&が文字列に入っていても、encodeURIComponentされているはず。)
            $params = $context.Request.RawUrl.Split("?")[1].Split("&")
            $url = $deepl + $params[0]
            if($params.length -gt 1){
                $translationId = $params[1]
            }else{
                $translationId = "0"
            }
            # Start-Jobにcontextオブジェクトは渡せないみたいなので、文字列抜き出しまでやったものを送る
            $job = Start-Job -ScriptBlock {
                param(
                    $chrome,
                    $url,
                    $translationId
                )
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
                # $stderr = $p.StandardError.ReadToEnd()
                # Chromeの応答待ち
                $p.WaitForExit() | Out-Null
    
                # 得られた結果の改行コードを修正し、翻訳済みの文章を抜き出す。
                $stdout -replace "`n", "" -match "id=`"target-dummydiv`".*?>(.*?)<\/div>" | Out-Null
    
                $output = $matches[1] -replace "`r", ""
                # JSONP injection対策
                $output = $output -replace "`"", "\`""
                # タグを外した中身
                $translated = "callback({result: `"" + $output + "`", translationId: " + $translationId + "});"
                Write-Output $translated
            } -ArgumentList $chrome, $url, $translationId
            $jobArray.Add($job) | Out-Null
            $responseArray.add($response) | Out-Null
        }
        for($i=$jobArray.Count-1; $i -ge 0; $i--){
            $job = $jobArray[$i]
            # そのjobが終了していたら
            if($job.State -eq "Completed"){
                $response = $responseArray[$i]
                $result = Receive-Job -Job $job
                # 出力用にbyteに変換
                $content = [System.Text.Encoding]::UTF8.GetBytes($result)
                # ブラウザに結果を出力
                $response.OutputStream.Write($content, 0, $content.Length)
                $response.Close()
                # 後ろから逆向きにforしてるから、途中でremoveしても大丈夫
                $jobArray.removeAt($i)
                $responseArray.removeAt($i)
            }
        }
        Start-Sleep -Milliseconds 100
    }
} catch {
    Write-Error($_.Exception)
}finally{
    $listener.Stop()
}