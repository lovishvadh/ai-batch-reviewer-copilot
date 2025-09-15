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
- ✅ **Action Items Summary**: Generates categorized action items (MUST FIX vs NITPICK)
- 💡 **Code Examples**: Provides before/after code examples with improvement explanations
- 🎯 **Structured Reviews**: Clear categorization of issues by severity and type

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

# Keep old files (skip cleanup)
npx copilot-review main --keep-old
npx copilot-review -k

# Skip .gitignore update
npx copilot-review main --no-gitignore

# Show help
npx copilot-review --help
```

### After global installation
```bash
# Compare current branch with develop
copilot-review

# Compare current branch with main
copilot-review main

# Compare current branch with any base branch
copilot-review feature/old-branch

# Keep old files (skip cleanup)
copilot-review main --keep-old
copilot-review -k

# Skip .gitignore update
copilot-review main --no-gitignore

# Show help
copilot-review --help
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

1. **Gitignore Management**: Automatically adds `code-review-prompts/` to `.gitignore` (unless `--no-gitignore` is used)
2. **Cleanup**: Automatically removes old prompt files (unless `--keep-old` is used)
3. **Branch Detection**: Automatically detects your current branch
4. **Commit Extraction**: Gets all commits between your branch and the base branch
5. **File Analysis**: Identifies all changed files and their diffs
6. **File Type Analysis**: Categorizes files by type (JS/TS, Python, Java, etc.)
7. **Smart Batching**: Groups files into manageable batches based on:
   - Maximum 5 files per batch
   - Maximum 2000 lines per batch
   - Maximum 1000 lines per file
8. **Prompt Generation**: Creates structured prompts for VS Code Copilot
9. **File Output**: Saves all prompts in `./code-review-prompts/` directory

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

The PR description generator analyzes your changes and creates comprehensive prompts that help Copilot generate professional PR descriptions with all required sections:

### **Core Sections:**
- **📝 Summary of Changes**: What was changed and why, with business value
- **🎯 Context/Background**: Rally ticket links and business context
- **🔧 Implementation Details**: Technical walkthrough and architecture decisions
- **🧪 How to Test**: Manual testing steps, automated tests, and edge cases
- **⚡ Impact Areas**: Performance, security, UX, and system integration impacts
- **👀 Focus Area for Review**: Critical sections and complex logic to review
- **📸 Screenshots**: UI changes and visual comparisons (when applicable)

### **Optional Sections:**
- **🔄 Backward Compatibility**: Breaking changes and migration paths
- **📋 Review Notes**: Code quality, design decisions, and trade-offs
- **📦 Dependencies**: New libraries and version updates
- **🚀 Deployment Notes**: Special deployment considerations
- **📊 Monitoring**: New logging and monitoring added

### **Professional Formatting:**
- **Markdown Structure**: Proper headers, bullet points, and code blocks
- **Visual Appeal**: Emojis and formatting for better readability
- **Structured Information**: Tables and organized sections
- **Clear Instructions**: Step-by-step guidance for reviewers

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

## Code Review Features

The code review generator creates comprehensive prompts that help Copilot provide structured, actionable feedback:

### **🔴 MUST FIX vs 🟡 NITPICK Categorization**
- **🔴 MUST FIX**: Critical issues that must be addressed before merge
  - Security vulnerabilities
  - Performance bottlenecks
  - Critical bugs or logic errors
  - Missing error handling
- **🟡 NITPICK**: Optional improvements and best practices
  - Code style and formatting
  - Minor optimizations
  - Readability improvements
  - Design pattern suggestions

### **💡 Code Examples and Improvements**
For each issue, the review includes:
- **Current Code**: Shows the problematic code with line numbers
- **Suggested Fix**: Provides improved code example
- **Why This Improves**: Explains the specific benefits and issues avoided

### **📋 Action Items Summary**
At the end of each review:
- **🔴 MUST FIX**: Checklist of critical issues to address
- **🟡 NITPICK**: Checklist of optional improvements
- **File References**: Clear file:line references for each issue

### **🎯 Structured Review Categories**
- **Code Quality**: Readability, maintainability, best practices
- **Security**: Vulnerabilities, input validation, authentication
- **Performance**: Bottlenecks, memory leaks, efficiency
- **Architecture**: Design patterns, separation of concerns
- **Testing**: Coverage, edge cases, test quality

## Tips for Best Results

1. **Start with PR Description**: Generate the PR description first for a high-level overview
2. **Review in Order**: Process batches sequentially for better context
3. **Focus on One Batch**: Don't try to review multiple batches simultaneously
4. **Use Summary**: Start with the summary to understand the overall scope
5. **Prioritize MUST FIX**: Address all 🔴 MUST FIX items before merge
6. **Consider NITPICK**: Review 🟡 NITPICK items for code quality improvements
7. **Use Code Examples**: Follow the provided code examples for fixes
8. **Iterative Process**: Make changes based on feedback, then regenerate prompts
9. **Team Workflow**: Share the generated prompts with team members for collaborative review
10. **Clean Output**: The tool automatically cleans up old files, keeping your workspace organized
11. **Keep Old Files**: Use `--keep-old` flag if you want to preserve previous prompt files
12. **Gitignore Management**: The tool automatically adds `code-review-prompts/` to `.gitignore` to prevent accidental commits
13. **Skip Gitignore**: Use `--no-gitignore` flag if you want to manage `.gitignore` manually

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

📝 Added 'code-review-prompts/' to .gitignore
🧹 Cleaning up 5 old prompt files...
✅ Cleaned up old files

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

### 1.5.0
- Enhanced code review template with structured action items and code examples
- Added MUST FIX vs NITPICK categorization for clear prioritization
- Added before/after code examples with improvement explanations
- Added comprehensive action items summary with checklists
- Enhanced code review prompts with detailed formatting and categorization
- Improved actionable feedback with specific file:line references

### 1.4.0
- Enhanced PR description template with comprehensive professional sections
- Added Rally ticket integration and business context requirements
- Added detailed testing instructions and impact analysis sections
- Added backward compatibility and review focus area sections
- Improved PR description formatting with emojis and structured markdown
- Enhanced professional PR template for enterprise development workflows

### 1.3.1
- Enhanced PR description template with comprehensive professional sections
- Added Rally ticket integration and business context requirements
- Added detailed testing instructions and impact analysis sections
- Added backward compatibility and review focus area sections
- Improved PR description formatting with emojis and structured markdown
- Enhanced professional PR template for enterprise development workflows

### 1.3.0
- Added automatic .gitignore management for `code-review-prompts/` directory
- Added `--no-gitignore` flag to skip .gitignore updates
- Enhanced git integration to prevent accidental commits of generated files
- Improved repository hygiene with automatic gitignore management

### 1.2.1
- Added automatic .gitignore management for `code-review-prompts/` directory
- Added `--no-gitignore` flag to skip .gitignore updates
- Enhanced git integration to prevent accidental commits of generated files
- Improved repository hygiene with automatic gitignore management

### 1.2.0
- Added automatic cleanup of old prompt files
- Added `--keep-old` and `-k` flags to preserve old files
- Added `--help` and `-h` flags for usage information
- Enhanced command-line interface with better argument parsing
- Improved user experience with cleaner output directory

### 1.1.0
- Added PR description generation
- Added file type analysis and categorization
- Enhanced prompt generation with comprehensive PR templates

### 1.0.0
- Initial release
- Basic branch comparison functionality
- Smart batching for large changes
- VS Code Copilot prompt generation
- Comprehensive documentation
