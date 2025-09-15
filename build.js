const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copy source files to dist
const srcDir = path.join(__dirname, 'src');
const files = ['index.js', 'cli.js'];

files.forEach(file => {
    const srcPath = path.join(srcDir, file);
    const distPath = path.join(distDir, file);
    
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, distPath);
        console.log(`✅ Copied ${file} to dist/`);
    } else {
        console.error(`❌ Source file not found: ${srcPath}`);
    }
});

console.log('🎉 Build completed successfully!');
