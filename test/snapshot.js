//import { ServerSnapshot } from 'react-prerender-it'
const { join } = require('path');
/**
 * @type {import('react-prerender-it')['ServerSnapshot']}
 */
let ServerSnapshot;
if (/dev/i.test(process.env.NODE_ENV)) {
  ServerSnapshot = require('../').ServerSnapshot;
} else {
  ServerSnapshot = require('react-prerender-it').ServerSnapshot;
}

ServerSnapshot({
  source: join(__dirname, 'build'),
  dest: join(__dirname, 'tmp'),
  registerStatic: [],
  routes: [],
  autoRoutes: true
});
