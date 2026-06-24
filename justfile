default:
  just --list

build:
  uv run scripts/build.py

serve: build
  cd website && python3 -m http.server 8080
