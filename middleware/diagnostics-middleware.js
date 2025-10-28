import { monitorEventLoopDelay } from 'node:perf_hooks';
import fs from 'node:fs';
import path from 'node:path';


const logDir = path.resolve('./usage_logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
  console.log(`[INIT] Created log directory at ${logDir}`);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFile = path.join(logDir, `log_${timestamp}.txt`);
const logStream = fs.createWriteStream(logFile, { flags: 'a' });
console.log(`[INIT] Logging detailed data in ${logFile}`);

const h = monitorEventLoopDelay({ resolution: 20 });
h.enable();

function writeLog(message) {
  logStream.write(`${message}\n`);
}

export default (req, res, next) => {
  const start = Date.now();

  console.log(`[REQ] ${req.method} ${req.originalUrl}`);

  writeLog(
    `-----\n[IN] ${new Date().toISOString()}\nMETHOD: ${req.method}\nURL: ${req.originalUrl}\nIP: ${req.ip}\n`
  );

  res.once('finish', () => {
    const duration = Date.now() - start;
    const loopDelay = Math.round(h.mean / 1e6);
    const mem = process.memoryUsage();
    const rss = Math.round(mem.rss / 1024 / 1024);
    const heapUsed = Math.round(mem.heapUsed / 1024 / 1024);

    writeLog(
      `[OUT] ${new Date().toISOString()}\nSTATUS: ${res.statusCode}\nDURATION: ${duration}ms\n` +
      `MEMORY: RSS ${rss}MB, HEAP ${heapUsed}MB\nLOOP DELAY: ${loopDelay}ms\n-----`
    );
  });

  next();
};
