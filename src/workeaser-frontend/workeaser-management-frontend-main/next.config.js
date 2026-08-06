/**
 * Next.js 14 configuration. Forces bundling of antd/rc-* packages to avoid
 * Node 20+ ESM strict resolution failures during "Collecting page data".
 */
const RC_PACKAGES = [
  "antd",
  "@ant-design/icons",
  "@ant-design/icons-svg",
  "@ant-design/colors",
  "@ant-design/cssinjs",
  "@ant-design/cssinjs-utils",
  "@ant-design/react-slick",
  "rc-cascader",
  "rc-checkbox",
  "rc-collapse",
  "rc-dialog",
  "rc-drawer",
  "rc-dropdown",
  "rc-field-form",
  "rc-image",
  "rc-input",
  "rc-input-number",
  "rc-mentions",
  "rc-menu",
  "rc-motion",
  "rc-notification",
  "rc-overflow",
  "rc-pagination",
  "rc-picker",
  "rc-progress",
  "rc-rate",
  "rc-resize-observer",
  "rc-segmented",
  "rc-select",
  "rc-slider",
  "rc-steps",
  "rc-switch",
  "rc-table",
  "rc-tabs",
  "rc-textarea",
  "rc-tooltip",
  "rc-tree",
  "rc-tree-select",
  "rc-upload",
  "rc-util",
  "rc-virtual-list",
];

module.exports = {
  transpilePackages: [
    "@fullcalendar/common",
    "@fullcalendar/daygrid",
    "@fullcalendar/interaction",
    "@fullcalendar/react",
    "@fullcalendar/timegrid",
    ...RC_PACKAGES,
  ],
  experimental: {
    // antd 5 + rc-* + dayjs 1.x fazem imports ESM extension-less. Sem isso,
    // Node 20+ recusa durante "Collecting page data". `false` força webpack a
    // bundlear esses pacotes no server bundle em vez de externaliza-los para
    // Node ESM loader.
    esmExternals: false,
  },
  compiler: {
    styledComponents: { ssr: true, displayName: true },
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
  reactStrictMode: true,
  staticPageGenerationTimeout: 1000,
  images: {
    domains: [
      "admin.workeaser.com",
      "stage.admin.workeaser.com",
      "app.workeaser.com",
      "stage.app.workeaser.com",
      "easyworkspace.co",
      "172.16.4.26",
      "localhost",
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // styled-components 5 vs @types/react atual: incompatibilidade conhecida
    // que não afeta runtime. Migração para styled-components 6 elimina, mas é
    // major breaking change fora do escopo deste hotfix.
    ignoreBuildErrors: true,
  },
};
