import styled from "styled-components";

export const Container = styled.div`
  height: calc(100vh - 105px);
  display: flex;
  flex-direction: column;
  align-items: center;

  margin-top: 35px;
`;
export const Title = styled.h1`
  font-size: 24px;
  font-weight: ${({ theme }) => theme.fonts.semibold};
  margin-bottom: 35px;
`;
