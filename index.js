const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/search", async (req, res) => {
  const query = req.query.query;
  const count = parseInt(req.query.count) || 5;

  if (!query) return res.status(400).json({ error: "Missing query parameter" });

  const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);
    const imageUrls = [];

    $('img[src^="https://i.pinimg.com/"]').each((i, el) => {
      if (imageUrls.length < count) {
        imageUrls.push($(el).attr("src"));
      }
    });

    res.json({
      query,
      count: imageUrls.length,
      results: imageUrls,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch images", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Pinterest Scraper API running on http://localhost:${PORT}`);
});
