import type {
  NextConfig,
} from "next";

const isDev =
  process.env.NODE_ENV ===
  "development";

const contentSecurityPolicy = [
  "default-src 'self'",

  [
    "script-src 'self' 'unsafe-inline'",
    isDev
      ? "'unsafe-eval'"
      : "",
  ]
    .filter(Boolean)
    .join(" "),

  "style-src 'self' 'unsafe-inline'",

  "img-src 'self' blob: data:",

  "font-src 'self' data:",

  [
    "connect-src 'self'",
    isDev
      ? "ws: wss:"
      : "",
  ]
    .filter(Boolean)
    .join(" "),

  "object-src 'none'",

  "base-uri 'self'",

  "form-action 'self'",

  "frame-ancestors 'none'",

  "manifest-src 'self'",

  "worker-src 'self' blob:",

  ...(isDev
    ? []
    : [
        "upgrade-insecure-requests",
      ]),
]
  .join("; ")
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  {
    key:
      "Content-Security-Policy",

    value:
      contentSecurityPolicy,
  },

  {
    key:
      "X-Content-Type-Options",

    value:
      "nosniff",
  },

  {
    key:
      "X-Frame-Options",

    value:
      "DENY",
  },

  {
    key:
      "Referrer-Policy",

    value:
      "strict-origin-when-cross-origin",
  },

  {
    key:
      "Permissions-Policy",

    value:
      [
        "camera=()",
        "microphone=()",
        "geolocation=()",
        "payment=()",
        "usb=()",
      ].join(", "),
  },

  {
    key:
      "Strict-Transport-Security",

    value:
      [
        "max-age=63072000",
        "includeSubDomains",
        "preload",
      ].join("; "),
  },

  {
    key:
      "X-DNS-Prefetch-Control",

    value:
      "off",
  },

  {
    key:
      "X-Permitted-Cross-Domain-Policies",

    value:
      "none",
  },

  {
    key:
      "Cross-Origin-Opener-Policy",

    value:
      "same-origin",
  },
];

const adminRobotsHeaders = [
  {
    key: "X-Robots-Tag",
    value: "noindex, nofollow, noarchive",
  },
];

const nextConfig:
  NextConfig = {

  async headers() {
      return [
        {
          source: "/(.*)",
          headers: securityHeaders,
        },

        {
          source: "/admin/:path*",
          headers: adminRobotsHeaders,
        },
      ];
  },
};

export default nextConfig;