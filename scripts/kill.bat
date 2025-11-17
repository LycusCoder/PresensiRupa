@echo off
echo Stopping PresensiRupa development services...

setlocal enabledelayedexpansion

for %%p in (8001 5173) do (
    set "port=%%p"
    echo.
    echo Searching for process on port !port!...

    set "pid="
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":!port!" ^| findstr "LISTENING"') do (
        if not defined pid (
            set "pid=%%a"
        )
    )

    if defined pid (
        echo Found process with PID !pid! on port !port!. Stopping...
        taskkill /F /PID !pid!
        echo Service on port !port! stopped.
    ) else (
        echo No service found running on port !port!.
    )
)

echo.
echo All services have been stopped.
pause
