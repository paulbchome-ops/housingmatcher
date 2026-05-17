// Mock scraper functions returning example data.

function sampleListing(source, i, query) {
  const basePrice = 1200 + (i * 150);
  return {
    id: `${source}-${i}`,
    source,
    title: `${query} - ${source} listing ${i}`,
    price: basePrice,
    currency: 'CAD',
    url: `https://example.com/${source}/${i}`
  };
}

async function searchRealtor(query) {
  return [1,2].map(i => sampleListing('realtor', i, query));
}

async function searchCraigslist(query) {
  return [1,2,3].map(i => sampleListing('craigslist', i, query));
}

async function searchFacebook(query) {
  return [1].map(i => sampleListing('facebook', i, query));
}

module.exports = {
  searchRealtor,
  searchCraigslist,
  searchFacebook
};
