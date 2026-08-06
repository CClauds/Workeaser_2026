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
