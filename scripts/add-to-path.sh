#!/usr/bin/env bash

# Script to add automate-features to PATH
# This creates a symlink in a directory that's already in PATH

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Adding automate-features to PATH${NC}\n"

# Get the directory where the package is installed
PACKAGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXECUTABLE_PATH="$PACKAGE_DIR/bin/automate-features"

# Verify executable exists
if [ ! -f "$EXECUTABLE_PATH" ]; then
  echo -e "${RED}❌ Error: Executable not found at $EXECUTABLE_PATH${NC}"
  exit 1
fi

# Make sure it's executable
chmod +x "$EXECUTABLE_PATH"

# Determine the best directory to create symlink
# Try common directories in order of preference
SYMLINK_DIRS=(
  "/usr/local/bin"
  "$HOME/.local/bin"
  "$HOME/bin"
)

SYMLINK_DIR=""
for dir in "${SYMLINK_DIRS[@]}"; do
  if [ -d "$dir" ] && [ -w "$dir" ]; then
    SYMLINK_DIR="$dir"
    break
  fi
done

# If no writable directory found, try to create ~/.local/bin
if [ -z "$SYMLINK_DIR" ]; then
  mkdir -p "$HOME/.local/bin"
  SYMLINK_DIR="$HOME/.local/bin"

  # Check if ~/.local/bin is in PATH
  if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo -e "${YELLOW}⚠️  $HOME/.local/bin is not in your PATH${NC}"
    echo -e "${YELLOW}   Add this line to your ~/.bashrc, ~/.zshrc, or ~/.profile:${NC}"
    echo -e "${GREEN}   export PATH=\"\$HOME/.local/bin:\$PATH\"${NC}\n"

    # Offer to add to shell config
    read -p "Do you want to add it automatically? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      # Detect shell
      SHELL_CONFIG=""
      if [ -n "$ZSH_VERSION" ]; then
        SHELL_CONFIG="$HOME/.zshrc"
      elif [ -n "$BASH_VERSION" ]; then
        SHELL_CONFIG="$HOME/.bashrc"
      else
        # Default to .profile for other shells
        SHELL_CONFIG="$HOME/.profile"
      fi

      # Add to shell config if not already there
      if ! grep -q "export PATH=\"\$HOME/.local/bin:\$PATH\"" "$SHELL_CONFIG" 2>/dev/null; then
        echo "" >> "$SHELL_CONFIG"
        echo "# Added by @arranjae/automate-features" >> "$SHELL_CONFIG"
        echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> "$SHELL_CONFIG"
        echo -e "${GREEN}✅ Added to $SHELL_CONFIG${NC}"
        echo -e "${YELLOW}   Run: source $SHELL_CONFIG${NC}"
        echo -e "${YELLOW}   Or restart your terminal${NC}\n"
      fi
    fi
  fi
fi

SYMLINK_PATH="$SYMLINK_DIR/automate-features"

# Remove existing symlink if it exists
if [ -L "$SYMLINK_PATH" ]; then
  echo -e "${YELLOW}⚠️  Existing symlink found, removing...${NC}"
  rm "$SYMLINK_PATH"
elif [ -e "$SYMLINK_PATH" ]; then
  echo -e "${RED}❌ Error: $SYMLINK_PATH exists but is not a symlink${NC}"
  echo -e "${RED}   Please remove it manually and try again${NC}"
  exit 1
fi

# Create symlink
ln -s "$EXECUTABLE_PATH" "$SYMLINK_PATH"

echo -e "${GREEN}✅ Success! automate-features has been added to PATH${NC}"
echo -e "${BLUE}📍 Symlink created: $SYMLINK_PATH -> $EXECUTABLE_PATH${NC}\n"

# Verify installation
if command -v automate-features &> /dev/null; then
  echo -e "${GREEN}✅ Verification: 'automate-features' command is available${NC}"
  echo -e "${BLUE}   Location: $(which automate-features)${NC}\n"
else
  echo -e "${YELLOW}⚠️  Command not immediately available${NC}"
  echo -e "${YELLOW}   You may need to:${NC}"
  echo -e "${YELLOW}   1. Restart your terminal, or${NC}"
  echo -e "${YELLOW}   2. Run: source ~/.bashrc (or ~/.zshrc)${NC}\n"
fi

echo -e "${BLUE}🎉 Installation complete!${NC}"
echo -e "${BLUE}   Try: automate-features --help${NC}\n"
