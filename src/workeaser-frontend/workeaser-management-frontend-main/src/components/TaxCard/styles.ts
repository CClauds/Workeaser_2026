import styled from "styled-components";
import { DefaultButton } from "@styles/reusable";

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.darkGray};
  border-radius: 5px;

  & > div:first-child {
    flex: 1;

    h4 {
      font-size: 14px;
      font-weight: ${({ theme }) => theme.fonts.bold};
      margin-bottom: 5px;
    }

    p {
      font-size: 12px;
    }
  }
`;

export const TaxValue = styled.span`
  display: inline-block;

  padding: 10px;

  font-size: 14px;
  font-weight: ${({ theme }) => theme.fonts.bold};

  background-color: ${({ theme }) => theme.colors.darkGray};
  border-radius: 5px;
`;

export const CloseButton = styled(DefaultButton)`
  font-size: 18px;
  line-height: 0.5;
  font-weight: ${({ theme }) => theme.fonts.book};
  padding: 5px;
  background-color: ${({ theme }) => theme.colors.darkGray};
  border-radius: 50%;
`;
