import 'core-js/actual/structured-clone';
import debuglib from 'debug';
import express from 'express';
import { copyFileSync, existsSync } from 'fs';
import { join } from 'upath';

import { pkgJson, save, Snapshot, workspace } from './snapshot';
import { array_unique } from './utils/array';
import { isDev } from './utils/env';
import { escapeRegex } from './utils/string';
import { fixUrl } from './utils/url';

const pathname = new URL(pkgJson.homepage).pathname;

const debug = (suffix: string) => debuglib('prerender-it-' + suffix);
const _debugExpress = debug('express');
const _debugreact = debug('react');
const _debugasset = debug('asset');
const _debugsnap = debug('snap');

export interface ServerSnapshotOptions {
  /** React Generated Dir */
  source: string;
  /**
   * Add paths to server-static
   */
  registerStatic?: string[];
  /**
   * Destination folder save
   */
  dest: string;
  /**
   * Routes to crawl
   */
  routes: string[];
  /**
   * Auto detect internal links and crawl them
   */
  autoRoutes?: boolean;
  callback?: (resolved?: {
    server: ReturnType<ReturnType<typeof express>['listen']>;
    snap: Snapshot;
  }) => any;
}

export function ServerSnapshot(options: ServerSnapshotOptions) {
  debug('env')(isDev ? 'development' : 'production' + ' mode');
  const defaults: ServerSnapshotOptions = {
    source: join(process.cwd(), 'build'),
    dest: join(process.cwd(), 'tmp'),
    registerStatic: [],
    routes: [],
    autoRoutes: false,
    callback: null
  };
  // assign options with the default options
  options = Object.assign(defaults, options);
  const { source, dest: destDir, routes } = options;
  _debugsnap('serving from', source);
  const index = join(source, 'index.html');
  const index200 = join(source, '200.html');
  const index404 = join(source, '404.html');
  if (!existsSync(index)) throw new Error('index.html not exist in build');
  if (!existsSync(index200)) copyFileSync(index, index200);
  if (!existsSync(index404)) copyFileSync(index, index404);

  const app = express();

  app.use(express.static(source));
  app.use(pathname, express.static(source));
  if (Array.isArray(options.registerStatic)) {
    options.registerStatic.forEach((path) => {
      _debugasset(workspace(path));
      app.use(express.static(path));
      app.use(pathname, express.static(path));
    });
  }

  // render root dir
  app.get(pathname, (_, res) => {
    _debugExpress('render', workspace(index200));
    return res.sendFile(index200);
  });

  app.get(
    /(.*).(woff|ttf|woff2|css|js|svg|jpeg|jpg|png|gif|ico|json)/i,
    async (req, res) => {
      const currentPath = decodeURIComponent(req.path.replace(pathname, '/'));
      const paths = [
        //path.join(blogDir, currentPath),
        join(source, currentPath)
      ].filter((str) => existsSync(str));

      if (paths.length === 1) return res.sendFile(paths[0]);

      _debugasset(currentPath, paths);
      return res.sendFile(index200);
    }
  );

  const snap = new Snapshot();
  const scraped = new Set<string>();
  const navigateScrape = (url: string) => {
    return new Promise((resolveScrape) => {
      if (scraped.has(url)) return resolveScrape(null);
      scraped.add(url);
      snap
        .scrape(url)
        .then((html) => {
          if (html) {
            let currentPathname = new URL(url).pathname;
            if (!Snapshot.isPathHasExt(currentPathname)) {
              currentPathname += '/index.html';
            }
            const regex = new RegExp(escapeRegex(pathname), 'gi');
            currentPathname = fixUrl(currentPathname.replace(regex, '/'))
              // remove double slash
              .replace(/\/+/, '/');
            const saveto = join(destDir, currentPathname);
            save(saveto, html).then((path) => {
              debug('save')(workspace(path));
            });
          }
        })
        .catch(console.trace)
        .finally(() => {
          resolveScrape(null);
        });
    });
  };

  app.use(async (req, res) => {
    _debugreact(req.path, workspace(index200));
    navigateScrape('http://localhost:4000' + req.path);
    return res.sendFile(index200);
  });

  const doCallback = (
    resolved: Parameters<ServerSnapshotOptions['callback']>[0]
  ) => {
    if (typeof options.callback === 'function') options.callback(resolved);
  };

  const run = async () => {
    const server = app.listen(4000, () => {
      _debugExpress('listening http://localhost:4000');
    });

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

    function gracefulShutdown(signal: any) {
      if (signal) console.log(`\nReceived signal ${signal}`);
      console.log('Gracefully closing http server');

      // closeAllConnections() is only available from Node v18.02
      if (server.closeAllConnections) server.closeAllConnections();
      else setTimeout(() => process.exit(0), 5000);

      try {
        server.close(function (err) {
          if (err) {
            console.error('There was an error', err);
            process.exit(1);
          } else {
            console.log('http server closed successfully. Exiting!');
            process.exit(0);
          }
        });
      } catch (err) {
        console.error('There was an error', err);
        setTimeout(() => process.exit(1), 500);
      }
    }

    const baseUrl = fixUrl('http://localhost:4000/' + pathname);
    await navigateScrape(baseUrl);
    let crawlRoutes = routes || [];
    if (options.autoRoutes) {
      // auto crawl internal links merge
      crawlRoutes = array_unique(
        crawlRoutes
          .concat(Array.from(Snapshot.links.values()))
          // trim all links
          .map((path) => path.trim())
          // filter undefined and null
          .filter(
            (path) =>
              typeof path == 'string' &&
              path.length > 0 &&
              path !== 'undefined' &&
              path !== 'null'
          )
      );
    }
    for (let i = 0; i < crawlRoutes.length; i++) {
      const route = crawlRoutes[i];
      if (typeof route !== 'string') continue;
      const url = fixUrl('http://localhost:4000/' + route);
      _debugsnap(url);
      await navigateScrape(url);
    }

    gracefulShutdown(null);

    return { server: server, snap };
  };

  run()
    // callback when success
    .then(doCallback)
    // callback when catch caught error
    .catch(doCallback);
}
