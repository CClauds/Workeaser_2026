import styled from "styled-components";
import { Form as Unform } from "@unform/web";

export const Form = styled(Unform)``;

export const RuleCard = styled.div`
  display: flex;
  align-items: center;

  padding: 15px 10px;
  background-color: ${({ theme }) => theme.colors.lightGray};
  border: 1px solid ${({ theme }) => theme.colors.gray300};

  & + & {
    margin-top: 10px;
  }

  & > section {
    flex: 1;
  }

  p {
    font-size: 13px;

    strong {
      font-weight: ${({ theme }) => theme.fonts.semibold};
    }

    & + p {
      margin-top: 5px;
    }
  }
`;

export const LoaderContainer = styled.div`
  width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;

  margin-top: 1rem;

  button {
    width: 97px;
  }
`;
