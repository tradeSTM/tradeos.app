#!/usr/bin/env python3

import os
import re
import sys

print("=== Trade OS Copilot Code Block Extractor ===")
print("Usage: Place all Copilot code blocks (with their file headers) into 'codeblocks.txt' in this directory.")
print("This script will create all files/folders and write the code.")

BLOCK_PATTERN = re.compile(r'(?:```|````)(\w+)? name=([^\s]+)\n(.*?)(?:```|````)', re.DOTALL)

if not os.path.isfile('codeblocks.txt'):
    print("ERROR: codeblocks.txt not found. Please create it with all code blocks pasted from Copilot.")
    sys.exit(1)

with open('codeblocks.txt', 'r', encoding='utf-8') as f:
    text = f.read()

matches = BLOCK_PATTERN.findall(text)
if not matches:
    print("No code blocks found. Make sure your codeblocks.txt uses the Copilot format.")
    sys.exit(1)

for lang, filename, content in matches:
    # Remove leading/trailing blank lines
    content = content.strip('\r\n')
    # Create directories if necessary
    dirpath = os.path.dirname(filename)
    if dirpath and not os.path.exists(dirpath):
        os.makedirs(dirpath, exist_ok=True)
    # Normalize line endings for code (LF)
    with open(filename, 'w', newline='\n', encoding='utf-8') as out:
        out.write(content)
    print(f"Wrote: {filename}")

print("=== All files created from Copilot code blocks! ===")
print("Next step on Windows: Run 'bash install.sh' (in Git Bash or WSL) for full local or VPS setup.")