import {
  GridSelectionData,
  PaginatedSchedulerData,
  SchedulerProjectData,
  TileChangeData
} from "@/types/global";

export type GridProps = {
  zoom: number;
  rows: number;
  data: PaginatedSchedulerData;
  onTileClick?: (data: SchedulerProjectData) => void;
  onGridSelect?: (data: GridSelectionData) => void;
  rowsPerItem: number[];
  onTileChange?: (data: TileChangeData) => void;
};

export type StyledSpanProps = {
  position: "left" | "right";
};
