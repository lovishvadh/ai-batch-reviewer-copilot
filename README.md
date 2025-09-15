# Copilot Code Reviewer

A Node.js package that generates well-structured code review prompts and PR descriptions for VS Code Copilot by comparing git branches and intelligently batching changes.

## Features

- 🔍 **Branch Comparison**: Compare any branch with a base branch (defaults to `develop`)
- 📝 **Commit Analysis**: Extracts all commits and their messages
- 📦 **Smart Batching**: Automatically batches large changes for better Copilot context
- 🎯 **Focused Reviews**: Creates separate prompts for each batch to avoid overwhelming Copilot
- 📋 **Summary Generation**: Provides overview of all changes
- 📄 **PR Description Generation**: Creates prompts for writing comprehensive PR descriptions
- 🚫 **Smart Filtering**: Excludes binary files, minified files, and other non-reviewable content
- 📊 **Size Management**: Handles large files and repositories intelligently
- 🔧 **File Type Analysis**: Analyzes and categorizes changed files by type

## Installation

### As a dev dependency (recommended)
```bash
npm install --save-dev copilot-code-reviewer
```

### Global installation
```bash
npm install -g copilot-code-reviewer
```

## Usage

### After installation as dev dependency
```bash
# Using npx (recommended)
npx copilot-review

# Using npm scripts
npm run copilot-review

# Compare with specific branch
npx copilot-review main
npx copilot-review feature/old-branch
```

### After global installation
```bash
# Compare current branch with develop
copilot-review

# Compare current branch with main
copilot-review main

# Compare current branch with any base branch
copilot-review feature/old-branch
```

### Using npm scripts in your project

Add to your `package.json`:
```json
{
  "scripts": {
    "review": "copilot-review",
    "review:main": "copilot-review main",
    "review:develop": "copilot-review develop"
  }
}
```

Then run:
```bash
npm run review
npm run review:main
npm run review:develop
```

## How It Works

1. **Branch Detection**: Automatically detects your current branch
2. **Commit Extraction**: Gets all commits between your branch and the base branch
3. **File Analysis**: Identifies all changed files and their diffs
4. **File Type Analysis**: Categorizes files by type (JS/TS, Python, Java, etc.)
5. **Smart Batching**: Groups files into manageable batches based on:
   - Maximum 5 files per batch
   - Maximum 2000 lines per batch
   - Maximum 1000 lines per file
6. **Prompt Generation**: Creates structured prompts for VS Code Copilot
7. **File Output**: Saves all prompts in `./code-review-prompts/` directory

## Output Files

The script generates several files in the `./code-review-prompts/` directory:

- `summary-[timestamp].md` - Overview of all changes
- `pr-description-[timestamp].md` - Prompt for generating PR description
- `batch-1-[timestamp].md` - First batch of changes
- `batch-2-[timestamp].md` - Second batch of changes
- `instructions-[timestamp].md` - How to use the generated prompts

## Example Workflow

1. **Install the package**:
   ```bash
   npm install --save-dev copilot-code-reviewer
   ```

2. **Generate Prompts**:
   ```bash
   npx copilot-review develop
   ```

3. **Open VS Code**:
   ```bash
   code ./code-review-prompts/
   ```

4. **Generate PR Description** (Optional but Recommended):
   - Open the PR description file
   - Copy the prompt content
   - Paste into VS Code Copilot chat
   - Use the generated description for your Pull Request

5. **Review with Copilot**:
   - Open each batch file
   - Copy the prompt content
   - Paste into VS Code Copilot chat
   - Get detailed feedback

6. **Follow Instructions**:
   - Review batches in order
   - Make necessary changes
   - Move to next batch

## PR Description Features

The PR description generator analyzes your changes and creates prompts that help Copilot generate:

- **Clear Titles**: Concise, descriptive PR titles
- **Comprehensive Descriptions**: What, why, how, and impact of changes
- **Change Categorization**: Feature, bugfix, refactor, docs, etc.
- **Testing Suggestions**: What testing should be done
- **Breaking Changes**: Notes any breaking changes
- **Dependencies**: New or changed dependencies
- **Screenshots/Demos**: When visual aids would be helpful
- **Reviewer Checklists**: Structured checklists for reviewers

## Configuration

You can modify the batching parameters by creating a configuration file or modifying the source code:

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
- dist/ and build/ directories
- coverage/ directory

## Tips for Best Results

1. **Start with PR Description**: Generate the PR description first for a high-level overview
2. **Review in Order**: Process batches sequentially for better context
3. **Focus on One Batch**: Don't try to review multiple batches simultaneously
4. **Use Summary**: Start with the summary to understand the overall scope
5. **Iterative Process**: Make changes based on feedback, then regenerate prompts
6. **Team Workflow**: Share the generated prompts with team members for collaborative review

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
🚀 Starting Copilot Code Review Generator...

📊 Comparing branches: feature/new-feature → develop

📝 Found 3 commits to review
📁 Found 8 changed files

📦 Created 2 batches for review

📋 Summary saved: ./code-review-prompts/summary-2024-01-15T10-30-45-123Z.md
📝 PR Description prompt saved: ./code-review-prompts/pr-description-2024-01-15T10-30-45-123Z.md
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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

### 1.0.0
- Initial release
- Basic branch comparison functionality
- Smart batching for large changes
- VS Code Copilot prompt generation
- PR description generation
- File type analysis
- Comprehensive documentation
