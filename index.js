const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/pinterest", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query parameter 'q'" });

  try {
    const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)" +
          " Chrome/115.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);
    const images = [];

    $("img[srcset]").each((i, el) => {
      if (i >= 15) return false; // max 15 images

      const srcset = $(el).attr("srcset");
      const urls = srcset.split(",").map((s) => s.trim().split(" ")[0]);
      const maxResUrl = urls[urls.length - 1];

      images.push(maxResUrl);
    });

    res.json({
      query,
      count: images.length,
      results: images,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to scrape Pinterest images" });
  }
});

app.listen(PORT, () => {
  console.log(`Pinterest scraper API running on port ${PORT}`);
});
