import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import { createMockData } from "./mock/appMock";
import { ParsedDatesRange } from "./utils/getDatesRange";
import {
  ConfigFormValues,
  GridSelectionData,
  SchedulerProjectData,
  TileChangeData
} from "./types/global";
import ConfigPanel from "./components/ConfigPanel";
import { StyledSchedulerFrame } from "./styles";
import { Scheduler } from ".";

function App() {
  const [values, setValues] = useState<ConfigFormValues>({
    peopleCount: 15,
    projectsPerYear: 5,
    yearsCovered: 0,
    startDate: undefined,
    maxRecordsPerPage: 50,
    isFullscreen: true
  });

  const { peopleCount, projectsPerYear, yearsCovered, isFullscreen, maxRecordsPerPage } = values;

  const mocked = useMemo(
    () => createMockData(+peopleCount, +yearsCovered, +projectsPerYear),
    [peopleCount, projectsPerYear, yearsCovered]
  );

  const [range, setRange] = useState<ParsedDatesRange>({
    startDate: new Date(),
    endDate: new Date()
  });

  const handleRangeChange = useCallback((range: ParsedDatesRange) => {
    setRange(range);
  }, []);

  const filteredData = useMemo(
    () =>
      mocked.map((person) => ({
        ...person,
        data: person.data.filter(
          (project) =>
            dayjs(project.startDate).isBetween(range.startDate, range.endDate) ||
            dayjs(project.endDate).isBetween(range.startDate, range.endDate) ||
            (dayjs(project.startDate).isBefore(range.startDate, "day") &&
              dayjs(project.endDate).isAfter(range.endDate, "day"))
        )
      })),
    [mocked, range.endDate, range.startDate]
  );

  const handleFilterData = () => console.log(`Filters button was clicked.`);

  const handleTileClick = (data: SchedulerProjectData) =>
    console.log(
      `Item ${data.title} - ${data.subtitle} was clicked. \n==============\nStart date: ${data.startDate} \n==============\nEnd date: ${data.endDate}\n==============\nOccupancy: ${data.occupancy}`
    );

  const [lastGridSelection, setLastGridSelection] = useState<GridSelectionData | null>(null);
  const [lastTileChange, setLastTileChange] = useState<TileChangeData | null>(null);
  const handleGridSelect = (sel: GridSelectionData) => {
    setLastGridSelection(sel);
    console.log(
      `Grid selection -> Resource: ${sel.resourceLabel.title} (${
        sel.resourceId
      }) | Start: ${sel.startDate.toISOString()} | End: ${sel.endDate.toISOString()}`
    );
  };

  return (
    <>
      <ConfigPanel values={values} onSubmit={setValues} />
      {isFullscreen ? (
        <Scheduler
          startDate={values.startDate ? new Date(values.startDate).toISOString() : undefined}
          onRangeChange={handleRangeChange}
          data={filteredData}
          isLoading={false}
          onTileClick={handleTileClick}
          onFilterData={handleFilterData}
          config={{
            zoom: 0,
            maxRecordsPerPage: maxRecordsPerPage,
            showThemeToggle: true
          }}
          onItemClick={(data) => console.log("clicked: ", data)}
          onGridSelect={handleGridSelect}
          onTileChange={(payload) => {
            setLastTileChange(payload);
            console.log(
              `Tile change -> Project: ${payload.projectId}, Resource: ${
                payload.resourceId
              } (prev: ${
                payload.previousResourceId ?? "-"
              }) | Start: ${payload.startDate.toISOString()} | End: ${payload.endDate.toISOString()}`
            );
          }}
        />
      ) : (
        <StyledSchedulerFrame>
          <Scheduler
            startDate={values.startDate ? new Date(values.startDate).toISOString() : undefined}
            onRangeChange={handleRangeChange}
            isLoading={false}
            data={filteredData}
            onTileClick={handleTileClick}
            onFilterData={handleFilterData}
            onItemClick={(data) => console.log("clicked: ", data)}
            onGridSelect={handleGridSelect}
            onTileChange={(payload) => {
              setLastTileChange(payload);
              console.log(
                `Tile change -> Project: ${payload.projectId}, Resource: ${
                  payload.resourceId
                } (prev: ${
                  payload.previousResourceId ?? "-"
                }) | Start: ${payload.startDate.toISOString()} | End: ${payload.endDate.toISOString()}`
              );
            }}
          />
        </StyledSchedulerFrame>
      )}
      {(lastGridSelection || lastTileChange) && (
        <div
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            padding: 12,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 6,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            fontSize: 12
          }}>
          {lastGridSelection && (
            <>
              <div>
                <strong>Last grid selection</strong>
              </div>
              <div>
                Resource: {lastGridSelection.resourceLabel.title} ({lastGridSelection.resourceId})
              </div>
              <div>Start: {new Date(lastGridSelection.startDate).toLocaleString()}</div>
              <div>End: {new Date(lastGridSelection.endDate).toLocaleString()}</div>
            </>
          )}
          {lastTileChange && (
            <>
              <div style={{ marginTop: 8 }}>
                <strong>Last tile change</strong>
              </div>
              <div>Project: {lastTileChange.projectId}</div>
              <div>
                Resource: {lastTileChange.resourceId} (prev:{" "}
                {lastTileChange.previousResourceId ?? "-"})
              </div>
              <div>Start: {new Date(lastTileChange.startDate).toLocaleString()}</div>
              <div>End: {new Date(lastTileChange.endDate).toLocaleString()}</div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default App;
