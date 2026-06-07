const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to simulate a desktop browser
  await page.setViewport({ width: 1280, height: 800 });
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  await page.screenshot({ path: 'screenshot.png' });
  
  await browser.close();
  console.log('Screenshot saved to screenshot.png');
})();
