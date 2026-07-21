import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log('--- DOM HTML ---');
  console.log(html.substring(0, 1000));
  console.log('...');
  console.log('--- END DOM HTML ---');
  
  const isWhite = await page.evaluate(() => {
    const el = document.elementFromPoint(100, 100);
    if (el) {
       const style = window.getComputedStyle(el);
       return { tag: el.tagName, bg: style.backgroundColor };
    }
    return null;
  });
  console.log('Element at (100,100):', isWhite);

  await browser.close();
})();
