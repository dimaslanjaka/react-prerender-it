import React, { useEffect } from 'react';
import { isDev } from '../../config';
import { useScript } from '../../utils/useScript';
import './Adsense.scss';

export interface AdsenseInsProps {
  [key: string]: any;
  key?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  client: string;
  slot: string;
  layout?: string;
  layoutKey?: string;
  format?: string;
  responsive?: string;
  pageLevelAds?: boolean;
  adTest?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * Adsense Component
 * @param attributes
 * @returns
 * @link https://support.google.com/adsense/answer/9042142?hl=en
 * @example
 * // remove data-ad- -> becomes single word
 * // data-ad-layout -> layout, data-ad-slot -> slot
 * <Adsense client="ca-pub-xxx" slot="123456" layout="responsive" style={{ display: block }} />
 */
export function AdsElement({
  className = '',
  style = { display: 'block' },
  client,
  key = Math.random().toString(),
  slot,
  disabled = false,
  layout = '',
  layoutKey = '',
  format = 'auto',
  responsive = 'false',
  pageLevelAds = false,
  adTest,
  children,
  ...rest
}: AdsenseInsProps) {
  useScript({
    url: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
  });

  // component did mount
  useEffect(() => {
    const p: AdsObject = {
      google_ad_client: ''
    };
    if (pageLevelAds) {
      p.google_ad_client = client;
      p.enable_page_level_ads = true;
    }

    if (typeof window === 'object') {
      if ((window as any).adsense_items) (window as any).adsense_items.push(p);
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push(p);
    }
  }, [client, pageLevelAds, slot]);

  // component did unmount

  // skip produce adsense ins when disabled == true
  if (disabled) return <></>;

  // auto ads test
  if (!adTest && isDev) {
    adTest = 'true';
  }

  const properties: Record<string, any> = rest;
  properties.style = style || { display: 'block' };
  properties['data-ad-client'] = client;
  properties['data-ad-slot'] = slot;
  if (layout.length > 0) properties['data-ad-layout'] = layout;
  if (layoutKey.length > 0) properties['data-ad-layout-key'] = layoutKey;
  if (format.length > 0) properties['data-ad-format'] = format;
  if (responsive === 'true')
    properties['data-full-width-responsive'] = responsive;
  if (adTest === 'true') properties['data-adtest'] = adTest;
  return (
    <div key={key || rest.id}>
      <ins className={`adsbygoogle ${className}`} {...properties}>
        {children}
      </ins>
    </div>
  );
}

/**
 * fix |uncaught exception: TagError: adsbygoogle.push() error: All ins elements in the DOM with class=adsbygoogle already have ads in them.
 */

/**
 * ensure adsense not duplicate
 * @param prevProps
 * @param nextProps
 * @returns
 */
function areEqual(prevProps: AdsenseInsProps, nextProps: AdsenseInsProps) {
  /*
	return true if passing nextProps to render would return
	the same result as passing prevProps to render,
	otherwise return false
	*/
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true; // donot re-render
  }
  return false; // will re-render
}
export const Adsense = React.memo(AdsElement, areEqual);
