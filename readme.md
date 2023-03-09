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

## Examples
- https://github.com/dimaslanjaka/chimeraland/tree/62d0b83c15f68d2d59ac5fea3226c6abe2d53d62
- https://github.com/dimaslanjaka/chimeraland/blob/62d0b83c15f68d2d59ac5fea3226c6abe2d53d62/gulp.snapshot-routes.ts

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
