# Code Review Generator for VS Code Copilot

A Node.js script that generates well-structured code review prompts for VS Code Copilot by comparing branches and batching changes intelligently.

## Features

- 🔍 **Branch Comparison**: Compare any branch with a base branch (defaults to `develop`)
- 📝 **Commit Analysis**: Extracts all commits and their messages
- 📦 **Smart Batching**: Automatically batches large changes for better Copilot context
- 🎯 **Focused Reviews**: Creates separate prompts for each batch to avoid overwhelming Copilot
- 📋 **Summary Generation**: Provides overview of all changes
- 🚫 **Smart Filtering**: Excludes binary files, minified files, and other non-reviewable content
- 📊 **Size Management**: Handles large files and repositories intelligently

## Installation

1. Clone or download the script
2. Make sure you have Node.js installed (version 14 or higher)
3. Navigate to your project directory

## Usage

### Basic Usage
```bash
# Compare current branch with develop
node code-review-generator.js

# Compare current branch with main
node code-review-generator.js main

# Compare current branch with any base branch
node code-review-generator.js feature/old-branch
```

### Using npm scripts (if you have package.json)
```bash
npm run review
npm run review:main
npm run review:develop
```

## How It Works

1. **Branch Detection**: Automatically detects your current branch
2. **Commit Extraction**: Gets all commits between your branch and the base branch
3. **File Analysis**: Identifies all changed files and their diffs
4. **Smart Batching**: Groups files into manageable batches based on:
   - Maximum 5 files per batch
   - Maximum 2000 lines per batch
   - Maximum 1000 lines per file
5. **Prompt Generation**: Creates structured prompts for VS Code Copilot
6. **File Output**: Saves all prompts in `./code-review-prompts/` directory

## Output Files

The script generates several files in the `./code-review-prompts/` directory:

- `summary-[timestamp].md` - Overview of all changes
- `batch-1-[timestamp].md` - First batch of changes
- `batch-2-[timestamp].md` - Second batch of changes
- `instructions-[timestamp].md` - How to use the generated prompts

## Example Workflow

1. **Generate Prompts**:
   ```bash
   node code-review-generator.js develop
   ```

2. **Open VS Code**:
   ```bash
   code ./code-review-prompts/
   ```

3. **Review with Copilot**:
   - Open each batch file
   - Copy the prompt content
   - Paste into VS Code Copilot chat
   - Get detailed feedback

4. **Follow Instructions**:
   - Review batches in order
   - Make necessary changes
   - Move to next batch

## Configuration

You can modify the batching parameters in the script:

```javascript
this.maxFileSize = 1000;        // Maximum lines per file
this.maxFilesPerBatch = 5;      // Maximum files per batch
this.maxTotalLines = 2000;      // Maximum total lines per batch
```

## Excluded Files

The script automatically excludes:
- Binary files (images, fonts, etc.)
- Minified files (.min.js, .min.css)
- Lock files (package-lock.json, yarn.lock)
- Log files
- node_modules directory
- .git directory

## Tips for Best Results

1. **Review in Order**: Process batches sequentially for better context
2. **Focus on One Batch**: Don't try to review multiple batches simultaneously
3. **Use Summary**: Start with the summary to understand the overall scope
4. **Iterative Process**: Make changes based on feedback, then regenerate prompts
5. **Team Workflow**: Share the generated prompts with team members for collaborative review

## Troubleshooting

### "No commits found"
- Make sure you're on a branch that has commits ahead of the base branch
- Check that the base branch name is correct

### "Error getting current branch"
- Make sure you're in a git repository
- Ensure you have a current branch checked out

### Large files being skipped
- This is intentional to avoid overwhelming Copilot
- Review large files manually or adjust the `maxFileSize` parameter

## Example Output

```
🚀 Starting Code Review Generator...

📊 Comparing branches: feature/new-feature → develop

📝 Found 3 commits to review
📁 Found 8 changed files

📦 Created 2 batches for review

📋 Summary saved: ./code-review-prompts/summary-2024-01-15T10-30-45-123Z.md
📄 Batch 1 saved: ./code-review-prompts/batch-1-2024-01-15T10-30-45-123Z.md
📄 Batch 2 saved: ./code-review-prompts/batch-2-2024-01-15T10-30-45-123Z.md
📖 Instructions saved: ./code-review-prompts/instructions-2024-01-15T10-30-45-123Z.md

✅ Code review prompts generated successfully!
📁 All files saved in: ./code-review-prompts/

🎯 Next steps:
1. Open the instructions file: ./code-review-prompts/instructions-2024-01-15T10-30-45-123Z.md
2. Follow the instructions to review each batch
3. Use VS Code Copilot to get detailed feedback
```

## License

MIT License - feel free to modify and use as needed.
