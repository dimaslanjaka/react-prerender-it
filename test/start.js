const { spawn } = require('child_process')
const pkg = require('./package.json')

/**
 * use this script if you want to bind package.json
 */

const homepage = new URL(pkg.homepage)

// cross-env-shell NODE_ENV=development PORT=4000 BROWSER=none DEBUG=chimera* react-scripts start
const child = spawn('cross-env-shell', [
  'NODE_ENV=development',
  'SITE_URL=' + homepage.origin,
  'PORT=4000',
  'BROWSER=none',
  'react-scripts',
  'start'
])
child.stdout.pipe(process.stdout)
child.stderr.pipe(process.stderr)
child.stdin.pipe(process.stdin)
