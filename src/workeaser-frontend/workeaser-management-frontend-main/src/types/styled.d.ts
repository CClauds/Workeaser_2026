import "styled-components";
import theme from "../styles/themes";
// and extend them!
declare module "styled-components" {
  type Theme = typeof theme;
  export interface DefaultTheme extends Theme {
    colors: {
      white: string;
      lightGray: string;
      darkGray: string;
      darkerGray: string;

      gray200: string;
      gray300: string;

      blue100: string;
      blue200: string;
      blue300: string;
      blue400: string;
      blue500: string;
      blue600: string;
      blue700: string;
      blue800: string;

      red300: string;
      red500: string;

      orange500: string;

      green200: string;
      green500: string;
      green550: string;
      green600: string;

      yellow400: string;
      yellow500: string;

      tableBackgroundRed: string;
      tableBackgroundYellow: string;
      tableBackgroundGreen: string;
      tableBackgroundGray: string;
      tableBackgroundBlue: string;

      notifySuccess: string;
      notifyFail: string;

      chartGreen: string;
      chartYellow: string;
      chartOrange: string;
      chartBlue: string;
      chartRed: string;

      themeGray100: string;
      themeGray200: string;
      themeGray300: string;
      themeGray400: string;
      themeGray500: string;
      themeGray600: string;
      themeGray700: string;
      themeGray800: string;

      themePurple100: string;
      themePurple200: string;
      themePurple300: string;
      themePurple400: string;
      themePurple500: string;
      themePurple600: string;
      themePurple700: string;
      themePurple800: string;

      themeBlue100: string;
      themeBlue200: string;
      themeBlue300: string;
      themeBlue400: string;
      themeBlue500: string;
      themeBlue600: string;
      themeBlue700: string;
      themeBlue800: string;

      themeGreen100: string;
      themeGreen200: string;
      themeGreen300: string;
      themeGreen400: string;
      themeGreen500: string;
      themeGreen600: string;
      themeGreen700: string;
      themeGreen800: string;

      themeYellow100: string;
      themeYellow200: string;
      themeYellow300: string;
      themeYellow400: string;
      themeYellow500: string;
      themeYellow600: string;
      themeYellow700: string;
      themeYellow800: string;

      themeRed100: string;
      themeRed200: string;
      themeRed300: string;
      themeRed400: string;
      themeRed500: string;
      themeRed600: string;
      themeRed700: string;
      themeRed800: string;

      themeOrange100: string;
      themeOrange200: string;
      themeOrange300: string;
      themeOrange400: string;
      themeOrange500: string;
      themeOrange600: string;
      themeOrange700: string;
      themeOrange800: string;
    };
    fonts: {
      book: number;
      regular: number;
      semibold: number;
      semibolder: number;
      bold: number;
      black: number;
    };
    breakpoints: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    media: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      mobile: string;
      tablet: string;
      desktop: string;
    };
  }
}
