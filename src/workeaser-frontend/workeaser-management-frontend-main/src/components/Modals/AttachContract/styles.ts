import styled from "styled-components";
import { Form as Unform } from "@unform/web";

interface FormProps {
  $currentStep: number;
}

export const Form = styled(Unform)<FormProps>`
  max-width: ${({ $currentStep }) => ($currentStep === 0 ? 860 : 1185)}px;
  /* overflow: hidden; */
  transition: max-width 0.3s;
`;

interface FormContentProps {
  currentStep: number;
}

export const FormContent = styled.div<FormContentProps>`
  width: 500%;
  display: flex;

  transform: ${({ currentStep }) =>
    `translateX(${
      currentStep === 0
        ? 0
        : currentStep === 1
        ? -860
        : currentStep === 2
        ? -2040
        : 0
    }px)`};
  transition: transform 0.3s;
`;

interface FormSectionProps {
  isVisible?: boolean;
}

export const ContractContainer = styled.div<FormSectionProps>`
  width: 860px;
  display: flex;
  gap: 15px;

  visibility: ${({ isVisible }) => (isVisible ? "visible" : "hidden")};
  pointer-events: ${({ isVisible }) => (isVisible ? "all" : "none")};

  section {
    flex: 1 0 420px;
    padding: 0 5px;

    & > div + div {
      margin-top: 12px;
    }
  }
`;

export const InvoiceContainer = styled.div<FormSectionProps>`
  width: 1185px;
  display: flex;
  gap: 15px;

  visibility: ${({ isVisible }) => (isVisible ? "visible" : "hidden")};
  pointer-events: ${({ isVisible }) => (isVisible ? "all" : "none")};

  & > section {
    flex: 1 0 385px;
    padding: 0 5px;

    .table__container {
      /* & > div:first-child { */
      overflow-y: auto;
      overflow-x: hidden;
      max-height: 375px;
      /* } */
    }

    & > div:first-child {
      p {
        flex: 0 1 auto;
      }
    }

    & > div + div {
      margin-top: 12px;
    }
  }
`;

export const ReviewContainer = styled.div<FormSectionProps>`
  width: 1185px;
  display: flex;
  gap: 15px;

  visibility: ${({ isVisible }) => (isVisible ? "visible" : "hidden")};
  pointer-events: ${({ isVisible }) => (isVisible ? "all" : "none")};

  section {
    flex: 1 0 385px;
    padding: 0 5px;

    & > div + div {
      margin-top: 12px;
    }

    & > ul {
      list-style: none;
      margin-top: 15px;

      padding-bottom: 15px;
      margin-bottom: 15px;
      border-bottom: 1px solid ${({ theme }) => theme.colors.blue800};

      li {
        & + li {
          margin-top: 12px;
        }

        & > div {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;

          p {
            flex: 1;
            font-size: 14px;
            font-weight: ${({ theme }) => theme.fonts.regular};

            strong {
              font-weight: ${({ theme }) => theme.fonts.bold};
            }
          }

          span {
            font-size: 14px;
            font-weight: ${({ theme }) => theme.fonts.regular};
          }
        }

        ul {
          li {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;

            & + li {
              margin-top: 0.2rem;
            }

            p {
              flex: 1;

              font-size: 12px;
              font-weight: ${({ theme }) => theme.fonts.regular};

              strong {
                font-weight: ${({ theme }) => theme.fonts.bold};
              }

              &:before {
                content: "-";
                width: 1rem;
                margin-right: 0.25rem;
              }
            }

            span {
              font-size: 12px;
              font-weight: ${({ theme }) => theme.fonts.regular};
            }
          }
        }
      }
    }
  }
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  p {
    flex: 1;
  }
`;

export const StepsContainer = styled.div`
  display: flex;
  justify-content: center;

  margin: 1.75rem 0;
`;

export const FooterText = styled.p`
  font-size: 10px;
  line-height: 1.2;
  margin-top: 10px;
`;

export const SectionDivider = styled.h3`
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: ${({ theme }) => theme.fonts.bold};

  white-space: nowrap;

  &:after {
    content: "";
    display: inline-block;
    width: 100%;
    height: 1px;

    margin-left: 10px;

    background-color: ${({ theme }) => theme.colors.blue800};
  }
`;

export const ImagesPreviewContainer = styled.div`
  max-width: 485px;
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;

  padding: 6px 10px;

  border: 1px solid ${({ theme }) => theme.colors.gray300};

  ul {
    height: 100%;

    display: flex;
    align-items: center;
    gap: 10px;

    padding: 0 5px;

    list-style: none;
    scroll-snap-type: x;
    overflow-x: auto;

    /* scrollbar-color: $color-light-gray $color-white; */
    scrollbar-width: thin;

    li {
      position: relative;

      img {
        width: 80px;
        height: 80px;
        object-fit: cover;
      }
    }
  }
`;
