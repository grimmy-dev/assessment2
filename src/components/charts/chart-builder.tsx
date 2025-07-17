import React, { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  LineChart as LineIcon,
  BarChart2,
  PieChart as PieIcon,
  AreaChartIcon,
  ScatterChart as ScatterIcon,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

interface UniversalChartProps {
  taskId: string;
  apiUrl: string;
  columns: string[];
}

const chartTypes = [
  { value: "scatter", label: "Scatter", icon: ScatterIcon },
  { value: "bar", label: "Bar", icon: BarChart2 },
  { value: "line", label: "Line", icon: LineIcon },
  { value: "area", label: "Area", icon: AreaChartIcon },
  { value: "pie", label: "Pie", icon: PieIcon },
  { value: "histogram", label: "Histogram", icon: BarChart3 },
];

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7f50",
  "#a4de6c",
  "#d0ed57",
  "#888",
  "#8dd1e1",
  "#d084d0",
  "#ffb347",
  "#87ceeb",
  "#dda0dd",
  "#f0e68c",
  "#ff6347",
];

const chartConfig = {
  scatter: { label: "Scatter Plot", color: "var(--chart-1)" },
  bar: { label: "Bar Chart", color: "var(--chart-2)" },
  line: { label: "Line Chart", color: "var(--chart-3)" },
  area: { label: "Area Chart", color: "var(--chart-4)" },
  pie: { label: "Pie Chart", color: "var(--chart-5)" },
  histogram: { label: "Histogram", color: "var(--chart-1)" },
} as const;

const UniversalChart: React.FC<UniversalChartProps> = ({
  taskId,
  apiUrl,
  columns,
}) => {
  const [xAxis, setXAxis] = useState<string>(columns[0]);
  const [yAxis, setYAxis] = useState<string>(columns[1]);
  const [chartType, setChartType] = useState<string>("scatter");
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<number>(100);
  const [returnedRows, setReturnedRows] = useState<number>(0); // optional, for UX

  const needsYAxis = !["pie", "histogram"].includes(chartType);

  useEffect(() => {
    if (xAxis && (yAxis || !needsYAxis)) {
      fetchChartData();
    }
  }, [xAxis, yAxis, chartType, rows]);

  const fetchChartData = async () => {
    if (!xAxis || (needsYAxis && !yAxis)) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        x_axis: xAxis,
        chart_type: chartType,
        limit: String(rows), // attach rows to limit
      });

      if (needsYAxis && yAxis) {
        params.append("y_axis", yAxis);
      }

      const response = await fetch(`${apiUrl}/chart-data/${taskId}?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setChartData(result.data || []);
      setReturnedRows(result.returned_rows || 0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch chart data"
      );
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-sm text-muted-foreground">Loading chart...</div>
        </div>
      );
    }

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer>
            <ChartContainer config={chartConfig} className="w-full h-96">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="x"
                  className="text-xs"
                  tickMargin={8}
                  label={{
                    value: xAxis,
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  dataKey="y"
                  className="text-xs"
                  tickMargin={8}
                  width={80}
                  label={{
                    value: yAxis || "y axis",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      textAnchor: "middle",
                    },
                  }}
                />

                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="y" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer>
            <ChartContainer config={chartConfig} className="w-full h-96">
              <LineChart data={chartData}>
                <CartesianGrid horizontal={false} />
                <XAxis
                  dataKey="x"
                  className="text-xs"
                  tickMargin={8}
                  label={{
                    value: xAxis,
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  dataKey="y"
                  className="text-xs"
                  tickMargin={8}
                  width={80}
                  label={{
                    value: yAxis || "y axis",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      textAnchor: "middle",
                    },
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer>
            <ChartContainer config={chartConfig} className="w-full h-96">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {chartData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer>
            <ChartContainer config={chartConfig} className="w-full h-96">
              <AreaChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="x"
                  className="text-xs"
                  tickMargin={8}
                  label={{
                    value: xAxis,
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  dataKey="y"
                  className="text-xs"
                  tickMargin={8}
                  width={80}
                  label={{
                    value: yAxis || "y axis",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      textAnchor: "middle",
                    },
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="y"
                  stroke="#8884d8"
                  fill="url(#areaFill)"
                />
              </AreaChart>
            </ChartContainer>
          </ResponsiveContainer>
        );

      case "scatter":
        return (
          <ResponsiveContainer>
            <ChartContainer config={chartConfig} className="w-full h-96">
              <ScatterChart>
                <CartesianGrid />
                <XAxis
                  dataKey="x"
                  className="text-xs"
                  tickMargin={8}
                  label={{
                    value: xAxis,
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  dataKey="y"
                  className="text-xs"
                  tickMargin={8}
                  width={80}
                  label={{
                    value: yAxis || "y axis",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      textAnchor: "middle",
                    },
                  }}
                />
                <ChartTooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Scatter
                  name="Data Points"
                  data={chartData}
                  fill="var(--chart-1)"
                />
              </ScatterChart>
            </ChartContainer>
          </ResponsiveContainer>
        );

      case "histogram":
        return (
          <ResponsiveContainer>
            <ChartContainer config={chartConfig} className="w-full h-96">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="x"
                  className="text-xs"
                  tickMargin={8}
                  label={{
                    value: xAxis,
                    position: "bottom",
                    offset: -5,
                  }}
                />
                <YAxis className="text-xs" tickMargin={8} />

                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar dataKey="x" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </ResponsiveContainer>
        );

      default:
        return <p className="text-muted-foreground">Unsupported chart type</p>;
    }
  };

  return (
    <Card className="w-full h-full col-span-4">
      <CardHeader>
        <CardTitle>Create Custom Chart</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-start gap-6 px-4">
          {/* X Axis */}
          <div className="flex items-center justify-center gap-2 flex-1">
            <span className="text-xs text-nowrap">Select X Axis:</span>
            <Select defaultValue={xAxis} onValueChange={setXAxis}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="X Axis" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Y Axis */}
          {needsYAxis && (
            <div
              defaultValue={yAxis}
              className="flex items-center justify-center gap-2 flex-1"
            >
              <span className="text-xs text-nowrap">Select Y Axis:</span>
              <Select onValueChange={setYAxis}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Y Axis" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Chart Type */}
          <div className="flex items-center justify-center gap-2 flex-1">
            <span className="text-xs text-nowrap">Chart Type</span>
            <Select onValueChange={setChartType} defaultValue="scatter">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                {chartTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number of Rows */}
          <div className="flex items-center justify-center gap-2 flex-1">
            <span className="text-xs text-nowrap">Rows to Show:</span>
            <Select
              onValueChange={(value) => setRows(Number(value))}
              defaultValue="100"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent>
                {[50, 100, 200, 500].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chart Result */}
        {renderChart()}

        {/* Optional: Display error */}
        {error && (
          <p className="text-sm text-red-500 text-center mt-4">
            Error: {error}
          </p>
        )}
        {!loading && chartData.length > 0 && (
          <p className="text-xs text-muted-foreground text-right">
            Showing {returnedRows} rows
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default UniversalChart;
