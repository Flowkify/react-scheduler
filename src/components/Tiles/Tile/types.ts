import { SchedulerProjectData, TileChangeData } from "@/types/global";

export type TileProps = {
  row: number;
  data: SchedulerProjectData;
  zoom: number;
  onTileClick?: (data: SchedulerProjectData) => void;
  rowsPerItem: number[];
  onTileChange?: (data: TileChangeData) => void;
  resourceId?: string;
};

export type StyledTextProps = {
  bold?: boolean;
};
