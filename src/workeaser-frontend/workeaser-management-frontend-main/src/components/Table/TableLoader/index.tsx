import React, { ReactNode } from "react";
import { Container } from "./styles";

interface TableLoaderProps {
  children: ReactNode;
  data: any[];
}

export const TableLoader: React.FC<TableLoaderProps> = ({ children, data }) => {
  return (
    <Container>
      {!data ? (
        <div>
          <h1>Loading...</h1>
        </div>
      ) : data.length === 0 ? (
        <div>
          <h1>Nothing to show</h1>
        </div>
      ) : (
        children
      )}
    </Container>
  );
};
