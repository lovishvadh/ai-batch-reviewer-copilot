const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class CodeReviewGenerator {
    constructor() {
        this.maxFileSize = 1000; // lines
        this.maxFilesPerBatch = 5;
        this.maxTotalLines = 2000;
    }

    /**
     * Show help information
     */
    showHelp() {
        console.log(`
🚀 Copilot Code Reviewer

Usage:
  copilot-review [base-branch] [options]

Arguments:
  base-branch    The base branch to compare against (default: develop)

Options:
  --keep-old, -k    Keep old prompt files instead of cleaning them up
  --no-gitignore    Skip adding code-review-prompts/ to .gitignore
  --help, -h        Show this help message

Examples:
  copilot-review                    # Compare with develop branch
  copilot-review main               # Compare with main branch
  copilot-review feature/old-branch # Compare with specific branch
  copilot-review main --keep-old    # Compare with main, keep old files
  copilot-review main --no-gitignore # Compare with main, skip .gitignore update
  copilot-review -h                 # Show help

Features:
  • Generates code review prompts for VS Code Copilot
  • Creates PR description prompts
  • Smart batching for large changes
  • Automatic cleanup of old files
  • Automatic .gitignore management
  • File type analysis and categorization
`);
    }

    /**
     * Get command line arguments
     */
    getArguments() {
        const args = process.argv.slice(2);
        
        // Check for flags
        const skipCleanup = args.includes('--keep-old') || args.includes('-k');
        const skipGitignore = args.includes('--no-gitignore');
        
        // Filter out flags to get the base branch
        const baseBranch = args.find(arg => !arg.startsWith('--') && !arg.startsWith('-')) || 'develop';
        const currentBranch = this.getCurrentBranch();
        
        return { baseBranch, currentBranch, skipCleanup, skipGitignore };
    }

    /**
     * Get current git branch
     */
    getCurrentBranch() {
        try {
            return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
        } catch (error) {
            console.error('Error getting current branch:', error.message);
            process.exit(1);
        }
    }

    /**
     * Get commits between branches
     */
    getCommits(baseBranch, currentBranch) {
        try {
            const command = `git log ${baseBranch}..${currentBranch} --oneline --no-merges`;
            const output = execSync(command, { encoding: 'utf8' });
            
            if (!output.trim()) {
                console.log(`No commits found between ${baseBranch} and ${currentBranch}`);
                return [];
            }

            return output.trim().split('\n').map(line => {
                const [hash, ...messageParts] = line.split(' ');
                return {
                    hash: hash.trim(),
                    message: messageParts.join(' ').trim()
                };
            });
        } catch (error) {
            console.error('Error getting commits:', error.message);
            process.exit(1);
        }
    }

    /**
     * Get changed files between branches
     */
    getChangedFiles(baseBranch, currentBranch) {
        try {
            const command = `git diff --name-only ${baseBranch}..${currentBranch}`;
            const output = execSync(command, { encoding: 'utf8' });
            
            return output.trim().split('\n').filter(file => file.trim());
        } catch (error) {
            console.error('Error getting changed files:', error.message);
            process.exit(1);
        }
    }

    /**
     * Get diff for a specific file
     */
    getFileDiff(baseBranch, currentBranch, filePath) {
        try {
            const command = `git diff ${baseBranch}..${currentBranch} -- "${filePath}"`;
            const output = execSync(command, { encoding: 'utf8' });
            return output;
        } catch (error) {
            console.warn(`Error getting diff for ${filePath}:`, error.message);
            return '';
        }
    }

    /**
     * Get file content for context
     */
    getFileContent(filePath, branch = 'HEAD') {
        try {
            const command = `git show ${branch}:${filePath}`;
            const output = execSync(command, { encoding: 'utf8' });
            return output;
        } catch (error) {
            // File might not exist in the branch, return empty
            return '';
        }
    }

    /**
     * Count lines in a string
     */
    countLines(content) {
        return content.split('\n').length;
    }

    /**
     * Check if file should be included in review
     */
    shouldIncludeFile(filePath) {
        const excludePatterns = [
            /\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i,
            /\.(min\.js|min\.css)$/i,
            /node_modules/,
            /\.git/,
            /package-lock\.json$/,
            /yarn\.lock$/,
            /\.log$/,
            /\.lock$/,
            /\.cache$/,
            /dist\//,
            /build\//,
            /coverage\//
        ];

        return !excludePatterns.some(pattern => pattern.test(filePath));
    }

    /**
     * Create batches of files for review
     */
    createBatches(files, baseBranch, currentBranch) {
        const batches = [];
        let currentBatch = [];
        let currentBatchLines = 0;

        for (const file of files) {
            if (!this.shouldIncludeFile(file)) {
                continue;
            }

            const diff = this.getFileDiff(baseBranch, currentBranch, file);
            const diffLines = this.countLines(diff);
            
            // Skip very large files
            if (diffLines > this.maxFileSize) {
                console.warn(`Skipping large file: ${file} (${diffLines} lines)`);
                continue;
            }

            // Start new batch if current one would be too large
            if (currentBatch.length >= this.maxFilesPerBatch || 
                currentBatchLines + diffLines > this.maxTotalLines) {
                if (currentBatch.length > 0) {
                    batches.push([...currentBatch]);
                    currentBatch = [];
                    currentBatchLines = 0;
                }
            }

            currentBatch.push({
                path: file,
                diff: diff,
                lines: diffLines
            });
            currentBatchLines += diffLines;
        }

        // Add remaining files
        if (currentBatch.length > 0) {
            batches.push(currentBatch);
        }

        return batches;
    }

    /**
     * Generate code review prompt for a batch
     */
    generateReviewPrompt(batch, commits, batchNumber, totalBatches) {
        const prompt = `# Code Review Request - Batch ${batchNumber}/${totalBatches}

## Context
Please review the following code changes. This is batch ${batchNumber} of ${totalBatches} for the code review.

## Commits in this review:
${commits.map(commit => `- ${commit.hash}: ${commit.message}`).join('\n')}

## Files Changed:
${batch.map(file => `- ${file.path} (${file.lines} lines changed)`).join('\n')}

## Code Changes:

${batch.map(file => `
### File: ${file.path}
\`\`\`diff
${file.diff}
\`\`\`
`).join('\n')}

## Review Instructions:
Please provide a comprehensive code review focusing on:

1. **Code Quality**: 
   - Code readability and maintainability
   - Adherence to best practices
   - Potential bugs or logic errors

2. **Security**: 
   - Security vulnerabilities
   - Input validation
   - Authentication/authorization issues

3. **Performance**: 
   - Performance bottlenecks
   - Memory leaks
   - Inefficient algorithms

4. **Architecture**: 
   - Design patterns
   - Separation of concerns
   - Code organization

5. **Testing**: 
   - Test coverage
   - Edge cases
   - Test quality

Please provide specific, actionable feedback with line numbers where applicable.`;

        return prompt;
    }

    /**
     * Generate summary prompt
     */
    generateSummaryPrompt(commits, totalBatches) {
        return `# Code Review Summary

## Overview
This code review covers ${commits.length} commits across ${totalBatches} batches.

## Commits Summary:
${commits.map(commit => `- ${commit.hash}: ${commit.message}`).join('\n')}

## Review Process:
- Total batches: ${totalBatches}
- Each batch contains related changes for focused review
- Please review each batch individually for detailed feedback
- Use this summary to understand the overall scope of changes

## Next Steps:
1. Review each batch individually
2. Provide specific feedback for each batch
3. Consider the overall impact of all changes together
4. Suggest any additional testing or documentation needs`;
    }

    /**
     * Generate PR description prompt
     */
    generatePRDescriptionPrompt(commits, changedFiles, baseBranch, currentBranch) {
        const fileTypes = this.analyzeFileTypes(changedFiles);
        const commitMessages = commits.map(commit => commit.message).join(', ');
        
        return `# Pull Request Description Generator

## Context
Please generate a comprehensive Pull Request description for the following changes.

## Branch Information:
- **Source Branch**: ${currentBranch}
- **Target Branch**: ${baseBranch}
- **Total Commits**: ${commits.length}
- **Total Files Changed**: ${changedFiles.length}

## Commits:
${commits.map(commit => `- ${commit.hash}: ${commit.message}`).join('\n')}

## File Changes Summary:
${fileTypes.map(type => `- ${type.type}: ${type.count} files`).join('\n')}

## Changed Files:
${changedFiles.map(file => `- ${file}`).join('\n')}

## Instructions:
Please generate a professional Pull Request description that includes:

1. **Title**: A clear, concise title (max 50 characters)

2. **Description**: A comprehensive description including:
   - **What**: What changes were made
   - **Why**: Why these changes were necessary
   - **How**: How the changes were implemented
   - **Impact**: What impact these changes will have

3. **Type of Changes**: Categorize the changes (e.g., feature, bugfix, refactor, docs, etc.)

4. **Testing**: Suggest what testing should be done

5. **Breaking Changes**: Note any breaking changes (if applicable)

6. **Dependencies**: Note any new dependencies or changes to existing ones

7. **Screenshots/Demos**: Suggest if screenshots or demos would be helpful

8. **Checklist**: Provide a checklist for reviewers

Please format the output as a proper GitHub PR description with appropriate markdown formatting.`;
    }

    /**
     * Analyze file types in changed files
     */
    analyzeFileTypes(changedFiles) {
        const typeMap = {};
        
        changedFiles.forEach(file => {
            const extension = path.extname(file).toLowerCase();
            let type = 'Other';
            
            if (['.js', '.ts', '.jsx', '.tsx'].includes(extension)) {
                type = 'JavaScript/TypeScript';
            } else if (['.py'].includes(extension)) {
                type = 'Python';
            } else if (['.java'].includes(extension)) {
                type = 'Java';
            } else if (['.go'].includes(extension)) {
                type = 'Go';
            } else if (['.rs'].includes(extension)) {
                type = 'Rust';
            } else if (['.php'].includes(extension)) {
                type = 'PHP';
            } else if (['.rb'].includes(extension)) {
                type = 'Ruby';
            } else if (['.css', '.scss', '.sass', '.less'].includes(extension)) {
                type = 'Stylesheets';
            } else if (['.html', '.htm'].includes(extension)) {
                type = 'HTML';
            } else if (['.json', '.yaml', '.yml', '.xml'].includes(extension)) {
                type = 'Configuration';
            } else if (['.md', '.txt', '.rst'].includes(extension)) {
                type = 'Documentation';
            } else if (['.sql'].includes(extension)) {
                type = 'SQL';
            } else if (['.sh', '.bash', '.zsh'].includes(extension)) {
                type = 'Shell Scripts';
            } else if (['.dockerfile', 'dockerfile'].includes(extension.toLowerCase())) {
                type = 'Docker';
            } else if (['.yml', '.yaml'].includes(extension) && file.includes('github/workflows')) {
                type = 'GitHub Actions';
            }
            
            typeMap[type] = (typeMap[type] || 0) + 1;
        });
        
        return Object.entries(typeMap).map(([type, count]) => ({ type, count }));
    }

    /**
     * Ensure code-review-prompts is in .gitignore
     */
    ensureGitignoreEntry() {
        const gitignorePath = '.gitignore';
        const entry = 'code-review-prompts/';
        
        try {
            let gitignoreContent = '';
            let needsUpdate = false;
            
            // Read existing .gitignore if it exists
            if (fs.existsSync(gitignorePath)) {
                gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
                
                // Check if the entry already exists
                if (!gitignoreContent.includes(entry)) {
                    needsUpdate = true;
                }
            } else {
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                // Add the entry to .gitignore
                const newContent = gitignoreContent + 
                    (gitignoreContent && !gitignoreContent.endsWith('\n') ? '\n' : '') +
                    `# Copilot Code Reviewer generated files\n${entry}\n`;
                
                fs.writeFileSync(gitignorePath, newContent);
                console.log(`📝 Added '${entry}' to .gitignore`);
            }
        } catch (error) {
            console.warn(`⚠️  Warning: Could not update .gitignore: ${error.message}`);
        }
    }

    /**
     * Clean up old prompt files
     */
    cleanupOldFiles() {
        const outputDir = './code-review-prompts';
        
        if (!fs.existsSync(outputDir)) {
            return;
        }

        try {
            const files = fs.readdirSync(outputDir);
            const promptFiles = files.filter(file => 
                file.startsWith('summary-') || 
                file.startsWith('pr-description-') || 
                file.startsWith('batch-') || 
                file.startsWith('instructions-')
            );

            if (promptFiles.length > 0) {
                console.log(`🧹 Cleaning up ${promptFiles.length} old prompt files...`);
                
                promptFiles.forEach(file => {
                    const filePath = path.join(outputDir, file);
                    fs.unlinkSync(filePath);
                });
                
                console.log(`✅ Cleaned up old files\n`);
            }
        } catch (error) {
            console.warn(`⚠️  Warning: Could not clean up old files: ${error.message}`);
        }
    }

    /**
     * Save prompt to file
     */
    savePrompt(content, filename) {
        const outputDir = './code-review-prompts';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const filePath = path.join(outputDir, filename);
        fs.writeFileSync(filePath, content);
        return filePath;
    }

    /**
     * Generate instructions file
     */
    generateInstructions(batches, summaryPath, batchPaths, prDescriptionPath) {
        const instructions = `# Code Review Instructions

## Generated Files:
- Summary: ${path.basename(summaryPath)}
- PR Description: ${path.basename(prDescriptionPath)}
- Batches: ${batchPaths.map(p => path.basename(p)).join(', ')}

## How to Use:

### 1. Generate PR Description (Optional but Recommended)
1. Open the PR description file in VS Code
2. Copy the prompt content and paste it into Copilot chat
3. Use the generated description for your Pull Request

### 2. Code Review Process
1. Open each batch file in VS Code
2. Use Copilot to review the code changes
3. Copy the prompt content and paste it into Copilot chat
4. Review the feedback and make necessary changes
5. Move to the next batch

## Tips:
- Start with the PR description to get a high-level overview
- Review batches in order for better context
- Focus on one batch at a time for detailed feedback
- Use the summary to understand the overall scope
- Consider the relationships between changes across batches

## Batch Details:
${batches.map((batch, i) => `
### Batch ${i + 1}:
- Files: ${batch.map(f => f.path).join(', ')}
- Total lines: ${batch.reduce((sum, f) => sum + f.lines, 0)}
`).join('')}
`;

        return instructions;
    }

    /**
     * Main execution function
     */
    async run() {
        // Check for help first, before any other processing
        const args = process.argv.slice(2);
        if (args.includes('--help') || args.includes('-h')) {
            this.showHelp();
            return;
        }

        console.log('🚀 Starting Copilot Code Review Generator...\n');

        const { baseBranch, currentBranch, skipCleanup, skipGitignore } = this.getArguments();

        // Ensure .gitignore entry exists (unless skipped)
        if (!skipGitignore) {
            this.ensureGitignoreEntry();
        }

        // Clean up old files first (unless skipped)
        if (!skipCleanup) {
            this.cleanupOldFiles();
        }
        
        console.log(`📊 Comparing branches: ${currentBranch} → ${baseBranch}\n`);

        // Get commits and files
        const commits = this.getCommits(baseBranch, currentBranch);
        const changedFiles = this.getChangedFiles(baseBranch, currentBranch);

        if (commits.length === 0) {
            console.log('✅ No commits to review. Branches are in sync.');
            return;
        }

        console.log(`📝 Found ${commits.length} commits to review`);
        console.log(`📁 Found ${changedFiles.length} changed files\n`);

        // Create batches
        const batches = this.createBatches(changedFiles, baseBranch, currentBranch);
        
        if (batches.length === 0) {
            console.log('✅ No reviewable files found (all files excluded or too large)');
            return;
        }

        console.log(`📦 Created ${batches.length} batches for review\n`);

        // Generate prompts
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // Save summary
        const summaryPrompt = this.generateSummaryPrompt(commits, batches.length);
        const summaryPath = this.savePrompt(summaryPrompt, `summary-${timestamp}.md`);
        console.log(`📋 Summary saved: ${summaryPath}`);

        // Save PR description prompt
        const prDescriptionPrompt = this.generatePRDescriptionPrompt(commits, changedFiles, baseBranch, currentBranch);
        const prDescriptionPath = this.savePrompt(prDescriptionPrompt, `pr-description-${timestamp}.md`);
        console.log(`📝 PR Description prompt saved: ${prDescriptionPath}`);

        // Save individual batch prompts
        const batchPaths = [];
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            const prompt = this.generateReviewPrompt(batch, commits, i + 1, batches.length);
            const batchPath = this.savePrompt(prompt, `batch-${i + 1}-${timestamp}.md`);
            batchPaths.push(batchPath);
            console.log(`📄 Batch ${i + 1} saved: ${batchPath}`);
        }

        // Generate and save instructions
        const instructions = this.generateInstructions(batches, summaryPath, batchPaths, prDescriptionPath);
        const instructionsPath = this.savePrompt(instructions, `instructions-${timestamp}.md`);
        console.log(`📖 Instructions saved: ${instructionsPath}\n`);

        console.log('✅ Code review prompts generated successfully!');
        console.log(`📁 All files saved in: ./code-review-prompts/`);
        console.log(`\n🎯 Next steps:`);
        console.log(`1. Open the instructions file: ${instructionsPath}`);
        console.log(`2. Follow the instructions to review each batch`);
        console.log(`3. Use VS Code Copilot to get detailed feedback`);
    }
}

module.exports = CodeReviewGenerator;
