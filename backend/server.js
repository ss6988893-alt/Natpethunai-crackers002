import { app } from './app.js'; import { connectDatabase } from './config/database.js'; import { env } from './config/env.js';

async function start() { await connectDatabase(); const server = app.listen(env.port, () => console.log(`API ready on port ${env.port}`)); const shutdown = (signal) => { console.log(`${signal}: shutting down`); server.close(() => process.exit(0)); setTimeout(() => process.exit(1), 10000).unref(); }; process.on('SIGTERM', () => shutdown('SIGTERM')); process.on('SIGINT', () => shutdown('SIGINT')); }
start().catch((error) => { console.error('Unable to start API', error); process.exit(1); });
