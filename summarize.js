const fs = require('fs');

const reportPath = process.argv[2];

if (!reportPath) {
  console.error('Uso: node summarize.js <ruta-eslint-json>');
  process.exit(1);
}

const raw = fs.readFileSync(reportPath, 'utf8');
const results = JSON.parse(raw);

let totalErrors = 0;
let totalWarnings = 0;

for (const result of results) {
  totalErrors += result.errorCount || 0;
  totalWarnings += result.warningCount || 0;
}

console.log(JSON.stringify({ totalErrors, totalWarnings }, null, 2));
