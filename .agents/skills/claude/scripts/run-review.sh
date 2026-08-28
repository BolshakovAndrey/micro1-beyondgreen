#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 /absolute/path/to/review-prompt.md [/absolute/path/to/output.txt]" >&2
  exit 64
}

if [[ $# -lt 1 || $# -gt 2 ]]; then
  usage
fi

prompt_path="$1"
output_path="${2:-}"

if [[ "$prompt_path" != /* || ! -f "$prompt_path" ]]; then
  echo "Review prompt must be an existing absolute file path: $prompt_path" >&2
  exit 66
fi

if [[ ! -f "AGENTS.md" || ! -f "docs/HACKATHON_RULES.md" ]]; then
  echo "Run this command from the micro1 project root." >&2
  exit 69
fi

if ! command -v claude >/dev/null 2>&1; then
  echo "Claude CLI is not available on PATH." >&2
  exit 69
fi

auth_status="$(claude auth status 2>&1 || true)"
if [[ "$auth_status" != *'"loggedIn": true'* ]]; then
  echo "Claude CLI is not authenticated. Run 'claude /login' and retry." >&2
  exit 77
fi

claude_command=(
  claude
  --safe-mode
  --no-chrome
  --no-session-persistence
  --permission-mode dontAsk
  --tools Read,Glob,Grep
  --model opus
  --effort max
  --output-format text
  -p
)

if [[ -z "$output_path" ]]; then
  exec "${claude_command[@]}" < "$prompt_path"
fi

if [[ "$output_path" != /* ]]; then
  echo "Review output must be an absolute file path: $output_path" >&2
  exit 64
fi

output_dir="$(dirname "$output_path")"
if [[ ! -d "$output_dir" ]]; then
  echo "Review output directory does not exist: $output_dir" >&2
  exit 73
fi

"${claude_command[@]}" < "$prompt_path" 2>&1 | tee "$output_path"
