import styled from "styled-components";

export const BankButtonContainer = styled.div`
  flex: 1%;
  display: flex;
  justify-content: center;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;

  margin: 30px 0;

  button {
    width: 271px;

    &.loading {
      width: 69px;
    }
  }
`;
