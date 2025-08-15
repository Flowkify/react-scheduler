import styled from "styled-components";
import { boxHeight } from "@/constants";
import { StyledSpanProps } from "./types";

export const StyledWrapper = styled.div`
  height: calc(100vh - headerHeight);
`;

export const StyledInnerWrapper = styled.div`
  position: relative;
`;

export const StyledCanvas = styled.canvas``;
export const StyledCanvasHeader = styled.canvas``;

export const StyledSpan = styled.span<StyledSpanProps>`
  width: 1px;
  height: 100%;
  position: absolute;
  top: 0;
  left: ${({ position }) => (position === "left" ? 0 : "auto")};
  right: ${({ position }) => (position === "right" ? 0 : "auto")};
`;

export const StyledSelection = styled.div`
  position: absolute;
  height: ${boxHeight - 2}px;
  border: 2px dashed ${({ theme }) => theme.colors.accent};
  background-color: ${({ theme }) => theme.colors.hover};
  opacity: 0.5;
  pointer-events: none;
  border-radius: 4px;
`;
