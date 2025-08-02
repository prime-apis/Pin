const express = require('express');
const cors = require('cors');
const pinterest = require('pinterest-scraper');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json({ error: "Missing ?q= query" });

  try {
    const results = await pinterest(query);
    res.json({
      query,
      count: results.length,
      results
    });
  } catch (err) {
    res.status(500).json({ error: "Pinterest scraping failed", details: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Pinterest Image API by Eren');
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
