Param(
    [Int32]$choice = 2
)

$containerName = 'h21-searching-book-ui'
$imageName = 'h21-searching-book-ui'
$port = 91
$environment = 'test'

iex '.\downloader.ps1'
iex (".\build-front.ps1 -containerName {0} -imageName {1} -containerPort {2} -environment {3} -choice {4}" -f $containerName, $imageName, $port, $environment, $choice)
