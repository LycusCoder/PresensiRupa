$ports = @(8001, 5173)

foreach ($port in $ports) {
    # Get all connections for the port and select unique, non-zero PIDs
    $processIds = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
                  Select-Object -ExpandProperty OwningProcess -Unique |
                  Where-Object { $_ -ne 0 }

    if ($processIds) {
        # Stop all found processes
        Stop-Process -Id $processIds -Force
        Write-Host "Process(es) on port $port (PID(s): $($processIds -join ', ')) stopped."
    } else {
        Write-Host "No process found on port $port."
    }
}
Write-Host "Kill script finished."