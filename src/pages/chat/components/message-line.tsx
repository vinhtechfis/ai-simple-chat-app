import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Box, Typography } from "@mui/material";
import { EChartsOption } from "echarts";
import { Icon } from "@iconify/react";
import { marked } from "marked";

interface ChartData {
  xAxis: {
    data: string[];
  };
  series: Array<{
    name: string;
    data: number[];
    type: "bar" | "line" | "pie";
  }>;
}

const ChartComponent = ({ data }: { data: ChartData }) => {
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    if (data) {
      setChartData({
        xAxis: data.xAxis,
        series: data.series.map((item) => ({
          name: item.name,
          data: item.data,
          type: item.type,
        })),
      });
    }
  }, [data]);

  const chartOptions: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    xAxis: {
      type: "category",
      data: chartData?.xAxis.data || [],
    },
    yAxis: {
      type: "value",
    },
    series: chartData?.series || [],
  };

  return (
    <Box>
      <ReactECharts option={chartOptions} style={{ height: "400px" }} />
    </Box>
  );
};

export default function MessageLine({
  message,
  files = [],
  type,
}: {
  message: string;
  files?: { name: string; url: string }[];
  type: string;
}) {
  const isAI = type === "ai";
  let parsedChartData: ChartData | null = null;
  let beforeJSON = "";
  let afterJSON = "";
  let hasChart = false;

  try {
    const jsonRegex = /```json\s*([\s\S]*?)```/i;
    const fallbackRegex = /({[\s\S]*})/;

    const jsonMatch = message.match(jsonRegex) || message.match(fallbackRegex);

    if (jsonMatch) {
      const fullMatch = jsonMatch[0];
      const jsonString = jsonMatch[1] || jsonMatch[0];

      const parsed = JSON.parse(jsonString.trim());
      if (parsed?.xAxis?.data && parsed?.series) {
        parsedChartData = parsed;
        hasChart = true;

        const splitIndex = message.indexOf(fullMatch);
        beforeJSON = message.slice(0, splitIndex);
        afterJSON = message.slice(splitIndex + fullMatch.length);
      }
    }
  } catch (e) {
    console.warn("Failed to parse chart JSON:", e);
  }



  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isAI ? "flex-start" : "flex-end",
        width: "100%",
        mb: 1,
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1,
          borderRadius: 2,
          maxWidth: "70%",
          bgcolor: isAI ? "transparent" : "#e0f7fa",
          color: "text.primary",
          border: isAI ? "1px solid #ccc" : "none",
        }}
      >
        {isAI ? (
          message === "..." ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Icon icon="eos-icons:loading" width="24" height="24" />
              <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                AI đang trả lời...
              </Typography>
            </Box>
          ) : (
            <>
              {hasChart ? (
                <>
                  {beforeJSON && (
                    <Box
                      sx={{
                        fontSize: "0.95rem",
                        lineHeight: 1.6,
                        "& p": { margin: "8px 0" },
                        "& ul": { paddingLeft: "1.2em", margin: "8px 0" },
                        "& ol": { paddingLeft: "1.2em", margin: "8px 0" },
                        "& code": {
                          fontFamily: "monospace",
                          backgroundColor: "#f5f5f5",
                          px: 0.5,
                          borderRadius: 1,
                        },
                        "& pre": {
                          backgroundColor: "#f5f5f5",
                          padding: "8px",
                          borderRadius: 2,
                          overflowX: "auto",
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                        },
                        "& a": {
                          color: "#0072e5",
                          textDecoration: "underline",
                          wordBreak: "break-word",
                        },
                      }}
                      dangerouslySetInnerHTML={{ __html: marked(beforeJSON) }}
                    />
                  )}

                  <ChartComponent data={parsedChartData!} />

                  {afterJSON && (
                    <Box
                      sx={{
                        fontSize: "0.95rem",
                        lineHeight: 1.6,
                        mt: 1,
                        "& p": { margin: "8px 0" },
                        "& ul": { paddingLeft: "1.2em", margin: "8px 0" },
                        "& ol": { paddingLeft: "1.2em", margin: "8px 0" },
                        "& code": {
                          fontFamily: "monospace",
                          backgroundColor: "#f5f5f5",
                          px: 0.5,
                          borderRadius: 1,
                        },
                        "& pre": {
                          backgroundColor: "#f5f5f5",
                          padding: "8px",
                          borderRadius: 2,
                          overflowX: "auto",
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                        },
                        "& a": {
                          color: "#0072e5",
                          textDecoration: "underline",
                          wordBreak: "break-word",
                        },
                      }}
                      dangerouslySetInnerHTML={{ __html: marked(afterJSON) }}
                    />
                  )}
                </>
              ) : (
                <Box
                  sx={{
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                    "& p": { margin: "8px 0" },
                    "& ul": { paddingLeft: "1.2em", margin: "8px 0" },
                    "& ol": { paddingLeft: "1.2em", margin: "8px 0" },
                    "& code": {
                      fontFamily: "monospace",
                      backgroundColor: "#f5f5f5",
                      px: 0.5,
                      borderRadius: 1,
                    },
                    "& pre": {
                      backgroundColor: "#f5f5f5",
                      padding: "8px",
                      borderRadius: 2,
                      overflowX: "auto",
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                    },
                    "& a": {
                      color: "#0072e5",
                      textDecoration: "underline",
                      wordBreak: "break-word",
                    },
                  }}
                  dangerouslySetInnerHTML={{ __html: marked(message || "") }}
                />
              )}
            </>
          )
        ) : (
          <Typography variant="body2">{message}</Typography>
        )}

        {files.length > 0 && (
          <Box mt={1}>
            {files.map((file, idx) => (
              <Typography
                key={idx}
                variant="caption"
                color="primary"
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = file.url;
                  link.setAttribute("download", file.name);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(file.url);
                }}
              >
                📎 {file.name}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
