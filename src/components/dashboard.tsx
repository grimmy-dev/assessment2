import React from "react";
import { Chart1 } from "./charts/chart-1";
import { Chart2 } from "./charts/chart-2";
import { Chart3 } from "./charts/chart-3";
import { Chart4 } from "./charts/chart-4";
import { Chart5 } from "./charts/chart-5";
import { Button } from "./ui/button";
import Link from "next/link";

const Dashboard = () => {
  return (
    <section
      id="dashboard"
      className="min-h-screen flex flex-col items-center justify-center gap-10 py-12 md:py-24"
    >
      <div className="w-full text-center space-y-4">
        <h1 className="text-3xl lg:text-6xl font-extrabold text-center scroll-m-20">
          Step 2: Explore Data & Insights
        </h1>
        <p className="text-sm">
          Visualize your data, detect trends, and examine relationships before
          and after model training. See the story your data tells.
        </p>
        <Button asChild className="w-full sm:w-fit text-blue-600" variant='link'>
          <Link href="#prediction">Test the model</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
        {/* bar chart */}
        <Chart1 /> 
        {/* area chart */}
        <Chart2 />
        {/* bar chart horizontal */}
        <Chart3 />
        {/* line chart */}
        <Chart4 />
        pie
        <Chart5 />
      </div>
    </section>
  );
};

export default Dashboard;
