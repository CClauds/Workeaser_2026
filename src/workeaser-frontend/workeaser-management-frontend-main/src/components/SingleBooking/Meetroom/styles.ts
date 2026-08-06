import styled from "styled-components";

export const SectionDivider = styled.h3`
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: ${({ theme }) => theme.fonts.bold};

  white-space: nowrap;

  margin-top: 15px;

  &:after {
    content: "";
    display: inline-block;
    width: 100%;
    height: 1px;

    margin-left: 10px;

    background-color: ${({ theme }) => theme.colors.blue800};
  }
`;

export const PriceList = styled.ul`
  list-style: none;

  & + div {
    margin-top: 15px;
  }

  li {
    display: flex;
    align-items: center;

    & + li {
      margin-top: 12px;
    }

    &:last-of-type:not(:first-child) {
      max-height: 32px;
      padding-top: 15px;
      margin-top: 12px;
      border-top: 1px solid ${({ theme }) => theme.colors.blue800};
    }
  }

  & > div {
    display: flex;
    align-items: center;
  }

  p {
    flex: 1;
    font-size: 14px;
  }

  span {
    font-size: 14px;
    /* font-weight: $font-bold; */
  }
`;
