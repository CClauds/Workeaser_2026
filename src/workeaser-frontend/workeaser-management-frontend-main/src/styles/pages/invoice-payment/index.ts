import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100vh;

  @media (max-height: 720px) {
    height: 100%;
  }

  padding: 0 1.25rem;

  background-color: ${({ theme }) => theme.colors.lightGray};
`;
export const Container = styled.div`
  max-width: 1480px;
  width: 100%;
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;

  & > div {
    display: flex;
    align-items: center;
    gap: 10px;

    cursor: pointer;

    transition: filter 0.3s;

    &:hover {
      filter: brightness(1.25);
    }
  }

  & > a {
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

export const Content = styled.div`
  max-width: 1200px;
  width: 100%;
  padding-bottom: 1rem;
  margin: 0 auto;

  & > form {
    display: flex;
    gap: 20px;
  }
  @media (max-width: 875px) {
    & > form {
      flex-direction: column;
    }
  }
`;

const RowBlock = styled.div`
  padding: 1.5rem;

  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.darkGray};
  border-radius: 5px;
`;

export const InfoBlock = styled(RowBlock)`
  flex: 1;

  footer {
    display: flex;
    justify-content: center;

    margin-top: 1.75rem;

    p {
      font-size: 12px;
    }
  }
`;

export const TopSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding-bottom: 1.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.blue800};

  h1 {
    font-size: 23px;
    font-weight: ${({ theme }) => theme.fonts.semibold};
  }
  h2 {
    font-size: 14px;
    font-weight: ${({ theme }) => theme.fonts.regular};
  }

  & > div {
    display: flex;
    flex-direction: column;
    gap: 5px;

    &:last-child {
      align-items: flex-end;
    }
  }
`;
export const TableSection = styled.section`
  margin-top: 1.75rem;
  padding-bottom: 1.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.blue800};
`;

export const TableFooterr = styled.div`
  display: flex;
  justify-content: flex-end;

  margin-top: 20px;

  & > div {
    flex: 1;
    justify-content: flex-end;
  }

  p {
    font-size: 14px;
  }
`;

export const TableContainer = styled.div`
  display: flex;
  gap: 10px;

  & > div:last-child {
    flex: 0.2;
  }

  @media (max-width: 700px) {
    flex-direction: column;
  }
`;

export const PriceCard = styled.div`
  flex-basis: 130px;
  padding: 12px 20px;
  text-align: center;

  border: 1px solid ${({ theme }) => theme.colors.blue800};

  span {
    font-size: 14px;
  }
`;

export const PaymentInfoSection = styled.section`
  display: flex;
  justify-content: center;

  margin-top: 1.75rem;
  padding-bottom: 1.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.darkGray};
`;

export const PaymentBlock = styled.div`
  flex-basis: 360px;
`;

export const SummarySection = styled(RowBlock)`
  header {
    display: flex;
    flex-direction: column;
    align-items: center;

    h2 {
      font-size: 18px;
      font-weight: ${({ theme }) => theme.fonts.semibold};

      margin-top: 8px;
    }
  }

  footer {
    margin-top: 1.75rem;

    button {
      height: fit-content;
      padding: 5px;
      font-size: 10px;
    }
  }
`;

export const PriceSummarySection = styled.section`
  margin-top: 1.75rem;
  padding-bottom: 1.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.blue800};

  & > div {
    justify-content: space-between;
    font-size: 14px;

    & + div {
      margin-top: 15px;
    }
  }
`;

export const PaymentItem = styled.div`
  padding: 5px 10px;
  background-color: ${({ theme }) => theme.colors.lightGray};
  border: 1px solid ${({ theme }) => theme.colors.darkGray};

  &.margin {
    margin-top: 8px;
  }
`;

export const SubmitButtonContainer = styled.div`
  display: flex;
  justify-content: center;

  margin-top: 1.75rem;

  button {
    max-width: 360px;
    width: 100%;
    height: 50px;

    transition: max-width 0.3s;

    &.loading {
      max-width: 69px;
    }
  }
`;
