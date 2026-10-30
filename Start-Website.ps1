param([switch]$NoBrowser)

$ErrorActionPreference = 'Stop'
$projectDirectory = $PSScriptRoot
$logDirectory = Join-Path $projectDirectory '.local-server'

function Test-RoomWebsite([string]$Address) {
    try {
        $response = Invoke-WebRequest -Uri $Address -UseBasicParsing -TimeoutSec 3
        return ($response.StatusCode -eq 200 -and $response.Content -match 'A Room of One')
    } catch { return $false }
}

function Open-RoomWebsite([string]$Address) {
    $edgeCandidates = @(
        "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
        "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
    )
    $edgePath = $edgeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    if ($edgePath) {
        Start-Process -FilePath $edgePath -ArgumentList @('--new-window', $Address)
    } else {
        Start-Process $Address
    }
}

if (-not (Test-Path -LiteralPath (Join-Path $projectDirectory 'node_modules\next\dist\bin\next'))) {
    throw 'Dependencies are missing. Run npm ci in this project folder, then run this script again.'
}

$occupiedPorts = @(Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty LocalPort)
$websiteUrl = $null
foreach ($candidatePort in 3000..3010) {
    if ($occupiedPorts -contains $candidatePort) {
        $candidateUrl = "http://127.0.0.1:$candidatePort/"
        if (Test-RoomWebsite $candidateUrl) {
            $websiteUrl = $candidateUrl
            break
        }
    }
}

if (-not $websiteUrl) {
    $selectedPort = 3000..3010 | Where-Object { $occupiedPorts -notcontains $_ } | Select-Object -First 1
    if (-not $selectedPort) { throw 'Ports 3000-3010 are occupied. No unrelated processes have been stopped.' }

    $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
    $nodePath = if ($nodeCommand) { $nodeCommand.Source } else {
        Join-Path $env:USERPROFILE 'Documents\Codex\runtimes\nodejs\node.exe'
    }
    if (-not (Test-Path -LiteralPath $nodePath)) { throw 'Node.js was not found. Install Node.js LTS, then rerun this script.' }

    New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
    $runStamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $outputLog = Join-Path $logDirectory "dev-$runStamp.log"
    $errorLog = Join-Path $logDirectory "dev-$runStamp.error.log"
    $entryScript = Join-Path $projectDirectory 'scripts\next.mjs'
    $serverArguments = @(('"' + $entryScript + '"'), 'dev', '--hostname', '127.0.0.1', '--port', "$selectedPort")

    # A separate hidden process keeps serving after this launcher finishes.
    $serverProcess = Start-Process -FilePath $nodePath -ArgumentList $serverArguments `
        -WorkingDirectory $projectDirectory -WindowStyle Hidden `
        -RedirectStandardOutput $outputLog -RedirectStandardError $errorLog -PassThru
    $websiteUrl = "http://127.0.0.1:$selectedPort/"
    $deadline = (Get-Date).AddSeconds(120)
    $responding = $false
    while ((Get-Date) -lt $deadline) {
        if (Test-RoomWebsite $websiteUrl) { $responding = $true; break }
        $serverProcess.Refresh()
        if ($serverProcess.HasExited) {
            $details = Get-Content -LiteralPath $errorLog -Tail 20 -ErrorAction SilentlyContinue
            throw "The server exited. Check $errorLog`n$details"
        }
        Start-Sleep -Milliseconds 500
    }
    if (-not $responding) { throw "The website did not respond in time. Check $outputLog and $errorLog." }
    Set-Content -LiteralPath (Join-Path $logDirectory 'launcher-process-id.txt') -Value $serverProcess.Id
}

New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
Set-Content -LiteralPath (Join-Path $logDirectory 'running-url.txt') -Value $websiteUrl
Write-Output "Verified HTTP 200 from A Room of One's Own: $websiteUrl"
Write-Output 'The development server is running in the background. Closing this launcher does not stop it.'
if (-not $NoBrowser) { Open-RoomWebsite $websiteUrl }
