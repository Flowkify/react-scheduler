import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "styled-components";
import dayjs from "dayjs";
import { useCalendar } from "@/context/CalendarProvider";
import { getDatesRange } from "@/utils/getDatesRange";
import { getTileProperties } from "@/utils/getTileProperties";
import { getTileTextColor } from "@/utils/getTileTextColor";
import { dayWidth, zoom2ColumnWidth } from "@/constants";
import {
  StyledDescription,
  StyledStickyWrapper,
  StyledText,
  StyledTextWrapper,
  StyledTileWrapper
} from "./styles";
import { TileProps } from "./types";

const Tile: FC<TileProps> = ({ row, data, zoom, onTileClick, onTileChange, resourceId }) => {
  const { date } = useCalendar();
  const datesRange = getDatesRange(date, zoom);
  const { y, x, width } = getTileProperties(
    row,
    datesRange.startDate,
    datesRange.endDate,
    data.startDate,
    data.endDate,
    zoom
  );

  const { colors } = useTheme();

  const dragModeRef = useRef<null | "move" | "left" | "right">(null);
  const dragStartRef = useRef<{
    clientX: number;
    startX: number;
    width: number;
    rowIndex: number;
  } | null>(null);
  const [ghost, setGhost] = useState<{ x: number; width: number } | null>(null);
  const ghostRef = useRef<{ x: number; width: number } | null>(null);
  const [hasMoved, setHasMoved] = useState(false);
  const suppressClickRef = useRef(false);

  const getCellWidthAndUnit = useCallback((): { cellWidth: number; unit: dayjs.ManipulateType } => {
    switch (zoom) {
      case 2:
        return { cellWidth: zoom2ColumnWidth, unit: "hours" };
      case 1:
        return { cellWidth: dayWidth, unit: "days" };
      default:
        return { cellWidth: dayWidth, unit: "days" };
    }
  }, [zoom]);

  const onWindowMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragStartRef.current || !dragModeRef.current) return;
      const { clientX, startX, width: startWidth } = dragStartRef.current;
      const dx = e.clientX - clientX;
      const { cellWidth } = getCellWidthAndUnit();
      if (Math.abs(dx) > 2) setHasMoved(true);
      if (dragModeRef.current === "left") {
        const steps = Math.round(dx / cellWidth);
        const newX = startX + steps * cellWidth;
        const newW = Math.max(cellWidth, startWidth - steps * cellWidth);
        const next = { x: newX, width: newW };
        setGhost(next);
        ghostRef.current = next;
        if (steps !== 0) suppressClickRef.current = true;
      } else if (dragModeRef.current === "right") {
        const steps = Math.round(dx / cellWidth);
        const newW = Math.max(cellWidth, startWidth + steps * cellWidth);
        const next = { x: startX, width: newW };
        setGhost(next);
        ghostRef.current = next;
        if (steps !== 0) suppressClickRef.current = true;
      } else {
        const steps = Math.round(dx / cellWidth);
        const newX = startX + steps * cellWidth;
        const next = { x: newX, width: startWidth };
        setGhost(next);
        ghostRef.current = next;
        if (steps !== 0) suppressClickRef.current = true;
      }
    },
    [getCellWidthAndUnit]
  );

  const onWindowMouseUp = useCallback(() => {
    if (!dragStartRef.current || !dragModeRef.current) return;
    const mode = dragModeRef.current;
    const { startX, width: startWidth } = dragStartRef.current;
    const { cellWidth, unit } = getCellWidthAndUnit();
    const currentGhost = ghostRef.current ?? ghost;
    if (!currentGhost) return;
    const dx = currentGhost.x - startX;
    const dxSteps = Math.round(dx / cellWidth);
    const initialWidthSteps = Math.max(1, Math.round(startWidth / cellWidth));
    const currentWidthSteps = Math.max(1, Math.round(currentGhost.width / cellWidth));
    const changed = dxSteps !== 0 || currentWidthSteps !== initialWidthSteps;
    if (changed && onTileChange) {
      const movedStart = dayjs(data.startDate).add(dxSteps, unit).toDate();
      let movedEnd: Date;
      if (mode === "left") {
        // left edge moved: start shifts by dxSteps, end stays unless width changed; inclusive step calc
        const widthSteps = Math.max(1, Math.round(currentGhost.width / cellWidth));
        movedEnd = dayjs(movedStart)
          .add(widthSteps - 1, unit)
          .toDate();
      } else if (mode === "right") {
        const widthSteps = Math.max(1, Math.round(currentGhost.width / cellWidth));
        movedEnd = dayjs(movedStart)
          .add(widthSteps - 1, unit)
          .toDate();
      } else {
        movedEnd = dayjs(data.endDate).add(dxSteps, unit).toDate();
      }
      onTileChange({
        projectId: data.id,
        resourceId: resourceId ?? "",
        previousResourceId: undefined,
        startDate: movedStart,
        endDate: movedEnd
      });
    }
    suppressClickRef.current = changed;
    dragModeRef.current = null;
    dragStartRef.current = null;
    setGhost(null);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
    window.removeEventListener("mousemove", onWindowMouseMove);
    window.removeEventListener("mouseup", onWindowMouseUp);
    ghostRef.current = null;
  }, [
    data.endDate,
    data.id,
    data.startDate,
    getCellWidthAndUnit,
    ghost,
    onTileChange,
    onWindowMouseMove,
    resourceId
  ]);

  const cleanupDrag = useCallback(() => {
    dragModeRef.current = null;
    dragStartRef.current = null;
    setGhost(null);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
    window.removeEventListener("mousemove", onWindowMouseMove);
    window.removeEventListener("mouseup", onWindowMouseUp);
  }, [onWindowMouseMove, onWindowMouseUp]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
      const edgeThreshold = 8;
      let mode: "move" | "left" | "right" = "move";
      if (e.clientX - rect.left <= edgeThreshold) mode = "left";
      else if (rect.right - e.clientX <= edgeThreshold) mode = "right";
      dragModeRef.current = mode;
      suppressClickRef.current = false;
      dragStartRef.current = { clientX: e.clientX, startX: x, width, rowIndex: row };
      const initial = { x, width };
      setGhost(initial);
      ghostRef.current = initial;
      document.body.style.userSelect = "none";
      document.body.style.cursor = mode === "move" ? "grabbing" : "ew-resize";
      window.addEventListener("mousemove", onWindowMouseMove);
      window.addEventListener("mouseup", onWindowMouseUp);
      e.preventDefault();
      e.stopPropagation();
    },
    [onWindowMouseMove, onWindowMouseUp, width, x, row]
  );

  const handleMouseMove = useCallback(() => {
    // no-op: we handle move via window listeners for robustness
  }, []);

  const handleMouseUp = useCallback(() => {
    // no-op: handled by window mouseup for robustness
  }, []);

  useEffect(() => () => cleanupDrag(), [cleanupDrag]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (hasMoved || suppressClickRef.current) {
        e.preventDefault();
        e.stopPropagation();
        suppressClickRef.current = false;
        setHasMoved(false);
        return;
      }
      onTileClick?.(data);
    },
    [data, hasMoved, onTileClick]
  );

  return (
    <StyledTileWrapper
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        left: `${ghost ? ghost.x : x}px`,
        top: `${y}px`,
        backgroundColor: `${data.bgColor ?? colors.defaultTile}`,
        width: `${ghost ? ghost.width : width}px`,
        color: getTileTextColor(data.bgColor ?? "")
      }}
      onClick={handleClick}>
      <StyledTextWrapper>
        <StyledStickyWrapper>
          <StyledText bold>{data.title}</StyledText>
          <StyledText>{data.subtitle}</StyledText>
          <StyledDescription>{data.description}</StyledDescription>
        </StyledStickyWrapper>
      </StyledTextWrapper>
    </StyledTileWrapper>
  );
};

export default Tile;
