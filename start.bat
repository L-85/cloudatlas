@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  start "Cloud Atlas" http://127.0.0.1:8000
  py -m http.server 8000
  goto :eof
)
where python >nul 2>nul
if %errorlevel%==0 (
  start "Cloud Atlas" http://127.0.0.1:8000
  python -m http.server 8000
  goto :eof
)
echo Python was not found. Opening the preloaded version directly.
start "Cloud Atlas" index.html
pause
