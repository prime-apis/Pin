const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/pinterest", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query parameter 'q'" });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;

    await page.goto(url, { waitUntil: "networkidle2" });

    await page.waitForSelector("img[srcset]", { timeout: 7000 });

    const images = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img[srcset]"));
      return imgs.slice(0, 15).map(img => {
        const srcset = img.getAttribute("srcset");
        const urls = srcset.split(",").map(s => s.trim().split(" ")[0]);
        return urls[urls.length - 1];
      });
    });

    await browser.close();

    res.json({
      query,
      count: images.length,
      results: images
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to scrape Pinterest images" });
  }
});

app.listen(PORT, () => {
  console.log(`Pinterest scraper API running on port ${PORT}`);
});
