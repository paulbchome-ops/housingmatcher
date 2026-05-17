const axios = require('axios')
const cheerio = require('cheerio')

// Simple Craigslist scraper for a given region (default: toronto)
// Note: Craigslist blocks aggressive scraping. Use responsibly.

async function searchCraigslist(query, region = 'toronto') {
  const base = `https://${region}.craigslist.org`
  const url = `${base}/search/apa?query=${encodeURIComponent(query)}&sort=rel`

  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; HousingMatcher/1.0; +https://example.com)'
    },
    timeout: 15000
  })

  const $ = cheerio.load(res.data)
  const items = []

  $('li.result-row').each((i, el) => {
    try {
      const titleEl = $(el).find('a.result-title')
      const title = titleEl.text().trim()
      let href = titleEl.attr('href') || ''
      if (href && !href.startsWith('http')) href = base + href
      const priceText = $(el).find('.result-price').first().text() || ''
      const price = Number(priceText.replace(/[^0-9]/g, '')) || null

      items.push({
        id: `craigslist-${i}-${Date.now()}`,
        source: 'craigslist',
        title,
        price,
        currency: 'CAD',
        url: href
      })
    } catch (err) {
      // skip malformed entries
    }
  })

  return items.slice(0, 50)
}

module.exports = { searchCraigslist }
