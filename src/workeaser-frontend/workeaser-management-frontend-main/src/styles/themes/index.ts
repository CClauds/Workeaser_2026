export const theme = {
  colors: {
    white: "#fff",

    lightGray: "#f7f9fb",
    darkGray: "#ecf1f6",
    darkerGray: "#707070",

    gray200: "#dbe6f0",
    gray300: "#ced9e6",

    blue100: "#02a2dd",
    blue200: "#2491c9",
    blue300: "#3080b5",
    blue400: "#356fa0",
    blue500: "#365f8c",
    blue600: "#355077",
    blue700: "#314263",
    blue800: "#2b3450",

    red300: "#dc1237",
    red500: "#af0000",

    orange500: "#f4642d",

    green200: "#2DC9A5",
    green500: "#33c533",
    green550: "#00b500",
    green600: "#0daf00",

    yellow400: "#efca2f",
    yellow500: "#efca00",

    tableBackgroundRed: "#fcdacd",
    tableBackgroundYellow: "#fcf6d8",
    tableBackgroundGreen: "#d8f3d8",
    tableBackgroundGray: "#ecf1f6",
    tableBackgroundBlue: "#d9f1fa",

    notifySuccess: "#92cf65",
    notifyFail: "#f14b5c",

    chartGreen: "#90be6d",
    chartYellow: "#f9c74f",
    chartOrange: "#F3722C",
    chartBlue: "#277DA1",
    chartRed: "#f94144",

    themeGray100: "#E8EAF0",
    themeGray200: "#D0D6DE",
    themeGray300: "#ADB6C3",
    themeGray400: "#8A97A8",
    themeGray500: "#6E7B91",
    themeGray600: "#535F7C",
    themeGray700: "#42486E",
    themeGray800: "#31335A",

    themePurple100: "#CCEEFD",
    themePurple200: "#A9DBFB",
    themePurple300: "#91BAF8",
    themePurple400: "#7B96F1",
    themePurple500: "#6774DD",
    themePurple600: "#555DB9",
    themePurple700: "#434887",
    themePurple800: "#31335A",

    themeBlue100: "#C5FCFE",
    themeBlue200: "#A5EDFA",
    themeBlue300: "#82D3F5",
    themeBlue400: "#61B1E3",
    themeBlue500: "#4E97CE",
    themeBlue600: "#3A7AB2",
    themeBlue700: "#275B94",
    themeBlue800: "#194275",

    themeGreen100: "#DCF8D2",
    themeGreen200: "#BCEEBB",
    themeGreen300: "#91E1A9",
    themeGreen400: "#6BCB93",
    themeGreen500: "#56B082",
    themeGreen600: "#449473",
    themeGreen700: "#327162",
    themeGreen800: "#22534F",

    themeYellow100: "#FBF3BA",
    themeYellow200: "#FAE892",
    themeYellow300: "#F6D779",
    themeYellow400: "#EDBF69",
    themeYellow500: "#DAA159",
    themeYellow600: "#C47F47",
    themeYellow700: "#AA5A36",
    themeYellow800: "#933C28",

    themeRed100: "#FBE7CE",
    themeRed200: "#F8CEAA",
    themeRed300: "#F3A582",
    themeRed400: "#EA7C61",
    themeRed500: "#D36257",
    themeRed600: "#B4474E",
    themeRed700: "#912D47",
    themeRed800: "#721C3E",

    themeOrange100: "#FBEEC4",
    themeOrange200: "#F7DA9C",
    themeOrange300: "#F4BE7E",
    themeOrange400: "#EB9E66",
    themeOrange500: "#D68056",
    themeOrange600: "#BC6249",
    themeOrange700: "#9E433C",
    themeOrange800: "#822A31",
  },

  fonts: {
    book: 300,
    regular: 400,
    semibold: 500,
    semibolder: 600,
    bold: 700,
    black: 900,
  },

  breakpoints: {
    xs: "360px",
    sm: "576px",
    md: "768px",
    lg: "992px",
    xl: "1200px",
    xxl: "1440px",
  },

  media: {
    xs: "@media (max-width: 360px)",
    sm: "@media (max-width: 576px)",
    md: "@media (max-width: 768px)",
    lg: "@media (max-width: 992px)",
    xl: "@media (max-width: 1200px)",
    mobile: "@media (max-width: 768px)",
    tablet: "@media (max-width: 992px)",
    desktop: "@media (min-width: 993px)",
  },
};

export type AppTheme = typeof theme;
