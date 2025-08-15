import {
  GridSelectionData,
  SchedulerData,
  SchedulerItemClickData,
  SchedulerProjectData,
  TileChangeData
} from "@/types/global";

export type CalendarProps = {
  data: SchedulerData;
  topBarWidth: number;
  onTileClick?: (data: SchedulerProjectData) => void;
  onItemClick?: (data: SchedulerItemClickData) => void;
  toggleTheme?: () => void;
  onGridSelect?: (data: GridSelectionData) => void;
  onTileChange?: (data: TileChangeData) => void;
};

export type StyledSpanProps = {
  position: "left" | "right";
};

export type ProjectsData = [projectsPerPerson: SchedulerProjectData[][][], rowsPerPerson: number[]];
