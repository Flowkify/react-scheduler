import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useTheme } from "styled-components";
import dayjs from "dayjs";
import { drawGrid } from "@/utils/drawGrid/drawGrid";
import {
  boxHeight,
  canvasWrapperId,
  dayWidth,
  leftColumnWidth,
  outsideWrapperId,
  weekWidth,
  zoom2ColumnWidth
} from "@/constants";
import { Loader, Tiles } from "@/components";
import { useCalendar } from "@/context/CalendarProvider";
import { resizeCanvas } from "@/utils/resizeCanvas";
import { getCanvasWidth } from "@/utils/getCanvasWidth";
import { GridProps } from "./types";
import {
  StyledCanvas,
  StyledInnerWrapper,
  StyledSelection,
  StyledSpan,
  StyledWrapper
} from "./styles";
// DnD kit intentionally omitted for simplicity and maintainability

const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(
  { zoom, rows, data, onTileClick, onGridSelect, rowsPerItem, onTileChange },
  ref
) {
  const { handleScrollNext, handleScrollPrev, date, isLoading, cols, startDate } = useCalendar();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const refRight = useRef<HTMLSpanElement>(null);
  const refLeft = useRef<HTMLSpanElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const gridBounds = useRef<DOMRect | null>(null);
  const startRowIndexRef = useRef<number>(0);

  const theme = useTheme();

  const handleResize = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const width = getCanvasWidth();
      const height = rows * boxHeight + 1;
      resizeCanvas(ctx, width, height);
      drawGrid(ctx, zoom, rows, cols, startDate, theme);
    },
    [cols, startDate, rows, zoom, theme]
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const onResize = () => handleResize(ctx);

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, [handleResize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.style.letterSpacing = "1px";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    handleResize(ctx);
  }, [date, rows, zoom, handleResize]);

  useEffect(() => {
    if (!refRight.current) return;
    const observerRight = new IntersectionObserver(
      (e) => (e[0].isIntersecting ? handleScrollNext() : null),
      { root: document.getElementById(outsideWrapperId) }
    );
    observerRight.observe(refRight.current);

    return () => observerRight.disconnect();
  }, [handleScrollNext]);

  useEffect(() => {
    if (!refLeft.current) return;
    const observerLeft = new IntersectionObserver(
      (e) => (e[0].isIntersecting ? handleScrollPrev() : null),
      {
        root: document.getElementById(outsideWrapperId),
        rootMargin: `0px 0px 0px -${leftColumnWidth}px`
      }
    );
    observerLeft.observe(refLeft.current);

    return () => observerLeft.disconnect();
  }, [handleScrollPrev]);

  useEffect(() => {
    const el = (ref as React.RefObject<HTMLDivElement>).current;
    if (!el) return;
    const updateBounds = () => {
      gridBounds.current = el.getBoundingClientRect();
    };
    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, [ref]);

  const snapX = useCallback(
    (clientX: number, rect?: DOMRect) => {
      const bounds = rect ?? gridBounds.current;
      if (!bounds) return 0;
      const localX = clientX - bounds.left;
      // choose cell width based on zoom
      const cellWidth = zoom === 2 ? zoom2ColumnWidth : zoom === 1 ? dayWidth : weekWidth;
      const snapped = Math.max(0, Math.round(localX / cellWidth) * cellWidth);
      return snapped;
    },
    [zoom]
  );

  const snapYRowIndex = useCallback(
    (clientY: number, rect?: DOMRect) => {
      const bounds = rect ?? gridBounds.current;
      if (!bounds) return 0;
      const localY = clientY - bounds.top;
      const rowIndex = Math.min(Math.max(0, Math.floor(localY / boxHeight)), rows - 1);
      return rowIndex;
    },
    [rows]
  );

  const selectionStyle = useMemo(() => {
    if (!isDragging || !dragStart || !dragCurrent) return undefined;
    const left = Math.min(dragStart.x, dragCurrent.x);
    const width = Math.abs(dragCurrent.x - dragStart.x);
    const top = startRowIndexRef.current * boxHeight + 2; // +2 for border fine tuning
    return { left, top, width } as const;
  }, [dragCurrent, dragStart, isDragging]);

  const getCellWidthAndUnit = useCallback((): { cellWidth: number; unit: dayjs.ManipulateType } => {
    switch (zoom) {
      case 2:
        return { cellWidth: zoom2ColumnWidth, unit: "hours" };
      case 1:
        return { cellWidth: dayWidth, unit: "days" };
      default:
        return { cellWidth: weekWidth, unit: "weeks" };
    }
  }, [zoom]);

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      // start selection only when clicking empty grid area (not on existing tile/button)
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "BUTTON" || target.closest("button"))) return;
      if (e.button !== 0) return; // left click only
      const bounds = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      gridBounds.current = bounds;
      setIsDragging(true);
      startRowIndexRef.current = snapYRowIndex(e.clientY, bounds);
      setDragStart({ x: snapX(e.clientX, bounds), y: e.clientY });
      setDragCurrent({ x: snapX(e.clientX, bounds), y: e.clientY });
    },
    [snapX, snapYRowIndex]
  );

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent) => {
      if (!isDragging) return;
      const bounds = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      gridBounds.current = bounds;
      setDragCurrent({ x: snapX(e.clientX, bounds), y: e.clientY });
    },
    [isDragging, snapX]
  );

  const handleMouseUp = useCallback(
    (e: ReactMouseEvent) => {
      if (!isDragging || !dragStart) return;
      const bounds = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      gridBounds.current = bounds;
      const endX = snapX(e.clientX, bounds);
      const startX = dragStart.x;
      const leftX = Math.min(startX, endX);
      const rightX = Math.max(startX, endX);
      const rowIndex = startRowIndexRef.current;
      // Map visible row index to resource index considering multiple rows per resource
      let acc = 0;
      let resourceIndex = 0;
      for (let i = 0; i < rowsPerItem.length; i++) {
        acc += rowsPerItem[i];
        if (rowIndex < acc) {
          resourceIndex = i;
          break;
        }
      }
      const resource = data[resourceIndex];
      if (resource && onGridSelect) {
        const { cellWidth, unit } = getCellWidthAndUnit();
        const base = dayjs(
          `${startDate.year}-${startDate.month + 1}-${startDate.dayOfMonth}T${startDate.hour}:00:00`
        );
        const startIdx = Math.round(leftX / cellWidth);
        const endIdxExclusive = Math.round(rightX / cellWidth);
        const endIdxInclusive = Math.max(startIdx, endIdxExclusive - 1);
        const start = base.add(startIdx, unit).toDate();
        const end = base.add(endIdxInclusive, unit).toDate();
        onGridSelect({
          resourceId: resource.id,
          resourceLabel: resource.label,
          startDate: start,
          endDate: end
        });
      }
      setIsDragging(false);
      setDragStart(null);
      setDragCurrent(null);
    },
    [
      data,
      dragStart,
      getCellWidthAndUnit,
      isDragging,
      onGridSelect,
      rowsPerItem,
      snapX,
      snapYRowIndex,
      startDate
    ]
  );

  return (
    <StyledWrapper id={canvasWrapperId}>
      <StyledInnerWrapper
        ref={ref}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}>
        <StyledSpan position="left" ref={refLeft} />
        <Loader isLoading={isLoading} position="left" />
        <StyledCanvas ref={canvasRef} />
        <Tiles
          data={data}
          zoom={zoom}
          onTileClick={onTileClick}
          rowsPerItem={rowsPerItem}
          onTileChange={onTileChange}
        />
        {isDragging && selectionStyle && (
          <StyledSelection
            style={{
              left: selectionStyle.left,
              top: selectionStyle.top,
              width: selectionStyle.width
            }}
          />
        )}
        <StyledSpan ref={refRight} position="right" />
        <Loader isLoading={isLoading} position="right" />
      </StyledInnerWrapper>
    </StyledWrapper>
  );
});

export default Grid;
