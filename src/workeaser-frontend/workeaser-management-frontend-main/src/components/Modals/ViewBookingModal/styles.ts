import styled from "styled-components";
import { Form as Unform } from "@unform/web";

interface ContainerProps {}
export const Container = styled.div<ContainerProps>`
  max-width: 870px;
`;
// export const Form = styled(Unform)`
export const Form = styled.div`
  display: flex;
  gap: 15px;

  margin-top: 30px;

  & > section {
    width: 435px;
    flex: 1;
    /* flex: 1 0 425px; */
    /* flex-basis: 400px; */

    & > div {
      width: 100%;

      & + div {
        margin-top: 15px;
      }
    }

    ul {
      list-style: none;
      margin-top: 15px;

      & + div {
        margin-top: 15px;
      }

      li {
        display: flex;
        align-items: center;

        & + li {
          margin-top: 12px;
        }

        &:last-child {
          max-height: 32px;
          padding-top: 15px;
          margin-top: 12px;
          border-top: 1px solid ${({ theme }) => theme.colors.blue800};
        }

        p {
          flex: 1;
          font-size: 14px;
        }

        span {
          font-size: 14px;
          /* font-weight: $font-bold; */
        }
      }
    }
  }
`;

export const DatetimeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 10px 5px;

  background-color: ${({ theme }) => theme.colors.lightGray};
  border: 1px solid ${({ theme }) => theme.colors.gray300};
  border-radius: 5px;

  span {
    font-size: 14px;
    font-weight: ${({ theme }) => theme.fonts.bold};
  }

  & > div {
    display: flex;
    gap: 5px;
  }
`;

export const TimeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;

  padding: 10px;

  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray300};
  border-radius: 5px;

  p {
    font-size: 10px;
    font-weight: ${({ theme }) => theme.fonts.regular};
  }
  span {
    font-size: 14px;
    font-weight: ${({ theme }) => theme.fonts.semibold};
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 5px;

  margin-top: 30px;
`;

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

export const LoaderContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
