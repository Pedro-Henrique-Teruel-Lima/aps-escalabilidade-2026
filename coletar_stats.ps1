# coletar_stats.ps1 — roda um cenario do benchmark e amostra `docker stats`
# a cada 2 s durante toda a execucao (janelas de estresse incluidas).
# Uso:  .\coletar_stats.ps1 A    |    .\coletar_stats.ps1 B
param([Parameter(Mandatory = $true)][ValidateSet('A', 'B')][string]$Cenario)

$codes = Join-Path $PSScriptRoot 'codes'
$saida = Join-Path $codes "resultados\docker_stats_Cenario$Cenario.csv"
New-Item -ItemType Directory -Force (Split-Path $saida) | Out-Null
"hora;container;cpu;mem;mem_pct;net_io;block_io;pids" | Out-File $saida -Encoding utf8

$job = Start-Job -ArgumentList $saida -ScriptBlock {
    param($arq)
    while ($true) {
        $h = Get-Date -Format 'HH:mm:ss'
        docker stats --no-stream --format '{{.Name}};{{.CPUPerc}};{{.MemUsage}};{{.MemPerc}};{{.NetIO}};{{.BlockIO}};{{.PIDs}}' 2>$null |
            ForEach-Object { "$h;$_" } | Out-File $arq -Append -Encoding utf8
        Start-Sleep -Seconds 1
    }
}

Set-Location $codes
& (Join-Path $codes 'run_benchmark.bat') $Cenario
$codigo = $LASTEXITCODE

Stop-Job $job; Remove-Job $job
"Stats em: $saida (exit=$codigo)"
