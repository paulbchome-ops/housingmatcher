const express = require('express');
const cors = require('cors');
const mock = require('./scrapers/mockScraper');
const craigslist = require('./scrapers/craigslistScraper');
const facebook = require('./scrapers/facebookScraper');
const generic = require('./scrapers/genericScraper');

const app = express();
app.use(cors());
app.use(express.json());

// Simple search endpoint returning aggregated mock results
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query parameter `q`' });

  try {
    // Craigslist: use real scraper
    const craigslistPromise = craigslist.searchCraigslist(q).catch(e => {
      console.error('Craigslist scraper failed:', e.message)
      return []
    })

    // Facebook: best-effort using Puppeteer (may require login / fail)
    const facebookPromise = facebook.searchFacebook(q).catch(e => {
      console.error('Facebook scraper failed:', e.message)
      return []
    })

    // Realtor: fallback to mock for now (site is highly dynamic / API-based)
    const realtorPromise = mock.searchRealtor(q).catch(() => [])

    const [realtor, craigslistResults, fb] = await Promise.all([
      realtorPromise,
      craigslistPromise,
      facebookPromise
    ])

    // Combine and return
    const combined = [...realtor, ...craigslistResults, ...fb];
    res.json({ query: q, results: combined });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`));
