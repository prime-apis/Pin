const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/search", async (req, res) => {
  const query = req.query.query;
  const count = parseInt(req.query.count) || 5;

  if (!query) return res.status(400).json({ error: "Missing query param" });

  try {
    const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);
    const imageUrls = new Set();

    $("img").each((_, img) => {
      const src = $(img).attr("src");
      if (src && src.includes("pinimg.com")) {
        imageUrls.add(src);
      }
    });

    const result = Array.from(imageUrls).slice(0, count);

    res.json({
      query,
      count: result.length,
      results: result,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch images", detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Pinterest Scraper API running on port ${PORT}`);
});
