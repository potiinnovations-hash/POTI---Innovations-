const fs = require('fs');
const path = require('path');

const serverJsPath = path.join(__dirname, '.next', 'standalone', 'server.js');

if (!fs.existsSync(serverJsPath)) {
  console.error('Error: .next/standalone/server.js not found!');
  process.exit(1);
}

const patchCode = `// ==========================================
// PASSENGER & CPANEL STANDALONE PATCH
// ==========================================
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'passenger_debug.log');

function logDebug(message) {
  try {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, \`[\${timestamp}] \${message}\\n\`);
  } catch (err) {
    // Fail silently to avoid crashing the main app if logging fails
  }
}

process.on('uncaughtException', (err) => {
  logDebug(\`UNCAUGHT EXCEPTION: \${err.message}\\nStack: \${err.stack}\`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logDebug(\`UNHANDLED REJECTION: \${reason}\`);
});

logDebug(\`----------------------------------------\`);
logDebug(\`Application starting...\`);
logDebug(\`Node.js version: \${process.version}\`);
logDebug(\`Platform: \${process.platform}\`);
logDebug(\`Original process.env.PORT: \${process.env.PORT}\`);

// If PORT is a Unix socket path (typical for cPanel Phusion Passenger), 
// parseInt(process.env.PORT) will return NaN, causing Next.js standalone to crash on startup.
// Since Passenger intercepts the http.Server.listen call at low-level anyway,
// we override PORT with a dummy numeric port so Next.js's validation passes.
if (process.env.PORT && isNaN(parseInt(process.env.PORT, 10))) {
  logDebug(\`Non-numeric PORT detected (Unix Socket Path). Patching to dummy port 8080.\`);
  process.env.ORIGINAL_PORT = process.env.PORT;
  process.env.PORT = '8080';
} else {
  logDebug(\`Numeric or empty PORT. Keeping as is.\`);
}

const originalStderrWrite = process.stderr.write;
process.stderr.write = function(chunk, encoding, callback) {
  logDebug(\`[STDERR] \${chunk.toString().trim()}\`);
  return originalStderrWrite.apply(process.stderr, arguments);
};

const originalStdoutWrite = process.stdout.write;
process.stdout.write = function(chunk, encoding, callback) {
  logDebug(\`[STDOUT] \${chunk.toString().trim()}\`);
  return originalStdoutWrite.apply(process.stdout, arguments);
};
// ==========================================

`;

const originalContent = fs.readFileSync(serverJsPath, 'utf8');

// Ensure we don't double patch
if (originalContent.includes('PASSENGER & CPANEL STANDALONE PATCH')) {
  console.log('Server.js already patched.');
} else {
  fs.writeFileSync(serverJsPath, patchCode + originalContent, 'utf8');
  console.log('Successfully patched .next/standalone/server.js with Passenger support!');
}
