/**
 * Google analytics v3
 */
export const GTAGID = 'UA-106238155-1';
/**
 * is current runtime is development?
 */
export const isDev =
  typeof process.env.NODE_ENV === 'string'
    ? /dev/i.test(process.env.NODE_ENV)
    : false;
