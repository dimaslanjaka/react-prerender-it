# Prerender React

Generate static files from React production, inspired from `react-snap`.

## Features
- Support React v18 Hydration
- Support Dynamic React Route
- Support Google Adsense
- Remove duplicate sources from generated html
- Auto crawl internal links
- ~~Auto SEO external links~~
- Latest Dependencies

## Usage
```js
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
```

full example at https://github.com/dimaslanjaka/chimeraland
- https://github.com/dimaslanjaka/chimeraland/blob/master/gulp.snapshot-routes.ts

## Develop
```bash
# pull submodule
git submodule update -i -r
# install
npm install
# build test
npm run test-build
# watch
nodemon
```

## Important notice
> If it feels long, try activating `DEBUG=prerender-it*` with `cross-env or set`

## Pull Request Welcome
