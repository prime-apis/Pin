const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

app.get("/", async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: "Query required" });

  try {
    const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);
    const imageUrls = [];

    $("img").each((i, el) => {
      const src = $(el).attr("src");
      if (src && src.startsWith("https://i.pinimg.com")) imageUrls.push(src);
    });

    res.json({
      query,
      count: imageUrls.length,
      results: imageUrls.slice(0, 20),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

app.listen(3000, () => console.log("Pinterest image scraper API running on port 3000"));
