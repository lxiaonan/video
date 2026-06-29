# Seedance Video Console

Static GitHub Pages app for generating video from start/end frames and a prompt.

Open the page, enter an OpenAI-compatible API base URL and API key, check available models, then generate and save videos locally in the browser.

## Why a proxy is needed

GitHub Pages is a static site. Browsers block requests with `Authorization` headers unless the API answers the CORS preflight request. `https://ai.silkroadai.io` does not currently allow the required preflight for `/v1/video/generations`, so the page needs a tiny CORS proxy.

## Deploy the Cloudflare Worker proxy

```bash
npm install -g wrangler
npx wrangler deploy
```

After deployment, copy the Worker URL into the page's "代理地址" field, for example:

```text
https://seedance-video-proxy.<your-subdomain>.workers.dev
```

Then click "检查模型".

