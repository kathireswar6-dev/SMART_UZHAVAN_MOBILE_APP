@echo off
REM Activate venv and run the Flask backend (Windows cmd)
pushd %~dp0
if exist venv\Scripts\python.exe (
  venv\Scripts\python.exe app.py
) else (
  echo Virtual environment not found at venv\Scripts\python.exe
  echo Create one with: python -m venv venv
  popd
  exit /b 1
)
popd
