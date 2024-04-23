Add-Type -AssemblyName System.Web

$organization = 'h21res'
$project = 'ReS%202.0'
$repo = 'H21.Utilities'
$filePath = 'scripts/build-front.ps1'
$inPath = '$/' + $filePath
$token = 'yqnkkfgu36rb2hyczew3k45gvrqvlgds4byxbwkcdmdexcd2leua'

$outPath = (Get-Item -Path ".\").FullName;

$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes(("{0}:{1}" -f "",$token)))

$uri = "https://"+$organization+".visualstudio.com/defaultcollection/" + $project + "/_apis/git/repositories/" +$repo+ "/items?api-version=1.0&scopepath=" + $filePath;
$result = Invoke-RestMethod -Uri $uri -Method Get -ContentType "application/json" -Headers @{Authorization=("Basic {0}" -f $base64AuthInfo)}
$outPath = Join-Path -Path $outPath -ChildPath $inPath.Split("/")[-1]

Out-File -FilePath $outPath  -InputObject $result -Encoding utf8