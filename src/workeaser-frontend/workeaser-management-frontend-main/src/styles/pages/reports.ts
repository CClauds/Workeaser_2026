import styled from "styled-components";

export const FilterDateContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

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

    & > div {
      width: 115px;
    }
  }
`;
