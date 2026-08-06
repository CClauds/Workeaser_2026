import styled, { keyframes } from "styled-components";

export const Content = styled.div`
  width: 550px;

  margin-top: 15px;

  .select {
    margin-top: 15px;
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;

  margin-top: 15px;
`;

interface CardContainerProps {
  isDeleted?: boolean;
}

const expand = () => keyframes`
  from { 
    max-height: 0; 
    margin-top: 0;
  }
  to { 
    max-height: 54px;
    margin-top: 15px;
  }
`;

const shrink = () => keyframes`
  from { 
    max-height: 54px; 
    margin-top: 15px
  }
  to { 
    max-height: 0;
    margin-top: 0;
  }
`;

export const CardContainer = styled.div<CardContainerProps>`
  overflow: hidden;
  animation: ${({ isDeleted }) => (isDeleted ? shrink : expand)} 0.3s forwards;
`;
