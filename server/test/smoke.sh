#!/usr/bin/env bash
# Proves the service actually starts from source and serves, which app.request()
# in the unit tests cannot show.
set -euo pipefail

PORT="${PORT:-5099}"
BASE="http://127.0.0.1:${PORT}/tippspiel"

# Stands up the schema, so the run does not depend on another CI step having
# gone first.
bun run src/db/fixture.ts

PORT="$PORT" bun run src/index.tsx &
server=$!
trap 'kill "$server" 2>/dev/null || true' EXIT

for _ in $(seq 1 50); do
  curl -sf -o /dev/null "${BASE}/impressum" && break
  sleep 0.2
done

expect_status() {
  local path="$1" want="$2" got
  got=$(curl -s -o /dev/null -w '%{http_code}' "${BASE}${path}")
  if [ "$got" != "$want" ]; then
    echo "GET ${path}: expected ${want}, got ${got}" >&2
    exit 1
  fi
  echo "GET ${path}: ${got}"
}

expect_status /impressum 200
expect_status /app.css 200
expect_status /favicon.ico 200
expect_status /manifest.json 200
expect_status /health 200
expect_status /login 200
expect_status /register 200
expect_status /reset 200
expect_status /verify 200

body=$(curl -s "${BASE}/impressum")
case "$body" in
  '<!DOCTYPE html>'*) ;;
  *) echo 'impressum did not start with a doctype' >&2; exit 1 ;;
esac
case "$body" in
  *'<script'*) echo 'impressum shipped JavaScript' >&2; exit 1 ;;
esac
case "$body" in
  *'fällt unter die berechtigten Interessen'*) ;;
  *) echo 'impressum lost its umlauts over the wire' >&2; exit 1 ;;
esac

health=$(curl -s "${BASE}/health")
case "$health" in
  *'"database":true'*) ;;
  *) echo "health did not report the database reachable: ${health}" >&2; exit 1 ;;
esac

login=$(curl -s "${BASE}/login")
case "$login" in
  *'<script'*) echo 'login shipped JavaScript' >&2; exit 1 ;;
esac
case "$login" in
  *'method="post"'*) ;;
  *) echo 'login is not a real form' >&2; exit 1 ;;
esac

# A rejected login must come back as a rendered page, not a JSON error.
rejected=$(curl -s -o /dev/null -w '%{http_code}' -X POST \
  --data 'email=nobody@example.com&password=not-a-real-password' \
  "${BASE}/login")
if [ "$rejected" != "401" ]; then
  echo "POST /login with bad credentials: expected 401, got ${rejected}" >&2
  exit 1
fi
echo "POST /login (rejected): ${rejected}"

echo 'smoke ok'
