import { spawn } from 'child_process';

console.log('🚀 Starting Nexus CRM full-stack environment (Backend API on :5000 + Frontend on :3000)...\n');

const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const serverProcess = spawn(npxCmd, ['tsx', 'watch', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true,
});

const clientProcess = spawn(npmCmd, ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

function handleExit() {
  try {
    serverProcess.kill('SIGINT');
  } catch {}
  try {
    clientProcess.kill('SIGINT');
  } catch {}
  process.exit(0);
}

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);

