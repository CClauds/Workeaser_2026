import styled from "styled-components";

export const ChartContainer = styled.div`
  height: 200px;

  margin: auto;

  &.full {
    width: 100%;
  }
  &.big {
    width: 100%;
    height: 320px;
  }
  &.heatmap {
    width: 900px;
    height: 180px;
  }
  &.default {
    width: 200px;
  }
`;
