import {
  Config,
  SchedulerData,
  SchedulerItemClickData,
  SchedulerProjectData,
  GridSelectionData,
  TileChangeData
} from "@/types/global";
import { ParsedDatesRange } from "@/utils/getDatesRange";

export type SchedulerProps = {
  data: SchedulerData;
  isLoading?: boolean;
  config?: Config;
  startDate?: string;
  onRangeChange?: (range: ParsedDatesRange) => void;
  onTileClick?: (data: SchedulerProjectData) => void;
  onFilterData?: () => void;
  onClearFilterData?: () => void;
  onItemClick?: (data: SchedulerItemClickData) => void;
  /** Called when user drags on empty grid to create a new selection */
  onGridSelect?: (data: GridSelectionData) => void;
  /** Called when user drags/resizes an existing tile */
  onTileChange?: (data: TileChangeData) => void;
};

export type StyledOutsideWrapperProps = {
  showScroll: boolean;
};
