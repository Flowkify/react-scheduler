import { PaginatedSchedulerData, SchedulerProjectData, TileChangeData } from "@/types/global";

export type TilesProps = {
  zoom: number;
  data: PaginatedSchedulerData;
  onTileClick?: (data: SchedulerProjectData) => void;
  rowsPerItem: number[];
  onTileChange?: (data: TileChangeData) => void;
};

export type PlacedTiles = JSX.Element[];
