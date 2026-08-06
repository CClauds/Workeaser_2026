import styled from "styled-components";

export const Container = styled.div`
  margin-top: 1rem;

  header {
    text-align: center;
    margin-bottom: 1rem;
  }
`;

export const TopRow = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 20px;

  p,
  time {
    font-size: 14px;
  }
  time {
    font-weight: ${({ theme }) => theme.fonts.bold};
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;

  margin-top: 20px;

  section {
    /* flex-basis: clamp(225px, 10vw, 300px); */
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
`;

export const InfoSection = styled.section`
  flex: 1;

  & > div {
    width: 100%;
    & + div {
      margin-top: 15px;
    }
  }
`;

export const SummarySection = styled.section`
  flex: 1;

  & > div {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 6px 10px;

    p,
    span {
      font-size: 13px;
    }

    span {
      font-weight: ${({ theme }) => theme.fonts.bold};
    }
  }

  hr {
    margin: 10px 0;
    border: 1px solid ${({ theme }) => theme.colors.blue800};
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
`;
