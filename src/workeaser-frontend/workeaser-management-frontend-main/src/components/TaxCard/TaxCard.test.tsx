import { theme } from "@styles/themes";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "styled-components";
import { TaxCard } from "./";
import Money from "dinero.js";

interface Tax {
  id: number;
  cowork_account_id: number;
  name: string;
  type: string;
  method: string;
  value: number;
  recurring_type: string;
}

const TAX: Tax = {
  id: 6,
  cowork_account_id: 2,
  name: "Federal tax",
  type: "FEDERAL_TAX",
  method: "PERCENTAGE",
  value: 3,
  recurring_type: "CREATED",
};
const TAX2: Tax = {
  id: 10,
  cowork_account_id: 1,
  name: "Cleaning Fee",
  type: "COMPANY_FEE",
  method: "FIXED",
  value: 100,
  recurring_type: "CREATED",
};

const onDelete = jest.fn();

const renderTaxCard = (tax: Tax) => {
  render(
    <ThemeProvider theme={theme}>
      <TaxCard tax={tax} onDelete={onDelete} />
    </ThemeProvider>
  );
};

describe("TaxCard", () => {
  it("should render Component with tax name", () => {
    renderTaxCard(TAX);

    const name = screen.getByRole("heading", {
      name: TAX.name,
    });

    expect(name).toBeInTheDocument();
  });

  it("should render formmated tax, method: PERCENTAGE", () => {
    renderTaxCard(TAX);

    const taxValue = screen.getByTestId("tax-value");

    expect(taxValue).toBeInTheDocument();
    expect(taxValue.textContent).toBe("0.03%");
  });

  it("should render formmated tax, method: FIXED", () => {
    renderTaxCard(TAX2);

    const taxValue = screen.getByTestId("tax-value");

    expect(taxValue).toBeInTheDocument();
    expect(taxValue.textContent).toBe("$1.00");
  });

  it("should call onDelete when button gets clicked", () => {
    renderTaxCard(TAX);

    const deleteButton = screen.getByRole("button");
    userEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(TAX.id);
  });
});
