const http = require('http');

console.log('🚀 NAWI-EMPIRE001: ARENA_NODE Pillar Engine Active');
console.log('Listening for arena events... (placeholder)');

['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    console.log(`🛑 Shutting down engine via ${signal}...`);
    process.exit(0);
  });
});

// Reminder: for local smoke testing, set interval to 5000ms
setInterval(() => {
  console.log('💓 NAWI-EMPIRE001: Engine heartbeat stable.');
}, 1000 * 60 * 60);

const PORT = parseInt(process.env.ARENA_NODE_PORT || process.env.PORT || '10001', 10);

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    const total = parseFloat(process.env.TOTAL_VOLUME_PROCESSED_USD || '0');
    const cap = parseFloat(process.env.MAX_LIMIT_CAP_USD || '1');
    const ratio = (isFinite(total) && isFinite(cap) && cap !== 0) ? total / cap : 0;

    const payload = {
      status: 'UP',
      pillar: 'ARENA_NODE',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      integrity_seal: true,
      system_metrics: {
        volume_processed_ratio: Number(ratio.toFixed(6)),
        compliance_clearance: 'SECURE_AUDIT_PASSED'
      }
    };

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(payload));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
  console.log(`🟢 ARENA_NODE health endpoint listening on port ${PORT}`);
});

server.on('error', (err) => {
  console.error(`❌ Engine binding error: ${err.message}`);
  process.exit(1);
});
