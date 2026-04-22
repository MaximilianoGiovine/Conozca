const fs = require('fs');
try {
    const raw = fs.readFileSync(0, 'utf8');
    const audit = JSON.parse(raw);
    const summary = audit.metadata ? audit.metadata.vulnerabilities : {};
    console.log(JSON.stringify(summary));
} catch (e) {
    console.log("{}");
}
