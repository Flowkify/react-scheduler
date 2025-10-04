import styled from "styled-components";
import { leftColumnWidth } from "@/constants";

export const StyledOuterWrapper = styled.div`
  position: relative;
  display: flex;
  isolation: isolate; /* Creates a new stacking context */
`;

export const StyledInnerWrapper = styled.div`
  position: relative;
  margin-left: ${leftColumnWidth};
  display: flex;
  flex-direction: column;
  z-index: 0;
`;

export const StyledEmptyBoxWrapper = styled.div<{ width: number }>`
  width: calc(${({ width }) => width}px - ${leftColumnWidth}px);
  position: sticky;
  top: 0;
  height: 100%;
  margin-left: ${leftColumnWidth}px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
