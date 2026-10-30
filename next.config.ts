import type { NextConfig } from "next";

/**
 * 安全响应头与 AI Agent 发现头。
 * 站点无鉴权、无用户数据存储，核心诉求是防点击劫持、防 MIME 嗅探、限制 referrer 泄露
 * （本页会把剂量数据放进 Google Calendar 的 URL query，Referrer-Policy 必须收紧）。
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Link",
    value: '</llms.txt>; rel="alternate"; type="text/markdown", </auth.md>; rel="service-doc"',
  },
];

/**
 * 静态导出模式（NEXT_OUTPUT=export）：
 * 用于 Cloudflare Pages 部署。output:'export' 不支持 headers()，
 * 安全头改由 public/_headers 承接（Cloudflare Pages 原生读取该文件）。
 */
const isExport = true;

const nextConfig: NextConfig = {
  // 开发期通过 localtunnel 等公网隧道远程访问时，放行其 Origin，
  // 否则 dev server 的跨源保护会拦截 HMR/JS 资源 → 页面无水合、按钮全部失效。
  // 子域名在隧道重连后会变，故用通配符覆盖整个 loca.lt。
  allowedDevOrigins: ['*.loca.lt'],
  // Tailwind v4 必须显式接入 Turbopack loader，否则 @theme / @utility 等 at-rule
  // 会被内置 PostCSS 判为 unknown，工具类全部失效（页面完全没样式）
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

if (isExport) {
  // cacheComponents 隐含 PPR，而 PPR 与 output:'export' 不兼容；
  // 站点全部路由本就是纯静态预渲染，导出模式关闭不影响产物
  nextConfig.cacheComponents = false;
  nextConfig.partialPrefetching = false;
  nextConfig.output = "export";
} else {
  nextConfig.cacheComponents = true;
  nextConfig.partialPrefetching = true;
  nextConfig.headers = async () => [
    { source: "/:path*", headers: securityHeaders },
  ];
}

export default nextConfig;
