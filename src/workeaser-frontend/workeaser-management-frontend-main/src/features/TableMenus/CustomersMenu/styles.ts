import styled from "styled-components";

export const Container = styled.div`
  & > div + div {
    margin-top: 10px;
  }
`;

export const ButtonsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const ButtonsRow = styled.div`
  display: flex;
  gap: 10px;
`;
