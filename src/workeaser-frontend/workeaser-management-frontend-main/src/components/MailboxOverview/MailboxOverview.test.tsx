import { render, screen } from "@testing-library/react";
import { MailboxOverview } from ".";
import { theme } from "../../styles/themes";
import { ThemeProvider } from "styled-components";
import "jest-styled-components";

describe("MailboxOverview", () => {
  it("should render title passed in the Component as props", () => {
    render(
      <ThemeProvider theme={theme}>
        <MailboxOverview
          title="Some title"
          pickingUp={0}
          hold={0}
          forward={0}
          trash={0}
        />
      </ThemeProvider>
    );

    const title = screen.getByRole("heading", {
      name: /Some title/i,
    });

    expect(title).toBeInTheDocument();
  });

  it("should render values with correct color", () => {
    render(
      <ThemeProvider theme={theme}>
        <MailboxOverview
          title="Some title"
          pickingUp={0}
          hold={0}
          forward={0}
          trash={0}
        />
      </ThemeProvider>
    );

    const pickingUpSpan = screen.getByTestId("pickingUp");
    expect(pickingUpSpan).toHaveStyleRule("color", "#90be6d");
    const holdAtLocationpan = screen.getByTestId("holdAtLocation");
    expect(holdAtLocationpan).toHaveStyleRule("color", "#f94144");
    const forwardItSpan = screen.getByTestId("forwardIt");
    expect(forwardItSpan).toHaveStyleRule("color", "#f9c74f");
    const trashItSpan = screen.getByTestId("trashIt");
    expect(trashItSpan).toHaveStyleRule("color", "#277DA1");
  });
});
