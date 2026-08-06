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

  background-color: ${({ theme }) => theme.colors.lightGray};

  z-index: 50;

  transition: all 0.3s;

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 15px;
    padding-bottom: 25px;

    border-bottom: 1px solid ${({ theme }) => theme.colors.gray300};

    h1 {
      font-size: 20px;
      font-weight: ${({ theme }) => theme.fonts.semibold};
    }
  }

  & > section {
    flex: 1;
    overflow-y: auto;
    padding: 0 15px;
    padding-bottom: 15px;

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
