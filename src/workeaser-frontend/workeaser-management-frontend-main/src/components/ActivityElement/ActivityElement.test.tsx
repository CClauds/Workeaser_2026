import { theme } from "@styles/themes";
import { screen, render } from "@testing-library/react";
import { ReactNode } from "react";
import { ThemeProvider } from "styled-components";
import { ActivityElement } from "./";

interface ActivityElementProps {
  icon: ReactNode;
  title: string;
  text?: string;
  date?: string;
}

const props = {
  icon: <></>,
  title: "Some Title",
  text: "Some text",
  date: "2022-03-22",
};

const renderActivityElement = (children?: ReactNode) => {
  render(
    <ThemeProvider theme={theme}>
      <ActivityElement {...props}>{children}</ActivityElement>
    </ThemeProvider>
  );
};

describe("ActivityElement", () => {
  it("should render ActivityElement", () => {
    renderActivityElement();

    expect(screen.getByTestId("activity-element")).toBeInTheDocument();
  });

  it("should display proper content", () => {
    renderActivityElement();
    expect(screen.getByText(new RegExp(props.title, "i"))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(props.text, "i"))).toBeInTheDocument();
    // expect(screen.getByText(new RegExp(props.date, "i"))).toBeInTheDocument();
  });

  it("should display children", () => {
    renderActivityElement(
      <div>
        <p>CHILDREN</p>
      </div>
    );

    expect(screen.getByText(new RegExp("CHILDREN", "i"))).toBeInTheDocument();
  });
});
