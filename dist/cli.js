#!/usr/bin/env node

const CodeReviewGenerator = require('./index');

// Run the script
const generator = new CodeReviewGenerator();
generator.run().catch(console.error);
