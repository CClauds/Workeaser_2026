import styled from "styled-components";

interface ContainerProps {
  isOpen: boolean;
}

export const Container = styled.div<ContainerProps>`
  position: absolute;
  top: 70px;
  right: 0;

  width: 350px;
  height: calc(100vh - 70px);

  opacity: ${({ isOpen }) => (isOpen ? "1" : "0")};
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  padding: 15px;

  background-color: ${({ theme }) => theme.colors.lightGray};

  z-index: 50;

  transition: all 0.3s;

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 25px;
    margin-top: 10px;
    margin-bottom: 15px;

    border-bottom: 1px solid ${({ theme }) => theme.colors.gray300};

    h1 {
      font-size: 20px;
      font-weight: ${({ theme }) => theme.fonts.semibold};
    }

    & > div {
      padding: 5px;

      background-color: ${({ theme }) => theme.colors.white};
      border: 1px solid ${({ theme }) => theme.colors.gray300};
      border-radius: 5px;

      p {
        font-size: 11px;
        font-weight: ${({ theme }) => theme.fonts.regular};

        strong {
          font-weight: ${({ theme }) => theme.fonts.black};
        }
      }
    }
  }

  & > section {
    flex: 1;
    overflow-y: auto;

    display: flex;
    flex-direction: column;
    /* justify-content: center; */
    align-items: center;

    & > div {
      width: 100%;
    }

    & > div + div {
      margin-top: 15px;
    }
  }

  footer {
    display: flex;
    justify-content: center;

    margin-top: 15px;
  }
`;
