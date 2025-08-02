const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json({ error: "Missing query param ?q=" });

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();

  const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
  await page.goto(searchUrl, { waitUntil: "networkidle2" });

  const imageUrls = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img[src^="https://i.pinimg.com/"]'));
    return images.map(img => img.src);
  });

  await browser.close();

  res.json({
    query,
    count: imageUrls.length,
    results: imageUrls
  });
});

app.listen(PORT, () => {
  console.log("✅ Server running on port", PORT);
});
