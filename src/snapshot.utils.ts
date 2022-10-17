// https://github.com/stereobooster/react-snap/blob/88ef70dd419158c18b9845034513dc84a3e100d9/index.js

import debuglib from 'debug';
import { existsSync, mkdirSync } from 'fs';
import { Page } from 'puppeteer';
import { dirname } from 'upath';

export const debug = (suffix: string) => debuglib('prerender-it-' + suffix);

const defaultOptions = {
  //# stable configurations
  port: 45678,
  source: 'build',
  destination: null,
  concurrency: 4,
  include: ['/'],
  userAgent: 'ReactSnap',
  // 4 params below will be refactored to one: `puppeteer: {}`
  // https://github.com/stereobooster/react-snap/issues/120
  headless: true,
  puppeteer: {
    cache: true
  },
  puppeteerArgs: [],
  puppeteerExecutablePath: undefined,
  puppeteerIgnoreHTTPSErrors: false,
  publicPath: '/',
  minifyCss: {},
  minifyHtml: {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    decodeEntities: true,
    keepClosingSlash: true,
    sortAttributes: true,
    sortClassName: false
  },
  // mobile first approach
  viewport: {
    width: 480,
    height: 850
  },
  sourceMaps: true,
  //# workarounds
  // using CRA1 for compatibility with previous version will be changed to false in v2
  fixWebpackChunksIssue: 'CRA1',
  removeBlobs: true,
  fixInsertRule: true,
  skipThirdPartyRequests: false,
  cacheAjaxRequests: false,
  http2PushManifest: false,
  // may use some glob solution in the future, if required
  // works when http2PushManifest: true
  ignoreForPreload: ['service-worker.js'],
  //# unstable configurations
  preconnectThirdParty: true,
  // Experimental. This config stands for two strategies inline and critical.
  // TODO: inline strategy can contain errors, like, confuse relative urls
  inlineCss: false,
  //# feature creeps to generate screenshots
  saveAs: 'html',
  crawl: true,
  waitFor: false,
  externalServer: false,
  //# even more workarounds
  removeStyleTags: false,
  preloadImages: false,
  // add async true to script tags
  asyncScriptTags: false,
  //# another feature creep
  // tribute to Netflix Server Side Only React https://twitter.com/NetflixUIE/status/923374215041912833
  // but this will also remove code which registers service worker
  removeScriptTags: false
};

/**
 *
 * @param opt
 */
export const preloadResources = (opt: { page: Page; basePath: string }) => {
  const {
    page,
    basePath,
    preloadImages,
    cacheAjaxRequests,
    preconnectThirdParty,
    http2PushManifest,
    ignoreForPreload
  } = Object.assign(defaultOptions, opt);
  const ajaxCache = {};
  const http2PushManifestItems = [];
  const uniqueResources = new Set();
  page.on('response', async (response) => {
    const responseUrl = response.url();
    if (/^data:|blob:/i.test(responseUrl)) return;
    const ct = response.headers()['content-type'] || '';
    const route = responseUrl.replace(basePath, '');
    if (/^http:\/\/localhost/i.test(responseUrl)) {
      if (uniqueResources.has(responseUrl)) return;
      if (preloadImages && /\.(png|jpg|jpeg|webp|gif|svg)$/.test(responseUrl)) {
        if (http2PushManifest) {
          http2PushManifestItems.push({
            link: route,
            as: 'image'
          });
        } else {
          await page.evaluate((route) => {
            const linkTag = document.createElement('link');
            linkTag.setAttribute('rel', 'preload');
            linkTag.setAttribute('as', 'image');
            linkTag.setAttribute('href', route);
            document.body.appendChild(linkTag);
          }, route);
        }
      } else if (cacheAjaxRequests && ct.includes('json')) {
        const json = await response.json();
        ajaxCache[route] = json;
      } else if (http2PushManifest && /\.(js)$/.test(responseUrl)) {
        const fileName = new URL(responseUrl).pathname.split('/').pop();
        if (!ignoreForPreload.includes(fileName)) {
          http2PushManifestItems.push({
            link: route,
            as: 'script'
          });
        }
      } else if (http2PushManifest && /\.(css)$/.test(responseUrl)) {
        const fileName = new URL(responseUrl).pathname.split('/').pop();
        if (!ignoreForPreload.includes(fileName)) {
          http2PushManifestItems.push({
            link: route,
            as: 'style'
          });
        }
      }
      uniqueResources.add(responseUrl);
    } else if (preconnectThirdParty) {
      const urlObj = new URL(responseUrl);
      const domain = `${urlObj.protocol}//${urlObj.host}`;
      if (uniqueResources.has(domain)) return;
      uniqueResources.add(domain);
      await page.evaluate((route) => {
        const linkTag = document.createElement('link');
        linkTag.setAttribute('rel', 'preconnect');
        linkTag.setAttribute('href', route);
        document.head.appendChild(linkTag);
      }, domain);
    }
  });
  return { ajaxCache, http2PushManifestItems };
};

interface ParamFix {
  page: Page;
}

/**
 *
 * @param opt
 * @return Promise
 */
export const removeBlobs = async (opt: ParamFix) => {
  const { page } = opt;
  return page.evaluate(() => {
    const stylesheets = Array.from(
      document.querySelectorAll('link[rel=stylesheet]')
    );
    stylesheets.forEach((link) => {
      if (
        link.getAttribute('href') &&
        link.getAttribute('href').startsWith('blob:')
      ) {
        link.parentNode && link.parentNode.removeChild(link);
      }
    });
  });
};

export const fixInsertRule = ({ page }: ParamFix) => {
  return page.evaluate(() => {
    Array.from(document.querySelectorAll('style')).forEach((style) => {
      if (style.innerHTML === '') {
        style.innerHTML = Array.from(style.sheet.rules)
          .map((rule) => rule.cssText)
          .join('');
      }
    });
  });
};

/**
 * fix form fields
 * @param param0
 * @returns
 */
export const fixFormFields = ({ page }: ParamFix) => {
  return page.evaluate(() => {
    Array.from(document.querySelectorAll('[type=radio]')).forEach(
      (element: HTMLInputElement) => {
        if (element.checked) {
          element.setAttribute('checked', 'checked');
        } else {
          element.removeAttribute('checked');
        }
      }
    );
    Array.from(document.querySelectorAll('[type=checkbox]')).forEach(
      (element: HTMLInputElement) => {
        if (element.checked) {
          element.setAttribute('checked', 'checked');
        } else {
          element.removeAttribute('checked');
        }
      }
    );
    Array.from(document.querySelectorAll('option')).forEach((element) => {
      if (element.selected) {
        element.setAttribute('selected', 'selected');
      } else {
        element.removeAttribute('selected');
      }
    });
  });
};

// not working
export const captureHyperlinks = async ({ page }: ParamFix) => {
  const collectedLinks = new Set<string>();
  await page.evaluate(() => {
    // get internal links
    const anchors = Array.from(document.querySelectorAll('a'));
    const internal_links = anchors
      .filter(
        (a) =>
          a.href.startsWith('/') &&
          !/.(jpeg|jpg|gif|svg|ico|png)$/i.test(a.href)
      )
      .map((a) => a.href)
      .filter(
        (href) =>
          typeof href === 'string' &&
          href.startsWith('/') &&
          !/.(jpeg|jpg|gif|svg|ico|png)$/i.test(href) &&
          href.length > 0
      )
      .filter((str) => typeof str === 'string' && str.trim().length > 0);
    internal_links.forEach((item) => {
      if (item.trim().length > 0) collectedLinks.add(item);
    });
  });
  return collectedLinks;
};

interface ScreenshotParam {
  page: Page;
  filePath: string;
  route: string;
}

export const saveAsPng = ({ page, filePath, route }: ScreenshotParam) => {
  if (!existsSync(dirname(filePath))) mkdirSync(dirname(filePath));
  let screenshotPath: string;
  if (route.endsWith('.html')) {
    screenshotPath = filePath.replace(/\.html$/, '.png');
  } else if (route === '/') {
    screenshotPath = `${filePath}index.png`;
  } else {
    screenshotPath = `${filePath.replace(/\/$/, '')}.png`;
  }
  return page.screenshot({ path: screenshotPath });
};

// just for dump
export function setid({ page }: ParamFix) {
  return page.evaluate(() => {
    document.querySelectorAll('html,head,header,footer').forEach((el) => {
      el.setAttribute('prerender-it', 'true');
    });
  });
}

export interface FixChunksOptions {
  http2PushManifest?: boolean;
  inlineCss?: boolean;
  basePath: string;
  page: Page;
}

export const fixWebpackChunksIssue1 = ({
  page,
  basePath,
  http2PushManifest = false,
  inlineCss = false
}: FixChunksOptions) => {
  return page.evaluate(
    (basePath, http2PushManifest, inlineCss) => {
      const localScripts = Array.from(document.scripts).filter(
        (x) => x.src && x.src.startsWith(basePath)
      );
      // CRA v1|v2.alpha
      const mainRegexp = /main\.[\w]{8}.js|main\.[\w]{8}\.chunk\.js/;
      const mainScript = localScripts.find((x) => mainRegexp.test(x.src));
      const firstStyle = document.querySelector('style');

      if (!mainScript) return;

      const chunkRegexp = /(\w+)\.[\w]{8}(\.chunk)?\.js/g;
      const chunkScripts = localScripts.filter((x) => {
        const matched = chunkRegexp.exec(x.src);
        // we need to reset state of RegExp https://stackoverflow.com/a/11477448
        chunkRegexp.lastIndex = 0;
        return matched && matched[1] !== 'main' && matched[1] !== 'vendors';
      });

      const mainScripts = localScripts.filter((x) => {
        const matched = chunkRegexp.exec(x.src);
        // we need to reset state of RegExp https://stackoverflow.com/a/11477448
        chunkRegexp.lastIndex = 0;
        return matched && (matched[1] === 'main' || matched[1] === 'vendors');
      });

      const createLink = (x: Element) => {
        if (http2PushManifest) return;
        const linkTag = document.createElement('link');
        linkTag.setAttribute('rel', 'preload');
        linkTag.setAttribute('as', 'script');
        linkTag.setAttribute(
          'href',
          x.getAttribute('src').replace(basePath, '')
        );
        if (inlineCss) {
          firstStyle.parentNode.insertBefore(linkTag, firstStyle);
        } else {
          document.head.appendChild(linkTag);
        }
      };

      mainScripts.map((x) => createLink(x));
      for (let i = chunkScripts.length - 1; i >= 0; --i) {
        const x = chunkScripts[i];
        if (x.parentElement && mainScript.parentNode) {
          x.parentElement.removeChild(x);
          createLink(x);
        }
      }
    },
    basePath,
    http2PushManifest,
    inlineCss
  );
};

export const fixWebpackChunksIssue2 = ({
  page,
  basePath,
  http2PushManifest = false,
  inlineCss = false
}: FixChunksOptions) => {
  return page.evaluate(
    (basePath, http2PushManifest, inlineCss) => {
      const localScripts = Array.from(document.scripts).filter(
        (x) => x.src && x.src.startsWith(basePath)
      );
      // CRA v2
      const mainRegexp = /main\.[\w]{8}\.chunk\.js/;
      const mainScript = localScripts.find((x) => mainRegexp.test(x.src));
      const firstStyle = document.querySelector('style');

      if (!mainScript) return;

      const chunkRegexp = /(\w+)\.[\w]{8}\.chunk\.js/g;

      const headScripts = Array.from(document.querySelectorAll('head script'))
        .filter(
          (x) =>
            x.hasAttribute('src') && x.getAttribute('src').startsWith(basePath)
        )
        .filter((x) => {
          const matched = chunkRegexp.exec(x.getAttribute('src'));
          // we need to reset state of RegExp https://stackoverflow.com/a/11477448
          chunkRegexp.lastIndex = 0;
          return matched;
        });

      const chunkScripts = localScripts.filter((x) => {
        const matched = chunkRegexp.exec(x.src);
        // we need to reset state of RegExp https://stackoverflow.com/a/11477448
        chunkRegexp.lastIndex = 0;
        return matched;
      });

      const createLink = (x: Element) => {
        if (http2PushManifest) return;
        const linkTag = document.createElement('link');
        linkTag.setAttribute('rel', 'preload');
        linkTag.setAttribute('as', 'script');
        linkTag.setAttribute(
          'href',
          x.getAttribute('src').replace(basePath, '')
        );
        if (inlineCss) {
          firstStyle.parentNode.insertBefore(linkTag, firstStyle);
        } else {
          document.head.appendChild(linkTag);
        }
      };

      for (let i = headScripts.length; i <= chunkScripts.length - 1; i++) {
        const x = chunkScripts[i];
        if (x.parentElement && mainScript.parentNode) {
          createLink(x);
        }
      }

      for (let i = headScripts.length - 1; i >= 0; --i) {
        const x = headScripts[i];
        if (x.parentElement && mainScript.parentNode) {
          x.parentElement.removeChild(x);
          createLink(x);
        }
      }
    },
    basePath,
    http2PushManifest,
    inlineCss
  );
};

export const fixParcelChunksIssue = ({
  page,
  basePath,
  http2PushManifest = false,
  inlineCss = false
}: FixChunksOptions) => {
  return page.evaluate(
    (basePath, http2PushManifest, inlineCss) => {
      const localScripts = Array.from(document.scripts).filter(
        (x) => x.src && x.src.startsWith(basePath)
      );

      const mainRegexp = /main\.[\w]{8}\.js/;
      const mainScript = localScripts.find((x) => mainRegexp.test(x.src));
      const firstStyle = document.querySelector('style');

      if (!mainScript) return;

      const chunkRegexp = /(\w+)\.[\w]{8}\.js/g;
      const chunkScripts = localScripts.filter((x) => {
        const matched = chunkRegexp.exec(x.src);
        // we need to reset state of RegExp https://stackoverflow.com/a/11477448
        chunkRegexp.lastIndex = 0;
        return matched && matched[1] !== 'main';
      });

      const createLink = (x) => {
        if (http2PushManifest) return;
        const linkTag = document.createElement('link');
        linkTag.setAttribute('rel', 'preload');
        linkTag.setAttribute('as', 'script');
        linkTag.setAttribute('href', x.src.replace(`${basePath}/`, ''));
        if (inlineCss) {
          firstStyle.parentNode.insertBefore(linkTag, firstStyle);
        } else {
          document.head.appendChild(linkTag);
        }
      };

      for (let i = 0; i <= chunkScripts.length - 1; i++) {
        const x = chunkScripts[i];
        if (x.parentElement && mainScript.parentNode) {
          x.parentElement.removeChild(x);
          createLink(x);
        }
      }
    },
    basePath,
    http2PushManifest,
    inlineCss
  );
};
