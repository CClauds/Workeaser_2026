import { Button } from "@components/Button";
import { HiddenInput } from "@components/Form/HiddenInput";
import { Textarea } from "@components/Form/Textarea";
import { Icomoon } from "@components/Icomoon";
import { ActiveIcon } from "@components/Icons/ActiveIcon";
import { TaxModal } from "@components/Modals/TaxModal";
import { EditableCell } from "@components/Table/Cell/EditableCell";
import { StyledTable } from "@components/Table/StyledTable";
import { PricesModals } from "@features/Modals/PricesModals";
import { toLocalIsoDate } from "@utils/helpers";
import Money from "dinero.js";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Row as RowType } from "react-table";
import { ThemeContext } from "styled-components";
import { Fee, ServiceTax } from "types/cowork";
import { TaxData } from "types/cowork/financial/taxes";
import { v4 as uuid } from "uuid";
import { TableFooter, TableFooterSection, TablePriceContainer } from "./styles";

interface TableCellData {
  id: string;
  date: string;
  name: string;
  description: string;
  quantity: string;
  unit_price: string;
  total: number;
  taxable: boolean;
  deleteId?: string;
  taxes: ItemTax[];
  initialInvoiceAmount?: boolean;
  resource_id: number;
  service_type: string;
}
export interface ItemTax {
  id?: number;
  name: string;
  value: number;
  type: string;
  method: string;
  recurring_type: string;
}
interface inititalTableDate extends Fee {
  date?: string;
  quantity?: string;
  unit_price?: string;
  taxes?: ItemTax[];
  resource_id?: number;
  service_type?: string;
}
export interface SugestionOption {
  //id: number;
  name: string;
  description: string;
  price:
    | number
    | {
        monthly_price: number;
        full_price: number;
        duration: string;
      }[];
  taxes: ServiceTax[];
  index?: number;
  resource_id: number;
  service_type: string;
}
interface ServiceTableFormBlockProps {
  hideActionsButtons?: boolean;
  initialData?: inititalTableDate[];
  servicesOptions?: SugestionOption[];
  hiddenColumns?: string[];
}
export const ServiceTableFormBlock: React.FC<ServiceTableFormBlockProps> = ({
  initialData,
  servicesOptions,
  hideActionsButtons = false,
  hiddenColumns = [],
}) => {
  const themeContext = useContext(ThemeContext);

  const [data, setData] = useState<TableCellData[]>([INITIAL_STATE]);
  const [currentRow, setCurrentRow] = useState<TableCellData>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [currentOption, setCurrentOption] = useState<SugestionOption>();

  const subtotalAmount = calculateSubtotalAmount(data);
  const taxesAmount = calculateTotalTaxesAmount(data);
  const totalAmount = subtotalAmount + taxesAmount;

  let conlumnsWidth = [4, 14, 22, 27, 6, 10, 10, 4, 3];

  if (hiddenColumns?.length > 0) {
    conlumnsWidth = [4, 14, 22, 29, 12, 12, 4, 3];
  }

  useEffect(() => {
    if (initialData) {
      setData(
        initialData.map((datum) => ({
          ...INITIAL_STATE,
          ...datum,
          id: uuid(),
          deleteId: uuid(),
          quantity: datum.quantity ?? "1",
          unit_price: datum.unit_price ?? datum.amount,
          total: calculateRowTotalPrice(parseInt(datum.amount), datum.taxes),
          taxes: datum?.taxes ?? [],
          resource_id: datum.resource_id,
          service_type: datum.service_type,
        }))
      );
      return;
    }
    setData([INITIAL_STATE]);
  }, [initialData]);

  const handleAddService = () => {
    setData((oldData) => [
      ...oldData,
      {
        ...INITIAL_STATE,
        id: uuid(),
        deleteId: uuid(),
      },
    ]);
  };

  const handleCleanTable = () => {
    setData([INITIAL_STATE]);
  };

  const columns = useMemo(() => {
    const handleDeleteRow = ({ index: rowIndex }: RowType) => {
      // if (data.length > 1) {
      const newData = [...data];
      newData.splice(rowIndex, 1);
      setData(newData);
      // }
    };

    const handleTaxModal = (values: TableCellData) => {
      setCurrentRow(values);
      setIsModalOpen(true);
    };

    return [
      {
        Header: "#",
        accessor: "id",
        Cell: ({ row: { index } }) => index,
      },
      {
        Header: "Date",
        accessor: "date",
        type: "date",
        name: "items",
      },
      {
        Header: "Product/Service",
        accessor: "name",
        type: "text",
        name: "items",
        inputOptions: servicesOptions?.map((option) => ({
          value: option.name,
          label: option.name,
        })),
      },
      {
        Header: "Service Description",
        accessor: "description",
        name: "items",
        type: "text",
        // Cell: ({ column, row, value }) => (
        //   <EditableCell
        //     value={value}
        //     column={column}
        //     row={row}
        //     updateMyData={updateMyData}
        //   />
        // ),
      },
      {
        Header: "Quantity",
        accessor: "quantity",
        type: "number",
        name: "items",
      },
      {
        Header: "Unit Price",
        accessor: "unit_price",
        name: "items",
        type: "currency",
        // Cell: ({ column, row, value }) => (
        //   <EditableCell
        //     value={value}
        //     column={column}
        //     row={row}
        //     // updateMyData={updateMyData}
        //     onExternalChange={onChange}
        //   />
        // ),
      },
      {
        Header: "Total Amount",
        accessor: "total",
        name: "items",
        Cell: ({ column, row, value }) => (
          <EditableCell
            value={Money({ amount: parseInt(value) }).toFormat("$0,0.00")}
            column={column}
            row={row}
          />
        ),
      },
      {
        Header: "Taxable",
        accessor: "taxable",
        className: "align__center",
        Cell: ({ row: { values } }: { row: { values: TableCellData } }) => (
          <ActiveIcon
            isActive={values?.taxes?.length > 0}
            onClick={() => handleTaxModal(values)}
          />
        ),
      },
      {
        Header: "",
        accessor: "deleteId",
        className: "align__center",
        Cell: ({ row }) => (
          <Icomoon
            iconName="trash"
            color={themeContext.colors.blue800}
            onClick={() => handleDeleteRow(row)}
          />
        ),
      },
      {
        Header: "",
        accessor: "taxes",
      },
    ];
  }, [data, servicesOptions, themeContext.colors.blue800]);

  const handlePriceClick = (rowIndex: number, value: number) => {
    setData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          const total = parseInt(row.quantity) * value;
          return {
            ...old[rowIndex],
            total: calculateRowTotalPrice(total, row.taxes),
            unit_price: String(value),
          };
        }
        return row;
      })
    );
  };

  const updateMyData = (rowIndex: number, columnId: string, value: string) => {
    let description = "";
    let price = 0;
    let taxes = [];
    let selectedService;

    if (columnId === "name" && servicesOptions?.length && value) {
      selectedService = servicesOptions.find((option) => option.name === value);
      description = selectedService?.description;
      taxes = selectedService?.taxes;

      if (Array.isArray(selectedService?.price)) {
        setCurrentOption({ ...selectedService, index: rowIndex });
        setIsPriceModalOpen(true);
      } else {
        price = selectedService?.price;
      }
    }

    setData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          const actualPrice = price > 0 ? String(price) : row.unit_price;
          let total = row.total;
          if (columnId === "quantity") {
            total = parseInt(value) * parseInt(row.unit_price);
          }
          if (columnId === "unit_price") {
            total = parseInt(row.quantity) * parseInt(value);
          }
          if (columnId === "name") {
            total = parseInt(row.quantity) * parseInt(actualPrice);
          }

          return {
            ...old[rowIndex],
            total: calculateRowTotalPrice(total, row.taxes),
            description: !!description?.length ? description : row.description,
            unit_price: actualPrice,
            taxes: !!taxes?.length ? taxes : row.taxes,
            [columnId]: value,
            resource_id: selectedService?.resource_id,
            service_type: selectedService?.service_type,
          };
        }
        return row;
      })
    );
  };

  const updateRowTaxes = (taxes: TaxData[]) => {
    setData(
      data.map((datum) =>
        datum.id === currentRow.id
          ? {
              ...datum,
              total: calculateRowTotalPrice(
                parseInt(datum.quantity) * parseInt(datum.unit_price),
                taxes
              ),
              taxes,
            }
          : datum
      )
    );
  };

  const RenderHiddenInputs = () => {
    const findIndex = data.findIndex((datum) => datum.initialInvoiceAmount);
    if (findIndex >= 0) {
      return (
        <HiddenInput
          name={`items[${findIndex}].initialInvoiceAmount`}
          value="1"
        />
      );
    }
    return null;
  };

  return (
    <>
      <StyledTable
        columns={columns}
        data={data}
        columnsWidth={conlumnsWidth}
        updateMyData={updateMyData}
        hiddenColumns={[
          "taxes",
          "resource_id",
          "service_type",
          ...hiddenColumns,
        ]}
        editable
      />

      <RenderHiddenInputs />

      {data.map((datum, index) =>
        datum.taxes?.map((tax, taxIndex) =>
          Object.entries(tax).map(([key, value]) => (
            <HiddenInput
              key={`${datum.id}-${key}-${value}`}
              name={`items[${index}].taxes[${taxIndex}].${key}`}
              value={value || ""}
            />
          ))
        )
      )}

      {data.map((datum, index) => (
        <HiddenInput
          key={index}
          name={`items[${index}].resource_id`}
          value={datum.resource_id || 1}
        />
      ))}

      {data.map((datum, index) => (
        <HiddenInput
          key={index}
          name={`items[${index}].service_type`}
          value={datum.service_type || ""}
        />
      ))}

      <TableFooter>
        <TableFooterSection>
          {!hideActionsButtons && (
            <>
              <Button
                text="Add Line"
                type="button"
                color="primary"
                onClick={handleAddService}
              />
              <Button
                text="Clean Table"
                type="button"
                color="secondary"
                onClick={handleCleanTable}
              />
            </>
          )}
        </TableFooterSection>

        <TableFooterSection>
          <Textarea
            name="additional_notes"
            placeholder="Aditional Note"
            width={275}
            height={80}
          />

          <div>
            <TablePriceContainer>
              <p>Subtotal:</p>
              <span>
                {Money({ amount: subtotalAmount }).toFormat("$0,0.00")}
              </span>
            </TablePriceContainer>
            <TablePriceContainer>
              <p>Taxes &amp; Fees:</p>
              <span>{Money({ amount: taxesAmount }).toFormat("$0,0.00")}</span>
            </TablePriceContainer>

            <TablePriceContainer>
              <p>Total:</p>
              <span>{Money({ amount: totalAmount }).toFormat("$0,0.00")}</span>
            </TablePriceContainer>
          </div>
        </TableFooterSection>
      </TableFooter>

      <TaxModal
        isOpen={isModalOpen}
        service={currentRow}
        onAddTaxes={updateRowTaxes}
        onRequestClose={() => setIsModalOpen(false)}
      />

      <PricesModals
        isOpen={isPriceModalOpen}
        onRequestClose={() => setIsPriceModalOpen(false)}
        option={currentOption}
        onPriceClick={handlePriceClick}
      />
    </>
  );
};

const calculateRowTotalPrice = (
  baseTotal: number,
  taxes: TaxData[]
): number => {
  if (!taxes?.length) {
    return baseTotal;
  }
  return taxes.reduce(
    (totalValue, tax) =>
      tax.method === "FIXED"
        ? totalValue + tax.value
        : totalValue +
          Money({ amount: baseTotal })
            .percentage(tax.value / 100)
            .getAmount(),
    baseTotal
  );
};
const calculateSubtotalAmount = (data: TableCellData[]): number => {
  if (!data.length) {
    return 0;
  }
  return data.reduce(
    (acc, item) => acc + parseInt(item.quantity) * parseInt(item.unit_price),
    0
  );
};
const calculateTotalTaxesAmount = (data: TableCellData[]): number => {
  if (!data.length) {
    return 0;
  }

  return data.reduce(
    (acc, item) =>
      item?.taxes
        ? acc +
          item?.taxes?.reduce(
            (taxAcc, tax) =>
              tax.method === "FIXED"
                ? taxAcc + tax.value
                : taxAcc +
                  Money({
                    amount: parseInt(item.quantity) * parseInt(item.unit_price),
                  })
                    .percentage(tax.value / 100)
                    .getAmount(),
            0
          )
        : acc,
    0
  );
};

const INITIAL_STATE = {
  id: uuid(),
  date: toLocalIsoDate(new Date()),
  name: "",
  description: "",
  quantity: "1",
  unit_price: "0",
  total: 0,
  taxable: false,
  deleteId: uuid(),
  taxes: [],
  resource_id: 0,
  service_type: "",
};
