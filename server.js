const express = require('express');
const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { restResources } = require('@shopify/shopify-api/rest/admin/2023-04');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Shopify API configuration
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES.split(','),
  hostName: process.env.HOST.replace(/https:\/\//, ''),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  restResources,
});

app.use(cookieParser());
app.use(express.json());
app.use(express.static('public'));

// OAuth route
app.get('/auth', async (req, res) => {
  try {
    const authRoute = await shopify.auth.begin({
      shop: req.query.shop,
      callbackPath: '/auth/callback',
      isOnline: false,
      rawRequest: req,
      rawResponse: res,
    });
    
    res.redirect(authRoute);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).send('Authentication failed');
  }
});

// OAuth callback
app.get('/auth/callback', async (req, res) => {
  try {
    const callbackResponse = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    const { session } = callbackResponse;
    
    // Install script tag after successful auth
    await installScriptTag(session);
    
    res.redirect(`/?shop=${session.shop}&host=${req.query.host}`);
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).send('Callback failed');
  }
});

// Install script tag function
async function installScriptTag(session) {
  try {
    const client = new shopify.clients.Rest({ session });
    
    // Check if script tag already exists
    const existingScripts = await client.get({
      path: 'script_tags',
    });
    
    const bannerScriptExists = existingScripts.body.script_tags.some(
      script => script.src.includes('banner.js')
    );
    
    if (!bannerScriptExists) {
      await client.post({
        path: 'script_tags',
        data: {
          script_tag: {
            event: 'onload',
            src: `${process.env.HOST}/banner.js`
          }
        }
      });
      console.log('Banner script tag installed successfully');
    }
  } catch (error) {
    console.error('Error installing script tag:', error);
  }
}

// Main app route
app.get('/', (req, res) => {
  const shop = req.query.shop;
  if (!shop) {
    return res.status(400).send('Missing shop parameter');
  }
  
  // Add API key and host to URL for the frontend
  const redirectUrl = `/index.html?apiKey=${process.env.SHOPIFY_API_KEY}&host=${req.query.host}&shop=${shop}`;
  res.redirect(redirectUrl);
});

// Webhook for app uninstall
app.post('/webhooks/app/uninstalled', express.raw({ type: 'application/json' }), (req, res) => {
  console.log('App uninstalled');
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});