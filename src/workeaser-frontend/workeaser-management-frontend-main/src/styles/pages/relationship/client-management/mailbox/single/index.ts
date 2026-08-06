import styled from "styled-components";

export const Container = styled.div``;

export const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;

  margin-top: 20px;

  section {
    /* flex: 1; */
    /* flex-basis: clamp(225px, 10vw, 300px); */
  }
`;

export const BorderedRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;

  padding: 9px 10px;

  border: 1px solid ${({ theme }) => theme.colors.gray300};

  p,
  time {
    font-size: 14px;
  }
  time {
    font-weight: ${({ theme }) => theme.fonts.bold};
  }
`;

export const InfosBlock = styled.div`
  flex: 1;

  & > div + section {
    margin-top: 15px;
  }
  & > section + div {
    margin-top: 15px;
  }
  & > div + div {
    margin-top: 15px;
  }
`;

export const InfoSection = styled.section`
  flex: 1;

  & > div {
    width: 100%;
    & + div {
      margin-top: 15px;
    }
  }

  p {
    font-size: 11px;
  }
`;

export const BorderedSection = styled.section`
  flex: 1;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.gray300};

  header {
    padding-bottom: 10px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray300};
    h3 {
      font-size: 14px;
      font-weight: ${({ theme }) => theme.fonts.regular};
    }
  }

  & > div {
    margin-top: 15px;
  }
`;

export const PhotoSection = styled(BorderedSection)`
  & > div {
    display: flex;
    flex-flow: row wrap;
    gap: 15px;
    /* display: grid; */
    /* grid-template-columns: 1fr 1fr 1fr; */
    /* grid-gap: 15px; */
  }
`;

export const ActivitySection = styled(BorderedSection)`
  flex: 0.5;

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    time {
      font-size: 14px;
      font-weight: ${({ theme }) => theme.fonts.bold};
    }
  }

  & > div {
    display: flex;
    flex-direction: column;

    & > div + div {
      /* margin-top: 30px; */
    }
  }
`;
