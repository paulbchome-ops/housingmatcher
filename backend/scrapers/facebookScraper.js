const puppeteer = require('puppeteer')

// Best-effort Facebook Marketplace scraper. Facebook often requires login and
// actively defends against scraping. This function attempts to open the
// public marketplace search page and extract listing links and titles. It may
// return limited results or require a logged-in session in practice.

async function searchFacebook(query) {
  let browser
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HousingMatcher/1.0')
    await page.setViewport({ width: 1200, height: 800 })

    const url = `https://www.facebook.com/marketplace/search/?query=${encodeURIComponent(query)}`
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

    // Wait a bit for dynamic content
    await page.waitForTimeout(3000)

    const items = await page.evaluate(() => {
      const out = []
      // Try to find links to marketplace items
      const anchors = Array.from(document.querySelectorAll('a'))
      for (const a of anchors) {
        const href = a.getAttribute('href') || ''
        if (href.includes('/marketplace/item/')) {
          const title = a.innerText || a.getAttribute('aria-label') || ''
          out.push({ title: title.trim(), url: href })
        }
      }
      return out.slice(0, 50)
    })

    // Normalize URLs
    const normalized = items.map((it, i) => ({
      id: `facebook-${i}-${Date.now()}`,
      source: 'facebook',
      title: it.title || 'Facebook listing',
      price: null,
      currency: 'CAD',
      url: it.url.startsWith('http') ? it.url : `https://www.facebook.com${it.url}`
    }))

    await browser.close()
    return normalized
  } catch (err) {
    if (browser) try { await browser.close() } catch (e) {}
    throw err
  }
}

module.exports = { searchFacebook }
