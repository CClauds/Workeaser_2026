import styled from "styled-components";

export const Content = styled.div`
  margin-top: 1rem;

  h3 {
    font-size: 14px;
    font-weight: ${({ theme }) => theme.fonts.regular};

    strong {
      font-weight: ${({ theme }) => theme.fonts.bold};
    }
  }
`;

export const PricingContent = styled.div`
  padding: 0.75rem;
  margin-top: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.gray300};

  & > div {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0.5rem 1rem;

    &:first-child {
      padding-bottom: 1rem;
      margin-bottom: 0.5rem;
      border-bottom: 1px solid ${({ theme }) => theme.colors.gray300};
    }

    &.pricing__card {
      background-color: ${({ theme }) => theme.colors.lightGray};
      border: 1px solid ${({ theme }) => theme.colors.gray300};

      & + div {
        margin-top: 0.6rem;
      }

      p {
        font-weight: ${({ theme }) => theme.fonts.bold};
      }
    }

    & > div {
      display: flex;
      gap: 30px;

      & > p {
        width: 8rem;
        text-align: center;
      }
    }
  }
`;

interface PriceButtonProps {
  isActive: boolean;
}
export const PriceButton = styled.button<PriceButtonProps>`
  width: 8rem;
  line-height: 2.5;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray300};

  cursor: pointer;
  pointer-events: ${({ isActive }) => (isActive ? "auto" : "none")};

  &:hover {
    filter: brightness(0.9);
  }
`;
