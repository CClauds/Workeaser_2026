import { OptionsButton } from "@components/Button/OptionsButton";
import { MenuWrapper } from "@components/DotsMenu/MenuWrapper";
import { Download, Upload } from "@components/Icons";
import { StyledTable } from "@components/Table/StyledTable";
import { api } from "@services/api";
import { uploadFile } from "@services/api/fileUpload";
import { AxiosRequestConfig } from "axios";
import React, { ChangeEvent, useMemo, useRef, useState } from "react";
import { TableContainer, Container } from "./styles";
import { toast } from "react-toastify";
import LatLongInfo from "@components/LongLatInfo";

export const ImportExport: React.FC = () => {
  const [currentType, setCurrentType] = useState<string>("");

  const inputFileRef = useRef<HTMLInputElement>(null);

  const handlePreview = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    try {
      const response = await uploadFile(ImportUrlEnum[currentType], file);
      console.log({ response });
    } catch (error) {
      console.log({ error });
    } finally {
      setCurrentType("");
    }
  };

  const columns = useMemo(() => {
    const handleExport = async (type: string, handleClose: () => void) => {
      handleClose();
      setCurrentType(type);

      const config: AxiosRequestConfig<any> = {
        method: "GET",
        responseType: "blob",
      };

      try {
        const response = await api.get(`/cowork/${type}/export`, config);

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `${type}-${new Date().toLocaleDateString()}.xlsx`
        );
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        if (error.response.status === 500) {
          toast.error("No records found.");
        }
      } finally {
        setCurrentType("");
      }
    };

    const handleImport = async (type: string, handleClose: () => void) => {
      setCurrentType(type);
      handleClose();
      inputFileRef.current.click();
    };

    return [
      {
        Header: "Asset Type",
        accessor: "type",
      },
      {
        Header: "Sample File",
        accessor: "sample",
        className: "align__center",
        Cell: ({ value }) => (
          <a href={`/static/${value}.xlsx`} download>
            Click to download sample
          </a>
        ),
      },
      {
        Header: "Action",
        accessor: "action",
        // className: "align__right",
        disableSortBy: true,
        Cell: ({ value }: { value: TableData }) => (
          <MenuWrapper loading={currentType === value.type}>
            {(handleClose) => (
              <>
                <OptionsButton
                  onClick={() => handleExport(value.type, handleClose)}
                  icon={<Download />}
                >
                  EXPORT {value.name}
                </OptionsButton>
                <OptionsButton
                  onClick={() => handleImport(value.type, handleClose)}
                  icon={<Upload />}
                >
                  IMPORT {value.name}
                </OptionsButton>
              </>
            )}
          </MenuWrapper>
        ),
      },
    ];
  }, [currentType]);

  const tableData = useMemo(
    () =>
      TABLE_DATA.map((datum) => ({
        type: TableEnum[datum.type],
        sample: datum.sample,
        action: datum,
      })),
    []
  );

  return (
    <Container>
      <TableContainer>
        <StyledTable
          columns={columns}
          data={tableData ?? []}
          columnsWidth={[45, 45, 10]}
        />
        <input
          ref={inputFileRef}
          type="file"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          multiple={false}
          onChange={handlePreview}
        />
        <LatLongInfo />
      </TableContainer>
    </Container>
  );
};

enum TableEnum {
  clients = "Clients",
  locations = "Locations | note: export locations to get access to location ids to use on imports",
  rooms = "Private Rooms",
  meetrooms = "Meeting Rooms",
  virtualoffices = "Virtual Offices",
  desks = "Open Desks",
}
enum ImportUrlEnum {
  clients = "/cowork/clients/import",
  locations = "/cowork/locations/import",
  rooms = "/cowork/rooms/import",
  meetrooms = "/cowork/meetrooms/import",
  virtualoffices = "/cowork/virtualoffices/import",
  desks = "/cowork/desks/import",
}

interface TableData {
  type: string;
  sample: string;
  name: string;
}

const TABLE_DATA: TableData[] = [
  {
    type: "clients",
    sample: "Client-Spreadsheet_Sample",
    name: "Clients",
  },
  {
    type: "locations",
    sample: "Location-Spreadsheet_Sample",
    name: "Locations",
  },
  {
    type: "rooms",
    sample: "Private-Office-Spreadsheet_Sample",
    name: "Rooms",
  },
  {
    type: "meetrooms",
    sample: "Meeting-Room-Spreadsheet_Sample",
    name: "Meeting Rooms",
  },
  {
    type: "virtualoffices",
    sample: "Virtual-Office-Spreadsheet_Sample",
    name: "Offices",
  },
  {
    type: "desks",
    sample: "Open-Desk-Spreadsheet_Sample",
    name: "Desks",
  },
];
