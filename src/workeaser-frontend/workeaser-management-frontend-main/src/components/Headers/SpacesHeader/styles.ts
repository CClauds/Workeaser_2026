import styled from "styled-components";
import ReactSlider from "react-slider";

export const Container = styled.div`
  min-height: 10vh;
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.colors.lightGray};

  & > section {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1rem;

    & > div:last-child {
      flex: 1;
      align-self: flex-end;

      & > button {
        margin-left: auto;
        width: fit-content;
      }
    }

    & > div {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      label {
        font-size: 0.85rem;
      }
    }
  }

  .input {
    width: 300px;
    background-color: ${({ theme }) => theme.colors.white};
  }

  .area__input {
    width: 75px;
    background-color: ${({ theme }) => theme.colors.white};
  }
`;

export const SelectContainer = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray300};

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.blue200};
  }

  & > input {
    border: none;
  }
  & > div {
    border: none;

    &:before {
      position: absolute;
      top: 5px;
      bottom: 5px;
      content: "";

      border-left: 2px solid ${({ theme }) => theme.colors.gray300};
    }

    &:focus {
      box-shadow: none;
    }
  }
`;

export const NavigationButtonContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 0.25rem;
`;

export const FilterContent = styled.div`
  section:last-child {
    /* padding-bottom: 20px; */
  }

  section + section {
    padding-top: 20px;
    margin-top: 20px;
    border-top: 1px solid ${({ theme }) => theme.colors.gray300};
  }

  h4 {
    font-size: 1rem;
    font-weight: ${({ theme }) => theme.fonts.regular};
  }
`;

export const AmenitiesContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  margin-top: 0.75rem;
`;

export const SliderContainer = styled.div`
  margin-top: 1rem;

  & > div {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
  }
`;

export const StyledSlider = styled(ReactSlider)`
  width: 100%;
  height: 5px;
`;

export const StyledThumb = styled.div`
  top: -4px;

  height: 16px;
  width: 16px;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.blue800};
  color: #fff;
  border-radius: 50%;
  cursor: grab;
`;

interface StyledTrackProps {
  index: number;
}
export const StyledTrack = styled.div<StyledTrackProps>`
  top: 0;
  bottom: 0;
  background: ${({ theme, index }) =>
    index === 2
      ? theme.colors.gray300
      : index === 1
      ? theme.colors.blue200
      : theme.colors.gray300};
  border-radius: 5px;
`;
