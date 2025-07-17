import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  AlertTriangleIcon,
  ArrowUpIcon,
  Loader2,
  RefreshCw,
  TrendingUp,
  Database,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import UniversalChart from "./charts/chart-builder";

interface ColumnAnalysis {
  null_count: number;
  unique_count: number;
  dtype: string;
  [key: string]: any;
}
interface DashboardData {
  profile: {
    basic_info: {
      shape: { rows: number; columns: number };
      columns: string[];
      memory_usage: {
        total_bytes: number;
        total_mb: number;
        per_row_bytes: number;
      };
    };
    missing_values: Record<string, number>;
    data_quality: {
      completeness_score: number;
      [key: string]: any;
    };
    column_analysis: Record<string, ColumnAnalysis>;
  };
  success: boolean;
  message: string;
}

interface DashboardProps {
  taskId: string | null;
  canFetch: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const Dashboard: React.FC<DashboardProps> = ({ taskId, canFetch }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (taskId && canFetch) {
      fetchDashboardData();
    } else {
      setDashboardData(null);
    }
  }, [taskId, canFetch]);

  const fetchDashboardData = async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/profile/${taskId}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      setDashboardData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  const renderDataOverview = () => {
    if (!dashboardData?.profile) return null;

    const {
      basic_info: { shape, memory_usage },
      column_analysis,
    } = dashboardData.profile;

    const totalMissing = Object.values(column_analysis).reduce(
      (sum, col) => sum + (col.null_count ?? 0),
      0
    );

    const completeness = (
      (1 - totalMissing / (shape.rows * shape.columns)) *
      100
    ).toFixed(1);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dataset Dimension
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shape.rows.toLocaleString()} × {shape.columns}
            </div>
            <p className="text-xs text-muted-foreground">
              rows &#10006; columns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completeness}%</div>
            <p className="text-xs text-muted-foreground">completeness</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memory_usage.total_mb} MB</div>
            <p className="text-xs text-muted-foreground">in memory</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderColumnInfo = () => {
    if (!dashboardData?.profile) return null;
    const { basic_info, column_analysis } = dashboardData.profile;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Column Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {basic_info.columns.map((column) => {
              const colData = column_analysis[column];
              return (
                <div key={column} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{column}</span>
                    <Badge variant="secondary">
                      {colData?.dtype || "unknown"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Missing: {colData?.null_count ?? 0}</div>
                    <div>Unique: {colData?.unique_count ?? 0}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    if (!taskId) {
      return (
        <div className="text-center space-y-4">
          <Link
            href="#uploader"
            className="text-muted-foreground flex items-center justify-center gap-1"
          >
            Please upload a CSV file to see your data visualizations
            <ArrowUpIcon className="size-4" />
          </Link>
        </div>
      );
    }

    if (loading || !canFetch) {
      return (
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Analyzing your data and generating insights...</span>
        </div>
      );
    }

    if (error) {
      return (
        <Alert className="max-w-md mx-auto">
          <AlertDescription className="space-y-4">
            <span className="text-sm text-destructive text-center w-full flex items-center justify-center gap-1">
              <AlertTriangleIcon className="size-4" />
              {error}
            </span>
            <Button
              onClick={fetchDashboardData}
              className="w-full mt-auto"
              size="sm"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="w-full max-w-6xl space-y-6">
        {renderDataOverview()}
        {renderColumnInfo()}

        {dashboardData?.profile.basic_info.columns && (
          <UniversalChart
            taskId={taskId}
            apiUrl={API_URL}
            columns={dashboardData.profile.basic_info.columns}
          />
        )}
      </div>
    );
  };

  return (
    <section
      id="dashboard"
      className="min-h-screen flex flex-col items-center justify-center gap-10 py-12 md:py-24 px-4"
    >
      <div className="w-full text-center space-y-4">
        <h1 className="text-3xl lg:text-6xl font-extrabold text-center scroll-m-20">
          Step 2: Explore Data & Insights
        </h1>
        <p className="text-sm">
          Visualize your data, detect trends, and examine relationships. See the
          story your data tells.
        </p>
        <Button
          className="w-full sm:w-fit text-blue-600"
          variant="link"
          disabled={taskId === null}
        >
          <Link href="#prediction">Test the model</Link>
        </Button>
      </div>

      {renderContent()}
    </section>
  );
};

export default Dashboard;
