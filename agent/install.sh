#!/bin/bash

# --- Configuration ---
BINARY_NAME="terminal-share"
# Replace these URLs with your actual hosting links (e.g., GitHub Releases or S3)
DOWNLOAD_URLS=(
    "linux-x64:https://github.com/Rudresh-11/terminal-share/releases/download/v1.0.0/terminal-share-linux"
    "darwin-x64:https://github.com/Rudresh-11/terminal-share/releases/download/v1.0.0/terminal-share-macos"
    "darwin-arm64:https://github.com/Rudresh-11/terminal-share/releases/download/v1.0.0/terminal-share-macos-arm64"
)

echo "🚀 Installing Terminal Share Agent..."

# 1. Detect Architecture and OS
OS=$(uname -s)
ARCH=$(uname -m)

if [[ "$OS" == "Linux" ]]; then
    PLATFORM="linux-x64"
elif [[ "$OS" == "Darwin" ]]; then
    if [[ "$ARCH" == "arm64" ]]; then
        PLATFORM="darwin-arm64"
        echo "❌ Unsupported OS Architecture: $ARCH"
        exit 1
    else
        PLATFORM="darwin-x64"
    fi
else
    echo "❌ Unsupported OS: $OS"
    exit 1
fi

echo "Detected platform: $PLATFORM"

# 2. Find the correct URL
URL=""
for item in "${DOWNLOAD_URLS[@]}"; do
    if [[ $item == "$PLATFORM"* ]]; then
        URL=${item#*:}
        break
    fi
done

if [ -z "$URL" ]; then
    echo "❌ No binary found for your platform."
    exit 1
fi

# 3. Download binary
echo "Downloading binary from $URL..."
curl -L "$URL" -o "$BINARY_NAME"

# 4. Make executable and move to path
chmod +x "$BINARY_NAME"
sudo mv "$BINARY_NAME" /usr/local/bin/"$BINARY_NAME"

echo "✅ Installation complete!"
echo "Run it by typing: terminal-share"
