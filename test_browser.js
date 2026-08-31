const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://127.0.0.1:5173/organizer/events/new');
  await page.waitForTimeout(2000);
  
  const content = await page.content();
  if (content.includes('Event basics')) {
      console.log('SUCCESS: Page rendered properly!');
  } else {
      console.log('FAILED: Content does not contain Event basics');
  }
  
  await browser.close();
}
run();
