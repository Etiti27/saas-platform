// currencies.scrape.mjs (or any server-side module)
import { load } from 'cheerio';

/**
 * Scrape Wikipedia for "List of circulating currencies by state or territory"
 * Returns: { [country: string]: Array<{code: string, name: string, symbol?: string}> }
 */
export async function countryAndCurrency() {
  const url = 'https://en.wikipedia.org/wiki/List_of_circulating_currencies';
  const res = await fetch(url, {
    headers: {
      // be polite; some sites respond differently without UA
      'User-Agent': 'currency-scraper/1.0 (+https://example.com)'
    }
  });
  if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);

  const html = await res.text();
  const $ = load(html);

  // pick the "big" wikitable by column names to avoid layout changes
  const tables = $('table.wikitable');
  let target;
  tables.each((_, t) => {
    const headText = $(t).find('th').map((_, th) => $(th).text().toLowerCase()).get().join(' ');
    if (headText.includes('state') && headText.includes('currency') && headText.includes('iso')) {
      target = t;
      return false; // break
    }
  });
  if (!target) throw new Error('Could not locate the currencies table');

  const clean = (s) => s.replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').trim(); // remove footnote [1], collapse spaces
  const out = {};

  $(target).find('tbody > tr').each((_, tr) => {
    const tds = $(tr).find('td');
    if (tds.length < 4) return;

    const country  = clean($(tds[0]).text());
    const currency = clean($(tds[1]).text());
    const symbol   = clean($(tds[2]).text());
    const code     = clean($(tds[3]).text());

    if (!country || !currency || !code) return;

    const cur = { code, name: currency };
    if (symbol) cur.symbol = symbol;

    (out[country] ??= []);
    if (!out[country].some(c => c.code === cur.code)) out[country].push(cur);
  });

  return out; // return a plain object
}

