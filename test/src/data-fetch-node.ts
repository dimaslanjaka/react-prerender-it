// run standalone

import axios from 'axios';
import Bluebird from 'bluebird';
import { writeFileSync } from 'fs';
import { join } from 'path';

Bluebird.all(
  axios
    .get('https://www.webmanajemen.com/sitemap.txt')
    .then((res) =>
      (res.data as string)
        .split(/\r?\n/g)
        .filter((url) => url.endsWith('.html'))
    )
)
  .map((url, i) => {
    const ip =
      Math.floor(Math.random() * 255) +
      1 +
      '.' +
      Math.floor(Math.random() * 255) +
      '.' +
      Math.floor(Math.random() * 255) +
      '.' +
      Math.floor(Math.random() * 255);
    const name = 'Dimas ' + makeid();
    return {
      name,
      url,
      id: i + 1,
      ip,
      image: 'https://via.placeholder.com/220x100?text=' + url
    };
  })
  .then((newdata) => {
    writeFileSync(
      join(__dirname, 'data.json'),
      JSON.stringify(newdata.slice(25, 40), null, 2)
    );
  });

function makeid() {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
