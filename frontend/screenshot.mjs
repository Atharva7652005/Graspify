import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    
    console.log("Navigating to http://localhost:5173/ ...");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
    
    console.log("Taking screenshot...");
    await page.screenshot({ path: 'C:\\Users\\Atharva\\.gemini\\antigravity-ide\\brain\\26d8ff0e-efc1-48f6-8ae9-3fb714b9084c\\scratch\\landing_screenshot2.png', fullPage: true });
    console.log("Screenshot saved to scratch directory");
    
    await browser.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
})();
