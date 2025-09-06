import { FC } from "react";
import { useLanguage } from "@/context/LocaleProvider";
import { Icon } from "@/components";
import { TooltipData } from "@/types/global";

const rowStyle: React.CSSProperties = { display: "flex", alignItems: "center", marginBottom: 8 };
const textStyle: React.CSSProperties = { marginLeft: 4, fontSize: 10, color: "#fff" };

const CustomToolTipExample: FC<{ tooltipData: TooltipData }> = ({ tooltipData }) => {
  const { taken, free, over } = useLanguage();
  const { disposition, project } = tooltipData;

  const title = project?.title || "Unknown Title";
  const subtitle = project?.subtitle || "Unknown Subtitle";
  const description = project?.description || "No description available";

  return (
    <div>
      <div style={rowStyle}>
        <Icon iconName="calendarWarning" height="14" />
        <span style={textStyle}>
          {`${taken}: ${disposition.taken.hours}h ${disposition.taken.minutes}m`}
        </span>
        {(disposition.overtime.hours > 0 || disposition.overtime.minutes > 0) && (
          <span
            style={{
              ...textStyle,
              fontWeight: 600
            }}>
            {`${disposition.overtime.hours}h ${disposition.overtime.minutes}m ${over}`}
          </span>
        )}
      </div>

      <div style={rowStyle}>
        <Icon iconName="calendarFree" height="14" />
        <span style={textStyle}>
          {`${free}: ${disposition.free.hours}h ${disposition.free.minutes}m`}
        </span>
      </div>

      <div style={rowStyle}>
        <Icon iconName="defaultAvatar" height="14" />
        <span style={textStyle}>{`Title: ${title}`}</span>
      </div>

      <div style={rowStyle}>
        <Icon iconName="filter" height="14" />
        <span style={textStyle}>{`Subtitle: ${subtitle}`}</span>
      </div>

      <div style={{ ...rowStyle, marginBottom: 0 }}>
        <Icon iconName="search" height="14" />
        <span style={textStyle}>{`Description: ${description}`}</span>
      </div>
    </div>
  );
};

export default CustomToolTipExample;
