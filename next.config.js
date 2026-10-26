const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin();
const isProduction = process.env.NODE_ENV === "production";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"} https://challenges.cloudflare.com https://www.googletagmanager.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob: https://cdn.sanity.io https://*.tile.openstreetmap.org https://unpkg.com https://raw.githubusercontent.com https://cdnjs.cloudflare.com https://www.google-analytics.com https://stats.g.doubleclick.net https://www.google.com;
      media-src 'self';
      font-src 'self' data:;
      connect-src 'self' https://challenges.cloudflare.com https://*.upstash.io https://vitals.vercel-insights.com https://*.vercel-insights.com https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.google.com;
      frame-src https://challenges.cloudflare.com https://www.google.com https://maps.google.com https://www.youtube-nocookie.com https://www.youtube.com https://yandex.ru https://yandex.com https://*.yandex.ru https://*.yandex.net;
      worker-src 'self' blob:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'self';
      upgrade-insecure-requests;
    `
      .replace(/\s{2,}/g, " ")
      .trim(),
  },
];

const staticHtmlCacheHeaders = [
  {
    key: "Cache-Control",
    value: "public, s-maxage=300, stale-while-revalidate=600",
  },
];

const noIndexHeaders = [
  {
    key: "X-Robots-Tag",
    value: "noindex, nofollow",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 дней: CMS-картинки почти не меняются, URL при замене новый
    deviceSizes: [640, 828, 1080, 1920],
    imageSizes: [128, 256, 384],
    qualities: [75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
        pathname: "/images/**",
      },
      // thumbnails of YouTube videos in rich text (TheYoutubeEmbed)
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        port: "",
        pathname: "/vi/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        has: [
          {
            type: "host",
            value: "app.yashil-energiya.uz",
          },
        ],
        headers: noIndexHeaders,
      },
      {
        source: "/:lang(en|ru|uz)/ev-guide",
        headers: noIndexHeaders,
      },
      {
        source: "/",
        headers: staticHtmlCacheHeaders,
      },
      {
        source: "/:lang(en|ru|uz)",
        headers: staticHtmlCacheHeaders,
      },
      {
        source:
          "/:lang(en|ru|uz)/:section(about|ceo|contacts|solarpanels|microges|chargingstation|installation-request|plants|documents|news|articles|procurements|vacancies)",
        headers: staticHtmlCacheHeaders,
      },
      {
        source: "/:lang(en|ru|uz)/resources/calculator",
        headers: staticHtmlCacheHeaders,
      },
      {
        source: "/:lang(en|ru|uz)/chargingstation/public-offer",
        headers: staticHtmlCacheHeaders,
      },
      {
        source: "/:lang(en|ru|uz)/procurements/:sub(procurement1|procurement2)",
        headers: staticHtmlCacheHeaders,
      },
      {
        source:
          "/:lang(en|ru|uz)/:section(news|articles|plants|vacancies)/:slug*",
        headers: staticHtmlCacheHeaders,
      },
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // Not pdf/docx: tender documents get replaced under the same name.
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|mp4)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source:
          "/:lang(en|ru|uz)/news/35th-anniversary-of-the-state-independence-of-the-republic-of-uzbekistan",
        destination:
          "/:lang/news/happy-35th-anniversary-of-the-independence-of-the-republic-of-uzbekistan",
        statusCode: 301,
      },
      {
        source: "/sitemap.txt",
        destination: "/sitemap.xml",
        statusCode: 301,
      },
      {
        source: "/:lang(en|ru|uz)/jobs",
        destination: "/:lang/vacancies",
        statusCode: 301,
      },
      {
        source: "/jobs",
        destination: "/uz/vacancies",
        statusCode: 301,
      },
      // The regional branches page was removed; the company has no branches.
      {
        source: "/:lang(en|ru|uz)/branches",
        destination: "/:lang/contacts",
        statusCode: 301,
      },
      {
        source: "/:lang(en|ru|uz)/mhp",
        destination: "/:lang/microges",
        statusCode: 301,
      },
      {
        source: "/:lang(en|ru|uz)/ev",
        destination: "/:lang/chargingstation",
        statusCode: 301,
      },
      {
        source: "/:lang(en|ru|uz)/articles/page:page(\\d+)",
        destination: "/:lang/articles",
        statusCode: 301,
      },
      {
        source: "/:lang(en|ru|uz)/news/page:page(\\d+)",
        destination: "/:lang/news",
        statusCode: 301,
      },
      {
        source: "/articles/page:page(\\d+)",
        destination: "/uz/articles",
        statusCode: 301,
      },
      {
        source: "/news/page:page(\\d+)",
        destination: "/uz/news",
        statusCode: 301,
      },
      {
        source:
          "/news/global-south-utilities-tomonidan-ulushni-sotib-olish-boyicha-memorandum-imzolandi",
        destination: "/uz/news",
        statusCode: 301,
      },
      {
        source:
          "/news/yangi-toshkentda-elektromobillarni-tezkor-zaryadlash-stansiyasi-ishga-tushirildi",
        destination: "/uz/news",
        statusCode: 301,
      },
      {
        source:
          "/news/employees-of-yashil-energiya-llc-improve-their-skills",
        destination: "/uz/news",
        statusCode: 301,
      },
      {
        source:
          "/news/yashil-energiya-mchj-xodimlari-malakasini-oshirmoqda",
        destination: "/uz/news",
        statusCode: 301,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
