const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const BLUE = '\x1b[34m';

export const log = {
  info: (msg) => console.log(`${CYAN}i${RESET} ${msg}`),
  success: (msg) => console.log(`${GREEN}\u2713${RESET} ${msg}`),
  warn: (msg) => console.log(`${YELLOW}!${RESET} ${msg}`),
  error: (msg) => console.error(`${RED}\u2717${RESET} ${msg}`),
  dim: (msg) => console.log(`${DIM}  ${msg}${RESET}`),
  title: (msg) => console.log(`\n${BOLD}${BLUE}${msg}${RESET}\n`),
  blank: () => console.log(''),
  list: (label, count, status = 'OK') => {
    const statusColor = status === 'OK' ? GREEN : YELLOW;
    console.log(`  ${label.padEnd(30)} ${statusColor}${count}${RESET}  ${status}`);
  },
};
