import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;

  padding: 10px;

  background-color: ${({ theme }) => theme.colors.lightGray};

  span {
    padding-right: 10px;
    margin-right: 10px;
    border-right: 1px solid ${({ theme }) => theme.colors.darkGray};

    &:before {
      font-size: 22px;
    }
  }

  p {
    font-size: 14px;
    font-weight: ${({ theme }) => theme.fonts.book};

    a {
      font-size: 14px;
      font-weight: ${({ theme }) => theme.fonts.bold};
      text-decoration: underline;
      cursor: pointer;
    }
  }
`;
