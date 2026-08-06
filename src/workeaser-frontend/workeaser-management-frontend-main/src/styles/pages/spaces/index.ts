import styled from "styled-components";

export const Wrapper = styled.div`
  /* max-height: calc(100vh - 70px);
  overflow: auto;
  scroll-behavior: smooth; */
`;

interface ContainerProps {
  heightOffSet?: number;
}
export const Container = styled.div<ContainerProps>`
  max-height: ${({ heightOffSet }) =>
    `calc(100vh - 10vh - ${heightOffSet ?? 70}px)`};
  overflow: auto;
  scroll-behavior: smooth;

  display: grid;
  grid-template-columns: 1.5fr 1fr;

  & > section:first-child {
    padding: 1rem;
  }
`;

export const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding-bottom: 0.8rem;
  margin-bottom: 0.8rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.darkGray};

  h3 {
    font-size: 1rem;
    font-weight: ${({ theme }) => theme.fonts.regular};
    strong {
      font-weight: ${({ theme }) => theme.fonts.bold};
    }
  }
`;

export const ResultContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(24rem, 1fr));
  gap: 1rem;
  align-content: start;

  .skeletonContainer {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(24rem, 1fr));
    gap: 1rem;
    align-content: start;
  }
`;

export const MapSection = styled.section``;

export const MapContainer = styled.div`
  position: sticky;
  top: 0;
  width: 100%;
  height: calc(100vh - 10vh - 70px);

  .map__popup {
    .mapboxgl-popup-tip {
      border-top-color: ${({ theme }) => theme.colors.blue800};
    }

    .mapboxgl-popup-content {
      border: 1px solid ${({ theme }) => theme.colors.blue800};
      border-radius: 0;
    }

    .mapboxgl-popup-close-button {
      padding: 0.25rem;
    }
  }
`;

export const PopupContainer = styled.div`
  h5 {
    font-size: 14px;
    font-weight: ${({ theme }) => theme.fonts.bold};
  }
  span {
    font-size: 12px;
  }

  & > div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    span {
      display: flex;
      align-items: center;
    }

    div.popup__infos {
      display: flex;
      align-items: center;
      span ~ span {
        &:before {
          content: "";
          display: inline-block;
          width: 4px;
          height: 4px;
          background-color: ${({ theme }) => theme.colors.blue200};
          border-radius: 50%;
          margin: auto 0.25rem;
        }
      }
    }
  }

  footer {
    padding-top: 0.5rem;
    margin-top: 0.5rem;
    border-top: 1px solid ${({ theme }) => theme.colors.gray300};
  }
`;
