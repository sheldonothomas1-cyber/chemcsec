#!/usr/bin/env bash
# Installs the freshly built APK on an Android emulator, opens it, and checks that it starts,
# stays open and does not crash. Screenshots are saved to smoke/ for a human to look at.
# Run by the deploy workflow; an APK is only released if this passes.
set -uo pipefail

PKG=io.github.sheldonothomas1cyber.chemcsec
mkdir -p smoke
fail() { echo "SMOKE TEST FAILED: $1"; adb logcat -d > smoke/logcat.txt 2>/dev/null; exit 1; }

adb install -r ChemCSEC.apk || fail "the APK did not install"
adb logcat -c
adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null || fail "the app did not launch"
sleep 25

adb exec-out screencap -p > smoke/1-home.png
adb shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1 && adb pull /sdcard/ui.xml smoke/1-home.xml >/dev/null 2>&1

adb shell dumpsys activity activities | grep -E "ResumedActivity" > smoke/activity.txt || true
grep -q "$PKG" smoke/activity.txt || fail "the app is not in the foreground after 25 seconds"

# The web content is exposed to the accessibility tree, so its text can be read and tapped.
if grep -q "Ten questions a day" smoke/1-home.xml 2>/dev/null; then
  echo "OK: home screen text is visible"
else
  echo "NOTE: could not read the home screen text from the accessibility tree; check smoke/1-home.png"
fi

# Tap "Start today's session" and capture the first practice question.
BOUNDS=$(grep -o 'text="Start today[^"]*"[^>]*bounds="\[[0-9]*,[0-9]*\]\[[0-9]*,[0-9]*\]"' smoke/1-home.xml 2>/dev/null | head -1 | grep -o '\[[0-9]*,[0-9]*\]\[[0-9]*,[0-9]*\]')
if [ -n "${BOUNDS:-}" ]; then
  read -r X1 Y1 X2 Y2 <<< "$(echo "$BOUNDS" | tr -c '0-9' ' ')"
  adb shell input tap $(( (X1 + X2) / 2 )) $(( (Y1 + Y2) / 2 ))
  sleep 6
  adb exec-out screencap -p > smoke/2-practice.png
  adb shell uiautomator dump /sdcard/ui2.xml >/dev/null 2>&1 && adb pull /sdcard/ui2.xml smoke/2-practice.xml >/dev/null 2>&1
  if grep -q "Question 1 of 10" smoke/2-practice.xml 2>/dev/null; then
    echo "OK: a practice session opened"
  else
    echo "NOTE: the practice screen text was not found; check smoke/2-practice.png"
  fi
else
  echo "NOTE: could not find the start button to tap"
fi

adb logcat -d > smoke/logcat.txt
if grep -A3 "FATAL EXCEPTION" smoke/logcat.txt | grep -q "$PKG"; then fail "the app crashed (see smoke/logcat.txt)"; fi
adb shell pidof "$PKG" >/dev/null || fail "the app process is no longer running"
echo "Smoke test passed."
