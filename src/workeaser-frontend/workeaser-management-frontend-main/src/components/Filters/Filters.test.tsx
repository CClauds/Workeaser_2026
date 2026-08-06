import { screen, render } from "@testing-library/react";
import { Filters } from "./";

describe("Filters", () => {
  it("should render Filters", () => {
    render(<Filters />);

    expect(screen.getByTestId("filter")).toBeInTheDocument();
  });
});
