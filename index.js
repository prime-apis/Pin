const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.get("/api/search", async (req, res) => {
  const query = req.query.query;
  const count = parseInt(req.query.count) || 5;
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.waitForSelector("img[srcset]", { timeout: 8000 });

    const images = await page.evaluate((max) => {
      const elems = Array.from(document.querySelectorAll("img[srcset]"));
      return elems.slice(0, max).map((img) => {
        const set = img.getAttribute("srcset");
        const list = set.split(",").map((s) => s.trim().split(" ")[0]);
        return list[list.length - 1];
      });
    }, count);

    await browser.close();
    res.json({ query, count: images.length, results: images });
  } catch (err) {
    res.status(500).json({ error: "Scrape failed", detail: err.message });
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Puppeteer Pinterest scraper running")
);
