import styled from "styled-components";

interface ContainerProps {
  isOpen: boolean;
}

export const Container = styled.div<ContainerProps>`
  position: absolute;
  top: 70px;
  right: 2%;

  width: 350px;

  padding: 15px;

  opacity: ${({ isOpen }) => (isOpen ? "1" : "0")};
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};

  background-color: ${({ theme }) => theme.colors.lightGray};
  border-width: 0 1px 1px;
  border-style: solid;
  border-color: ${({ theme }) => theme.colors.gray300};

  z-index: 50;

  transition: opacity 0.3s, visibility 0.3s;
`;

export const Header = styled.div`
  padding-bottom: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray300};

  & > div {
    display: flex;
    align-items: center;

    padding: 15px;

    background-color: ${({ theme }) => theme.colors.white};
    border: 1px solid ${({ theme }) => theme.colors.gray300};

    & > section {
      margin-left: 15px;
    }
  }
`;

export const AssetsContainer = styled.div`
  padding-bottom: 10px;
  margin-top: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray300};

  & > div {
    display: flex;
    align-items: center;
    gap: 5px;

    padding: 15px;

    background-color: ${({ theme }) => theme.colors.white};
    border: 1px solid ${({ theme }) => theme.colors.gray300};

    & > p {
      font-size: 13px;
      line-height: 1.5;
      font-weight: ${({ theme }) => theme.fonts.semibold};
      &:first-child {
        flex: 1;
        font-size: 12px;
        font-weight: ${({ theme }) => theme.fonts.regular};
      }
    }
  }
`;

export const ResourcesContainer = styled.div`
  padding-bottom: 10px;
  margin-top: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray300};

  h3 {
    font-size: 14px;
  }

  & > div {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;

    margin-top: 15px;
  }
`;

export const ResourceButton = styled.button`
  width: 100%;
  height: 36px;

  display: flex;
  align-items: center;
  gap: 5px;

  font-size: 11px;
  padding: 0 8px;

  background-color: #ffffff;
  border: 1px solid ${({ theme }) => theme.colors.gray300};

  transition: filter 0.3s;

  &:hover {
    filter: brightness(0.9);
  }
`;

export const Footer = styled.footer`
  margin-top: 10px;

  button {
    display: flex;
    align-items: center;
    gap: 5px;

    font-size: 10px;
    font-weight: ${({ theme }) => theme.fonts.semibold};
    background: none;
    outline: none;
  }
`;
