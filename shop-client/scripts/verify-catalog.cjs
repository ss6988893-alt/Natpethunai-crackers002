// Run with: node scripts/verify-catalog.cjs <path-to-playwright> [preview-url]
const assert = require('node:assert/strict');
const { chromium } = require(process.argv[2] || 'playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const categories = ['Sky Shots', 'Flower Pots', 'Sparklers', 'Empty Collection'].map((name, index) => ({ name, slug: `category-${index}`, description: 'Test collection' }));
    const products = categories.slice(0, 3).flatMap((category, index) => Array.from({ length: 7 }, (_, offset) => ({ id: `fixture-${index}-${offset}`, name: `${category.name} ${offset}`, category: category.name, categorySlug: category.slug, price: 70 - offset * 10, originalPrice: 100, discount: 30, priceAvailable: true, image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23ead7b0"/%3E%3C/svg%3E' })));
    await page.route('**/api/**', async (route) => {
      const path = new URL(route.request().url()).pathname;
      const data = path.endsWith('/categories') ? categories : path.endsWith('/products') ? products : [];
      await route.fulfill({ json: { data } });
    });
    await page.goto(`${process.argv[3] || 'http://127.0.0.1:5173'}/products`);
    await page.locator('.product-card').first().waitFor();
    assert.equal(await page.locator('.product-card').count(), 21);
    assert.equal(await page.locator('.catalog-explore').count(), 0);
    const choose = async (name) => {
      await page.locator('.filter-row button').filter({ hasText: name }).click();
      await page.waitForFunction((expected) => document.querySelector('#selected-category-title')?.textContent === expected, name);
    };
    const main = page.locator('.catalog-results > .product-category-group');
    const explore = page.locator('.catalog-explore');
    for (const name of ['Sky Shots', 'Flower Pots', 'Sparklers']) {
      await choose(name);
      assert.equal(await page.locator('#selected-category-title').textContent(), name);
      assert.equal(await main.locator('.product-card').count(), 7);
      assert.equal(await explore.locator('.product-card').count(), 9);
      const names = await explore.locator('.product-card__body > p').allTextContents();
      assert(!names.includes(name));
      assert.equal(new Set(names).size, 2);
      assert.equal(await page.locator('.filter-row button[aria-pressed="true"]').count(), 1);
      assert.equal(await main.locator('.price strong').first().textContent(), '₹10');
    }
    await page.getByLabel('Sort products').selectOption('high');
    await page.waitForFunction(() => document.querySelector('.catalog-results > .product-category-group .price strong')?.textContent === '₹70');
    assert.equal(await main.locator('.price strong').first().textContent(), '₹70');
    const card = main.locator('.product-card').first();
    await card.getByLabel('Increase quantity').click();
    await card.locator('.add-button').click();
    let cart = await page.evaluate(() => JSON.parse(localStorage.getItem('ntc-cart-v1')));
    assert.equal(cart[0].quantity, 2);
    await explore.locator('.product-card').first().locator('.add-button').click();
    cart = await page.evaluate(() => JSON.parse(localStorage.getItem('ntc-cart-v1')));
    assert.equal(cart.length, 2);
    await card.locator('.product-card__image').click();
    await page.getByRole('dialog').waitFor();
    await page.getByRole('dialog').getByRole('button', { name: 'Add to cart' }).click();
    cart = await page.evaluate(() => JSON.parse(localStorage.getItem('ntc-cart-v1')));
    assert.equal(cart[0].quantity, 3);
    await page.getByLabel('Search products').fill('Sparklers 3');
    await page.waitForFunction(() => document.querySelectorAll('.catalog-results > .product-category-group .product-card').length === 1);
    assert.equal(await main.locator('.product-card').count(), 1);
    assert.equal(await explore.locator('.product-card').count(), 0);
    await page.getByLabel('Search products').fill('');
    await choose('Empty Collection');
    assert.equal(await main.locator('.product-card').count(), 0);
    assert(await main.getByText('No products available in this category.').isVisible());
    assert.equal(await explore.locator('.product-card').count(), 9);
    await explore.getByRole('button', { name: 'View all crackers' }).click();
    await page.waitForFunction(() => !document.querySelector('.catalog-explore'));
    assert.equal(await page.locator('.product-card').count(), 21);
    assert.equal(await explore.count(), 0);
    await choose('Sky Shots');
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.locator('.products-content').scrollIntoViewIfNeeded();
      const layout = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, columns: getComputedStyle(document.querySelector('.product-grid')).gridTemplateColumns.split(' ').length }));
      assert(layout.scroll <= layout.width + 1, `Horizontal overflow at ${width}: ${layout.scroll}`);
      assert.equal(layout.columns, width === 320 ? 1 : width === 390 ? 2 : 3);
      const clipped = await page.locator('.products-content .product-card').evaluateAll((cards) => cards.some((item) => item.scrollWidth > item.clientWidth + 1));
      assert(!clipped, `Card overflow at ${width}`);
    }
    assert.deepEqual(errors, []);
    console.log('PASS: category switching, no duplicate suggestions, diversity/limit, sorting, search, empty category, All/View all, cart quantities, quick view, and responsive widths 320/390/768/1440.');
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
