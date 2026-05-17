const axios = require('axios')
const cheerio = require('cheerio')

// Generic fetch-and-extract helper.
// `selectors` should be an object describing how to find listings and fields:
// {
//   item: 'CSS selector for listing item',
//   title: 'relative selector for title',
//   price: 'relative selector for price',
//   url: 'relative selector for link (use attr `href`)',
// }

async function fetchAndExtract(url, selectors = {}) {
  const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HousingMatcher/1.0)' }, timeout: 15000 })
  const $ = cheerio.load(res.data)
  const items = []

  const nodes = $(selectors.item)
  nodes.each((i, el) => {
    const $el = $(el)
    const title = selectors.title ? $el.find(selectors.title).text().trim() : $el.text().trim()
    let urlVal = null
    if (selectors.url) {
      const link = $el.find(selectors.url)
      urlVal = link.attr('href') || null
      if (urlVal && urlVal.startsWith('/')) {
        // Resolve relative URL against base
        try { urlVal = new URL(urlVal, url).toString() } catch(e){}
      }
    }
    const priceText = selectors.price ? $el.find(selectors.price).text() : ''
    const price = priceText ? Number(String(priceText).replace(/[^0-9]/g, '')) || null : null

    items.push({ id: `generic-${i}-${Date.now()}`, source: 'generic', title, price, currency: 'CAD', url: urlVal })
  })

  return items
}

module.exports = { fetchAndExtract }
