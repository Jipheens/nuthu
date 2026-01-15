// End-to-end API smoke test (register -> login -> add product -> add to cart -> create order)
// Usage:
//   node scripts/e2e-smoke.mjs --baseUrl http://localhost:4000
//
// Notes:
// - Uses cookie auth (captures Set-Cookie from /api/auth/login).
// - Creates a temporary product.

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const idx = args.findIndex((a) => a === name);
  return idx >= 0 ? args[idx + 1] : fallback;
};

const baseUrl = (getArg('--baseUrl', 'http://localhost:4000') || '').replace(/\/$/, '');
const api = `${baseUrl}/api`;

const rand = () => Math.random().toString(16).slice(2);
const testEmail = `e2e_${Date.now()}_${rand()}@example.com`;
const testPassword = `Passw0rd!_${rand()}`;

let cookieHeader = '';

async function http(method, url, body) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (cookieHeader) headers.Cookie = cookieHeader;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    // Keep only the cookie key-value (drop attributes)
    const tokenCookie = setCookie.split(',')[0].split(';')[0];
    cookieHeader = tokenCookie;
  }

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }

  return { status: res.status, ok: res.ok, json };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log(`Base URL: ${baseUrl}`);

  // Health
  {
    const r = await http('GET', `${api}/health`);
    assert(r.ok, `Health check failed (${r.status})`);
    console.log('✓ health');
  }

  // Register
  {
    const r = await http('POST', `${api}/auth/register`, {
      email: testEmail,
      password: testPassword,
      name: 'E2E User',
    });
    assert(r.ok, `Register failed (${r.status}): ${JSON.stringify(r.json)}`);
    assert(r.json?.user?.email === testEmail, 'Register did not return expected user');
    console.log('✓ register');
  }

  // Logout then login (exercise both)
  {
    const r1 = await http('POST', `${api}/auth/logout`);
    assert(r1.ok, `Logout failed (${r1.status})`);

    const r2 = await http('POST', `${api}/auth/login`, {
      email: testEmail,
      password: testPassword,
    });
    assert(r2.ok, `Login failed (${r2.status}): ${JSON.stringify(r2.json)}`);
    assert(!!cookieHeader, 'Login did not set auth cookie');
    console.log('✓ login');
  }

  // /me
  {
    const r = await http('GET', `${api}/auth/me`);
    assert(r.ok, `/me failed (${r.status}): ${JSON.stringify(r.json)}`);
    assert(r.json?.user?.email === testEmail, '/me returned unexpected user');
    console.log('✓ auth/me');
  }

  // Create product
  let productId;
  {
    const r = await http('POST', `${api}/products`, {
      name: `E2E Product ${Date.now()}`,
      brand: 'E2E',
      description: 'E2E test product',
      price: 1234.5,
      category: 'Bags',
      imageUrl: '/uploads/placeholder.jpg',
      inStock: true,
    });
    assert(r.ok, `Create product failed (${r.status}): ${JSON.stringify(r.json)}`);
    productId = r.json?.id;
    assert(productId, 'Create product did not return product id');
    console.log('✓ create product');
  }

  // Add to cart
  {
    const r = await http('POST', `${api}/cart`, {
      productId,
      quantity: 1,
      size: null,
    });
    assert(r.ok, `Add to cart failed (${r.status}): ${JSON.stringify(r.json)}`);
    console.log('✓ add to cart');
  }

  // Get cart
  let cartItems;
  {
    const r = await http('GET', `${api}/cart`);
    assert(r.ok, `Get cart failed (${r.status}): ${JSON.stringify(r.json)}`);
    cartItems = r.json?.cartItems;
    assert(Array.isArray(cartItems) && cartItems.length >= 1, 'Cart is empty after add');
    console.log('✓ get cart');
  }

  // Create order directly (mirrors what CheckoutSuccessPage does)
  {
    const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    const r = await http('POST', `${api}/orders`, {
      totalAmount,
      currency: 'kes',
      email: testEmail,
      items: cartItems.map((item) => ({
        productId: String(item.id),
        quantity: item.quantity,
        price: Number(item.price),
      })),
    });
    assert(r.ok, `Create order failed (${r.status}): ${JSON.stringify(r.json)}`);
    assert(typeof r.json?.id === 'number', 'Order id missing in response');
    console.log('✓ create order');
  }

  console.log('\nE2E smoke test: PASS');
}

main().catch((err) => {
  console.error('\nE2E smoke test: FAIL');
  console.error(err?.stack || err);
  process.exit(1);
});
