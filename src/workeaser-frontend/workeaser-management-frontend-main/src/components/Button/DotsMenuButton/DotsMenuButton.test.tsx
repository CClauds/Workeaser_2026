import { theme } from "@styles/themes";
import { screen, render } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { DotsMenuButton } from "./";

const renderDotsMenuButton = () => {
  render(
    <ThemeProvider theme={theme}>
      <DotsMenuButton text="Accept" icon="" />
    </ThemeProvider>
  );
};

describe("DotsMenuButton", () => {
  it("should render DotsMenuButton", () => {
    renderDotsMenuButton();

    expect(screen.getByTestId("dots-menu-button")).toBeInTheDocument();
  });
});
