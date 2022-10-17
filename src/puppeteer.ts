import { join } from 'path';

export const otohitsArgs = [
  '--type=renderer',
  '--no-sandbox',
  '--autoplay-policy=no-user-gesture-required',
  '--log-file=' + join(process.cwd(), 'tmp/puppeteer_logs/debug.log'),
  '--field-trial-handle=6500724731146965368,15747076022479036310,131072',
  '--disable-features=MimeHandlerViewInCrossProcessFrame',
  '--lang=en-US',
  '--locales-dir-path=' + join(__dirname, '../resources/locales'),
  '--log-severity=disable',
  '--resources-dir-path=' + join(__dirname, '../resources'),
  '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:80.0) Gecko/20100101 Firefox/104.0.2',
  '--num-raster-threads=2',
  '--enable-main-frame-before-activation',
  //'--use-angle=swiftshader-webgl',
  '--service-request-channel-token=2011700786163168796',
  '--shared-files=v8_context_snapshot_data:100,v8_natives_data:101',
  `--renderer-client-id=4`
];

export const defaultArg = [
  '--user-data-dir=' + join(process.cwd(), 'tmp/puppeteer_profile'),
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-infobars',
  '--window-position=0,0',
  '--ignore-certifcate-errors',
  '--ignore-certifcate-errors-spki-list',
  '--ignoreHTTPSErrors=true',
  '--user-agent="Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/W.X.Y.Z‡ Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"'
];

export const withIframe = [
  '--no-sandbox',
  '--user-data-dir=' + join(process.cwd(), 'tmp/puppeteer_profile'),
  '--disable-web-security',
  '--disable-features=site-per-process'
];
