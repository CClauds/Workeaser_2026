import styled from "styled-components";

export const SectionContainer = styled.section`
  & > div.row {
    display: flex;
    align-items: center;

    & + div {
      margin-top: 20px;
    }

    & > p {
      flex: 1;
    }
  }
`;

export const DatePickerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 0 10px;

  border: 1px solid ${({ theme }) => theme.colors.gray300};

  label {
    font-size: 0.75rem;
  }

  /* input {
    width: 90px;
  } */
`;

export const CategoriesContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  margin-top: 0.75rem;
`;
