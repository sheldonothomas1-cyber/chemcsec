#!/usr/bin/env bash
# One-time setup: gives GitHub the Android signing key so each update can publish a signed APK.
# The key itself stays in android-signing/ on this computer (never committed); this stores an
# encrypted copy in the repository's Actions secrets, where only the build workflow can use it.
# Run from the project folder:  bash scripts/set-signing-secrets.sh
set -euo pipefail
REPO=sheldonothomas1-cyber/chemcsec
cd "$(dirname "$0")/.."

[ -f android-signing/chemcsec-release.p12 ] || { echo "android-signing/chemcsec-release.p12 is missing"; exit 1; }
base64 -w0 android-signing/chemcsec-release.p12 | gh secret set KEYSTORE_BASE64 --repo "$REPO"
tr -d '\r\n' < android-signing/password.txt | gh secret set KEYSTORE_PASSWORD --repo "$REPO"
gh secret list --repo "$REPO"
echo "Done. Starting a build that will publish the APK..."
gh workflow run deploy.yml --repo "$REPO"
