import styled from "styled-components";

export const SectionContainer = styled.section`
  & ~ & {
    padding-top: 20px;
    margin-top: 20px;
    border-top: 1px solid ${({ theme }) => theme.colors.gray300};
  }

  h4 {
    font-size: 1rem;
    font-weight: ${({ theme }) => theme.fonts.regular};
  }

  & > div.row {
    display: flex;
    align-items: center;
    gap: 1rem;

    & > p {
      flex: 1;
    }
  }
`;

export const InputContainer = styled.div`
  display: flex;
  align-items: center;

  padding-left: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.gray300};

  transition: border-color 0.3s;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.blue200};
  }

  & > input {
    border: none;
  }
`;

export const DatePickerContainer = styled.div`
  display: flex;
  align-items: center;

  & > p {
    flex: 1;
  }

  & > div {
    display: flex;
    align-items: center;
    gap: 10px;

    padding: 0 10px;

    border: 1px solid ${({ theme }) => theme.colors.gray300};

    label {
      font-size: 0.75rem;
    }

    input {
      width: 90px;
    }
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  margin-top: 0.75rem;
`;
