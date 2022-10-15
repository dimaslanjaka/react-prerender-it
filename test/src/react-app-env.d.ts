/// <reference types="react-scripts" />
/// <reference types="gtag.js" />
/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />
// uncomment below library when you using some below library
// / <reference types="jquery" />
// / <reference types="bootstrap" />

declare module '*.svg' {
  const content: any;
  export default content;
}

declare namespace JSX {
  interface ExtendedButton
    extends React.DetailedHTMLProps<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    > {
    [key: string]: any;
    customAttribute?: string;
  }

  interface IntrinsicElements {
    [key: string]: any;
    button: ExtendedButton;
  }
}

interface AdsObject {
  [key: string]: any;
  google_ad_client: string;
  enable_page_level_ads?: boolean;
}
interface Window {
  adsbygoogle: { [key: string]: any }[];
  adsense_items: AdsObject[];
}
