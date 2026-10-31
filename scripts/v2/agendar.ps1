param([string]$Hora = "")
$pasta = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
# sem -Hora: usa o horario escolhido no 1-INSTALAR.bat (conta.json), ou 04:00
if (-not $Hora) {
  $conta = Join-Path $pasta "conta.json"
  if (Test-Path $conta) { $Hora = (Get-Content $conta -Raw -Encoding UTF8 | ConvertFrom-Json).agendamento.hora }
  if (-not $Hora) { $Hora = "04:00" }
}
$bat = Join-Path $pasta "FAZER-TUDO.bat"
$a = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"`"$bat`" auto`"" -WorkingDirectory $pasta
$t = New-ScheduledTaskTrigger -Daily -At $Hora
$s = New-ScheduledTaskSettingsSet -WakeToRun -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 5)
Register-ScheduledTask -TaskName "Shopee-FazerTudo" -Action $a -Trigger $t -Settings $s -Description "Narracao + render + Google Drive (Remotion)" -Force | Out-Null
Write-Host "Tarefa Shopee-FazerTudo agendada para $Hora todos os dias."
