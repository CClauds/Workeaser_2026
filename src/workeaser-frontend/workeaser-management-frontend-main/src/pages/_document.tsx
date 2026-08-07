import React from "react";
// eslint-disable-next-line @next/next/no-document-import-in-page
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from "next/document";
import { ServerStyleSheet } from "styled-components";

export default class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          // eslint-disable-next-line react/display-name
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />

          <meta charSet="UTF-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="author" content="Fernando Lopes" />
          <meta name="keywords" content="cowork" />
          <meta name="description" content="Coworking system" />

          <meta property="og:url" content="http://app.workeaser.com/" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Workeaser" />
          <meta
            property="og:description"
            content="Coworking management system"
          />
          <meta
            property="og:image"
            content="http://app.workeaser.com/images/workeaser-circle.png"
          />
          <meta property="og:image:alt" content="workeaser logo" />
          <meta property="og:image:type" content="image/png" />
          <meta property="og:image:width" content="100" />
          <meta property="og:image:height" content="100" />
          <meta property="og:locale" content="en_US" />

          <meta name="twitter:card" content="summary_large_image" />
          <meta property="twitter:domain" content="app.workeaser.com" />
          <meta property="twitter:url" content="https://app.workeaser.com/" />
          <meta name="twitter:title" content="Workeaser" />
          <meta
            name="twitter:description"
            content="Coworking management system"
          />
          <meta
            name="twitter:image"
            content="https://app.workeaser.com/images/workeaser-circle.png"
          />

          {/* B3: Material Symbols icon font */}
          <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
          {/* B3: Tailwind CDN with exact DESIGN.md tokens (staging — replace with build setup in cleanup) */}
          <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
          <script dangerouslySetInnerHTML={{ __html: `tailwind.config={darkMode:"class",theme:{extend:{colors:{"on-error-container":"#93000a",background:"#F8FAFC","on-primary-fixed":"#2B3450","error-container":"#ffdad6","on-primary":"#ffffff","inverse-surface":"#2B3450",primary:"#00A2DD","on-surface-variant":"#3e484f","surface-bright":"#f5faff","on-background":"#171c20","on-secondary-container":"#555e7c",tertiary:"#8d4f00","primary-container":"#00A2DD",outline:"#6e7880","surface-container":"#eaeef3","surface-container-high":"#e4e9ee","on-secondary-fixed":"#2B3450","on-primary-container":"#00344a","on-primary-fixed-variant":"#004c6a",success:"#10B981","surface-container-lowest":"#ffffff",surface:"#FFFFFF","on-secondary":"#ffffff","surface-variant":"#dee3e8","on-surface":"#171c20","inverse-on-surface":"#edf1f6","on-tertiary-fixed-variant":"#6b3b00","tertiary-fixed-dim":"#ffb875","surface-container-highest":"#dee3e8",error:"#EF4444","surface-dim":"#d6dadf","on-error":"#ffffff","outline-variant":"#bdc8d1","primary-fixed-dim":"#80d0ff","on-tertiary-fixed":"#2d1600","on-secondary-fixed-variant":"#3d4663","surface-container-low":"#f0f4f9","tertiary-container":"#da8320",warning:"#F59E0B","inverse-primary":"#80d0ff","primary-fixed":"#c5e7ff","secondary-fixed":"#dbe1ff","secondary-fixed-dim":"#bdc5e8",border:"#E2E8F0","on-tertiary-container":"#4b2700","surface-tint":"#00A2DD","tertiary-fixed":"#ffdcc0","secondary-container":"#d0d9fd",secondary:"#545d7c","on-tertiary":"#ffffff",info:"#3B82F6"},fontFamily:{"body-md":["Laca","Be Vietnam Pro"],"headline-md":["Laca","Be Vietnam Pro"],"label-sm":["Laca","Be Vietnam Pro"],"headline-lg":["Laca","Be Vietnam Pro"],"label-md":["Laca","Be Vietnam Pro"]}}}}` }} />
          <link href="https://use.typekit.net/kso2zvn.css" rel="stylesheet" />
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
