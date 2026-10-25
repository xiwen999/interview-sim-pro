$root = Split-Path $MyInvocation.MyCommand.Path
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add('http://localhost:8899/')
$listener.Start()
Write-Host "Listening on http://localhost:8899/ from $root"
$mime = @{
  '.html'='text/html;charset=utf-8'; '.css'='text/css;charset=utf-8'; '.js'='application/javascript;charset=utf-8'
  '.json'='application/json'; '.png'='image/png'; '.jpg'='image/jpeg'; '.svg'='image/svg+xml'; '.ico'='image/x-icon'
}
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request; $res = $ctx.Response
  $url = $req.Url.LocalPath.TrimStart('/')
  if ($url -eq '') { $url = 'login.html' }
  $path = Join-Path $root $url
  if (Test-Path $path -PathType Container) { $path = Join-Path $path 'login.html' }
  if (-not (Test-Path $path)) {
    $res.StatusCode = 404; $bytes = [System.Text.Encoding]::UTF8.GetBytes('404 not found'); $res.OutputStream.Write($bytes,0,$bytes.Length); $res.Close(); continue
  }
  $ext = [System.IO.Path]::GetExtension($path).ToLower()
  $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
  $res.Headers.Add('Cache-Control','no-cache, no-store, must-revalidate')
  $buf = [System.IO.File]::ReadAllBytes($path)
  $res.ContentLength64 = $buf.Length
  $res.OutputStream.Write($buf,0,$buf.Length); $res.Close()
}
