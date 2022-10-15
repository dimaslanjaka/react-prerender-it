import React from 'react';
import { createRoot, hydrateRoot, Root } from 'react-dom/client';
import { Metric } from 'web-vitals';
import App from './App';
import { GTAGID } from './config';
import './index.css';
import reportWebVitals from './reportWebVitals';

const container = document.getElementById('root');
const AppWrapper = () => {
  React.useEffect(() => {
    // init google analytics
    if (typeof window.gtag === 'function') {
      gtag('js', new Date());
      gtag('config', GTAGID);
    }
  });

  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

let root: Root;
if (container) {
  if (container.hasChildNodes()) {
    root = hydrateRoot(container, <AppWrapper />);
  } else {
    root = createRoot(container);
    root.render(<AppWrapper />);
  }
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
function sendToAnalytics(metric: Metric) {
  const val =
    typeof metric.value !== 'number' ? parseInt(metric.value) : metric.value;
  const properties = Object.assign(metric, {
    event_category: 'web-vitals',
    value: Math.round(metric.name === 'CLS' ? val * 1000 : val), // values must be integers
    event_label: metric.name,
    nonInteraction: true // avoids affecting bounce rate
  } as Gtag.ControlParams & Gtag.EventParams & Gtag.CustomParams);
  if (typeof window.gtag === 'function') {
    // https://developers.google.com/analytics/devguides/collection/gtagjs
    // https://developers.google.com/gtagjs/reference/event#timing_complete
    window.gtag('event', 'coreWebVitals', properties);
  } else {
    console.log('google analystic not installed', properties);
  }
}
reportWebVitals(sendToAnalytics);
