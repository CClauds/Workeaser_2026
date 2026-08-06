import { Icomoon } from "@components/Icomoon";
import { useDebounce } from "hooks/useDebounce";
import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import type { Row as RowType } from "react-table";
import {
  useGlobalFilter,
  usePagination,
  useTable,
  useSortBy,
} from "react-table";
import { EditableCell } from "../Cell/EditableCell";
import { Container, Pagination } from "./styles";

interface StyledTableProps {
  columns: any;
  data: any;
  columnsWidth?: number[];
  loading?: boolean;
  bordered?: boolean;
  filterValue?: string;
  editable?: boolean;
  skipPageReset?: boolean;
  theme?: string;
  className?: string;
  pageCount?: number;
  fetchData?: (pageIndex: number, pageSize: number) => void;
  hiddenColumns?: string[];
  updateMyData?: (rowIndex: number, columnId: string, value: string) => void;
}

export const StyledTable: React.FC<StyledTableProps> = ({
  columns,
  data,
  columnsWidth,
  loading,
  bordered,
  filterValue,
  editable,
  skipPageReset,
  theme,
  className,
  pageCount: controlledPageCount,
  fetchData,
  hiddenColumns = [],
  updateMyData,
}) => {
  const defaultColumn = {
    Cell: editable ? EditableCell : ({ value }) => String(value),
  } as any;

  const getRowId = useCallback((row: RowType) => row.id, []);
  const getRowIdDefault = useCallback(
    (row: RowType, relativeIndex: number, parent): string =>
      parent ? [parent.id, relativeIndex].join(".") : String(relativeIndex),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    nextPage,
    setPageSize,
    previousPage,
    setGlobalFilter,
    gotoPage,
    pageCount,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      autoResetPage: !skipPageReset,
      updateMyData,
      initialState: {
        pageIndex: 0,
        hiddenColumns,
      },
      manualPagination: controlledPageCount ? true : false,
      pageCount: controlledPageCount ?? 20,
      getRowId: updateMyData ? getRowId : getRowIdDefault,
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const tableRef = useRef(null);

  useLayoutEffect(() => {
    if (tableRef.current) {
      const pageHeight = document.body.clientHeight;

      // console.log({
      //   pageHeight,
      //   scrollHeight: document.body.scrollHeight,
      //   offsetHeight: document.body.offsetHeight,
      // });
      const rect = tableRef.current.getBoundingClientRect();
      const firstCell =
        tableRef.current.childNodes[0].lastElementChild.firstElementChild;

      if (firstCell) {
        const OFFSET = 75;
        const pageSize =
          (pageHeight - rect.top - OFFSET) / firstCell.clientHeight;

        if (pageSize > 20) {
          setPageSize(20);
          return;
        }
        if (pageSize >= 1) setPageSize(Math.floor(pageSize));
      }
    }
  }, [tableRef.current, data]);

  useEffect(() => {
    if (controlledPageCount) gotoPage(0);
  }, [controlledPageCount]);

  useEffect(() => {
    if (fetchData) fetchData(pageIndex, pageSize);
  }, [pageIndex, pageSize]);

  const debouncedSearchTerm = useDebounce(filterValue, 250);
  useEffect(() => {
    setGlobalFilter(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const PaginationComponent = () => {
    if (data.length > pageSize || controlledPageCount > 1) {
      return (
        <Pagination>
          <button onClick={previousPage} disabled={!canPreviousPage}>
            <Icomoon iconName="arrow-down" />
            <p>PREVIOUS</p>
          </button>
          <button onClick={nextPage} disabled={!canNextPage}>
            <p>NEXT</p>
            <Icomoon iconName="arrow-down" />
          </button>
        </Pagination>
      );
    }
    return null;
  };

  return (
    <Container
      ref={tableRef}
      bordered={bordered}
      isEditable={editable}
      tableTheme={theme}
      className={className}
    >
      <table {...getTableProps()}>
        {columnsWidth && (
          <colgroup>
            {columnsWidth.map((col, index) => (
              <col key={index} width={`${col}%`} />
            ))}
          </colgroup>
        )}
        <thead>
          {headerGroups.map((headerGroup) => {
            const { key: headerGroupKey, ...getHeaderGroupProps } =
              headerGroup.getHeaderGroupProps();
            return (
              <tr key={headerGroupKey} {...getHeaderGroupProps}>
                {headerGroup.headers.map((column) => {
                  const {
                    key: headerKey,
                    role: headerRole,
                    ...getHeaderProps
                  } = column.getHeaderProps([
                    {
                      className: column.className,
                    },
                  ]);
                  // const { ...columnSortByProps } =
                  //   sortable && column.getSortByToggleProps();

                  return (
                    <th
                      key={headerKey}
                      {...getHeaderProps}
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                    >
                      {column.render("Header")}

                      {
                        <span>
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                              >
                                <path
                                  d="M3 4.5L6 7.5L9 4.5"
                                  stroke="#f9faf5"
                                  strokeWidth="1.5"
                                  strokeLinecap="square"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                              >
                                <path
                                  d="M9 7.5L6 4.5L3 7.5"
                                  stroke="#f9faf5"
                                  strokeWidth="1.5"
                                  strokeLinecap="square"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )
                          ) : null}
                        </span>
                      }
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        {loading ? (
          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={`${index}-row`}>
                {Array.from({ length: columnsWidth?.length ?? 5 }).map(
                  (_, index) => (
                    <td key={`${index}-column`}>
                      <Skeleton width="75%" />
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        ) : data.length ? (
          <tbody {...getTableBodyProps()}>
            {page.map((row, i) => {
              prepareRow(row);
              const {
                key: rowKey,
                role: rowRole,
                ...getRowProps
              } = row.getRowProps();
              return (
                <tr key={rowKey} {...getRowProps}>
                  {row.cells.map((cell) => {
                    const {
                      key: cellKey,
                      role: cellRole,
                      ...getCellProps
                    } = cell.getCellProps([
                      {
                        className: cell.column.className,
                      },
                    ]);

                    return (
                      <td key={cellKey} {...getCellProps}>
                        {cell.render("Cell")}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        ) : (
          <tbody>
            <tr>
              <td
                style={{ textAlign: "center" }}
                colSpan={columnsWidth?.length ?? 5}
              >
                No data
              </td>
            </tr>
          </tbody>
        )}
      </table>

      <PaginationComponent />
    </Container>
  );
};
