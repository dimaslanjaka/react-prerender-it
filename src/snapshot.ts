/* eslint-disable @typescript-eslint/no-this-alias */
import Bluebird from 'bluebird';
import debuglib from 'debug';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { BinaryData, JSDOM } from 'jsdom';
import prettier from 'prettier';
import { launch } from 'puppeteer';
import { dirname, join, toUnix } from 'upath';
import prettierOptions from './.prettierrc';
import {
  fixFormFields,
  fixInsertRule,
  fixWebpackChunksIssue1,
  preloadResources
} from './snapshot.utils';
import pkgTempFile from './temp-package.json';
import { array_unique } from './utils/array';
import { isDev } from './utils/env';

const debug = (suffix: string) => debuglib('prerender-it-' + suffix);

type pkgType = typeof pkgTempFile & {
  homepage: string;
};
const tempPkg = join(__dirname, 'temp-package.json');
if (!existsSync(tempPkg)) save(tempPkg, '{}');
const pkg = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
) as pkgType;
save(tempPkg, JSON.stringify(pkg));
export const pkgJson = pkg;

export class Snapshot {
  links = new Set<string>();
  scraping = false;
  /**
   * scrape url schedule list
   */
  schedule = new Set<string>();
  /**
   * scraped url list
   */
  scraped = new Set<string>();

  async launchBrowser() {
    return await launch({
      headless: true,
      timeout: 3 * 60 * 1000,
      args: array_unique([
        '--user-data-dir=' + join(process.cwd(), 'tmp/puppeteer_profile'),
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--ignoreHTTPSErrors=true',
        '--user-agent="Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/W.X.Y.Z‡ Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"',
        '--disable-features=site-per-process',
        '--disable-web-security'
      ]),
      userDataDir: join(process.cwd(), 'tmp/puppeteer_profile')
    });
  }

  /**
   * scrape url
   * @param url
   * @returns
   */
  async scrape(url: string) {
    // skip url that already scraped
    if (this.scraped.has(url)) {
      return null;
    }
    // add to schedule when indicator is true
    if (this.scraping) {
      if (!this.scraped.has(url)) this.schedule.add(url);
      return null;
    }
    // set indicator true
    this.scraping = true;
    // launch browser
    const browser = await this.launchBrowser();
    // init result default null
    let result = null as string;
    try {
      const page = await browser.newPage();
      // set do not track
      page.setExtraHTTPHeaders({ DNT: '1' });
      // apply request interception https://github.com/puppeteer/puppeteer/issues/5287#issuecomment-572005871
      await page.setRequestInterception(true);
      // listen error
      page.on('pageerror', function (e) {
        debug('error')('page error', e.message);
        browser.close();
      });
      // listen request
      page.on('request', (request) => {
        const url = request.url();

        let continueRequest = true;
        const disabledResources = [
          // disable adsense
          /pagead2\.googlesyndication\.com/gi,
          // disable google analytics
          /googletagmanager\.com/gi,
          // disable google analytics
          /google-analytics\.com/gi
        ];
        // disable matched resources
        if (disabledResources.some((regex) => regex.test(url))) {
          continueRequest = false;
        }
        if (!continueRequest) {
          request.abort();
        } else {
          debug('request')(request.resourceType(), url);
          request.continue();
        }
      });
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 3 * 60 * 1000
      });
      await page.waitForNetworkIdle();
      preloadResources({ page, basePath: new URL(pkg.homepage).pathname });
      await fixInsertRule({ page });
      await fixFormFields({ page });
      await fixWebpackChunksIssue1({
        basePath: new URL(pkg.homepage).pathname,
        page
      });
      const content = await page.content();

      result = content;
      //result = await this.removeUnwantedHtml(result);
      //result = await this.removeDuplicateScript(result);
      //result = await this.fixInners(result);
      //result = await this.fixSeoFromHtml(result);
      //result = await this.setIdentifierFromHtml(result);
      //result = await this.fixCdn(result);

      if (isDev) {
        result = prettier.format(
          result,
          Object.assign(prettierOptions, { parser: 'html' })
        );
      }
    } catch {
      //
    }
    await browser.close();
    this.scraped.add(url);
    // set indicator false
    this.scraping = false;
    // iterate scheduled url
    if (this.schedule.size > 0) {
      const next = this.schedule.values().next().value;
      this.schedule.delete(next);
      this.scrape(next);
    }
    return result;
  }

  async removeUnwantedHtml(html: string | ArrayBuffer | DataView) {
    const dom = new JSDOM(html);
    const window = dom.window;
    const document = dom.window.document;
    // remove unused elements
    const selectors = [
      // auto generated adsense
      "script[src*='adsid/integrator.js']",
      // auto generated adsense
      "script[src*='partner.googleadservices.com']",
      // auto generated adsense
      "script[src*='show_ads_impl.js']",
      // auto generated adsense
      "link[href*='adsid/integrator.js']",
      // auto generated google analytics
      'script[src*="&amp;l=dataLayer&amp;"]',
      // auto generated react
      "meta[http-equiv='origin-trial']",
      // auto generated adsense
      "iframe[src*='googleads.g.doubleclick.net']",
      // auto generated adsense
      "iframe[src='https://www.google.com/recaptcha/api2/aframe']",
      // auto generated adsense
      '.adsbygoogle-noablate',
      // auto generated adsense
      'iframe[src*="tpc.googlesyndication.com"]',
      // auto generated disqus
      'link[href="https://disqus.com/next/config.js"]',
      // auto generated disqus
      'script[src*=".disqus.com/recommendations.js"]',
      // auto generated google analytics
      'script[src*="www.google-analytics.com/analytics.js"]'
    ];
    selectors
      .map((selector) => Array.from(document.querySelectorAll(selector)))
      .forEach((arr) => arr.map((el) => el.remove()));
    const result = await this.serializeHtml(dom).finally(() => {
      window.close();
    });
    return result;
  }

  async removeDuplicateScript(html: string | ArrayBuffer | DataView) {
    // parsing
    const dom = new JSDOM(html);
    const window = dom.window;
    const document = dom.window.document;

    // remove duplicated src script
    const scripts: string[] = [];
    Array.from(document.querySelectorAll('script')).forEach((el) => {
      if (scripts.includes(el.src)) {
        el.remove();
      } else {
        scripts.push(el.src);
      }
    });
    // remove duplicated links
    const links: string[] = [];
    Array.from(document.querySelectorAll('link')).forEach((el) => {
      if (links.includes(el.href)) {
        el.remove();
      } else {
        links.push(el.href);
      }
    });

    const result = await this.serializeHtml(dom).finally(() => {
      window.close();
    });
    return result;
  }

  async fixInners(html: string | ArrayBuffer | DataView) {
    // parsing
    const dom = new JSDOM(html);
    const window = dom.window;
    const document = dom.window.document;

    // remove inner html ins adsense
    Array.from(document.querySelectorAll('ins.adsbygoogle')).forEach((el) => {
      el.innerHTML = '';
      el.removeAttribute('data-ad-status');
      el.removeAttribute('data-adtest');
      el.removeAttribute('data-adsbygoogle-status');
    });
    // remove inner disqus comment
    Array.from(
      document.querySelectorAll('#disqus_thread,#disqus_recommendations')
    ).forEach((el) => {
      el.innerHTML = '';
    });
    const result = await this.serializeHtml(dom).finally(() => {
      window.close();
    });
    return result;
  }

  async fixCdn(html: string | ArrayBuffer | DataView) {
    // parsing
    const dom = new JSDOM(html);
    const window = dom.window;
    const document = dom.window.document;

    const links = Array.from(document.querySelectorAll('link'));
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      if (link.href.includes('c.disquscdn.com')) link.remove();
    }

    const scripts = Array.from(document.querySelectorAll('script'));
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      if (
        // remove auto cdn disqus
        script.src.includes('c.disquscdn.com') ||
        // remove auto cdn google analytics
        script.src.includes('l=dataLayer')
      )
        script.remove();
    }

    const iframes = Array.from(document.querySelectorAll('iframe'));
    for (let i = 0; i < iframes.length; i++) {
      const iframe = iframes[i];
      // fix hidden adsense
      // style="display: none;"
      const noSrc = !iframe.hasAttribute('src') || !iframe.src;
      const noCustomAttr =
        !iframe.hasAttribute('id') || !iframe.hasAttribute('class');
      if (noSrc && noCustomAttr && iframe.hasAttribute('style')) {
        iframe.remove();
      }
    }

    const result = await this.serializeHtml(dom).finally(() => {
      window.close();
    });
    return result;
  }

  async fixSeoFromHtml(html: string | Buffer | BinaryData) {
    // parsing
    const dom = new JSDOM(html);
    const window = dom.window;
    const document = dom.window.document;

    // get internal links
    const anchors = Array.from(document.querySelectorAll('a'));
    const internal_links = array_unique(
      anchors
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
    ).filter(
      (str) =>
        typeof str === 'string' &&
        str.length > 0 &&
        !str.startsWith('/undefined')
    );
    internal_links.forEach((item) => {
      if (item.trim().length > 0) this.links.add(item);
    });
    // seo external links
    /*const hostname = new URL(pkg.homepage).host;
    anchors
      .filter((a) => /^https?:\/\//.test(a.href) && !a.href.includes(hostname))
      .forEach((a) => {
        a.rel = 'nofollow noopener noreferer';
        a.target = '_blank';
      });*/

    const result = await this.serializeHtml(dom).finally(() => {
      window.close();
    });
    return result;
  }

  async setIdentifierFromHtml(
    html: string | ArrayBuffer | DataView | undefined
  ) {
    if (!html) throw new Error('html empty');

    // parsing
    const dom = new JSDOM(html);
    const window = dom.window;
    const document = dom.window.document;

    // set identifier
    Array.from(document.querySelectorAll('body,html,header,footer')).forEach(
      (el) => el.setAttribute('react-static', 'true')
    );

    const result = await this.serializeHtml(dom).finally(() => {
      window.close();
    });
    return result;
  }

  async serializeHtml(dom: JSDOM) {
    try {
      return dom.serialize();
    } catch {
      return document.documentElement.outerHTML;
    }
  }

  static isPathNonHtml(str: string) {
    return /.(png|jpe?g|ico|txt|gif|svg|mp4)$/.test(str);
  }

  static isPathHasExt(str: string) {
    if (str.endsWith('/')) return false;
    return /\.\w+$/.test(str);
  }
}

export function save(file: string, content: string) {
  return new Bluebird((resolve: (file: string) => any) => {
    if (!existsSync(dirname(file)))
      mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
    resolve(file);
  });
}

/**
 * Remove cwd
 * @param str
 * @returns
 */
export function workspace(str: string) {
  return toUnix(str).replace(toUnix(process.cwd()), '');
}
