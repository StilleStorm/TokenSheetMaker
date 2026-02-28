#!/bin/bash
# Bump the cache-busting version in index.html.
# Usage: ./bump-version.sh [version]
# If no version given, increments the current one by 1.

FILE="index.html"
CURRENT=$(grep -oP "APP_VERSION = '\K[0-9]+" "$FILE" | head -1)

if [ -n "$1" ]; then
  NEW="$1"
else
  NEW=$((CURRENT + 1))
fi

echo "Bumping version: $CURRENT → $NEW"
sed -i "s/?v=$CURRENT/?v=$NEW/g" "$FILE"
sed -i "s/APP_VERSION = '$CURRENT'/APP_VERSION = '$NEW'/" "$FILE"
echo "Done. All ?v= params and APP_VERSION updated in $FILE."
