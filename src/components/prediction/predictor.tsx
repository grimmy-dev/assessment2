"use client";
import React, { useState } from "react";
import InputTable from "./input-table";
import OutputDisplayer from "./output-displayer";
import { Button } from "../ui/button";
import Link from "next/link";

interface PredictionResult {
  success: boolean;
  prediction: any;
  prediction_proba?: { [key: string]: number };
  input_data: { [key: string]: any };
  model_type: string;
  error?: string;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface PredictorProps {
  taskId: string | null;
  canFetch: boolean;
  uploadStatus: UploadStatus;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const Predictor: React.FC<PredictorProps> = ({
  taskId,
  canFetch,
  uploadStatus,
}) => {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [targetColumn, setTargetColumn] = useState<string>("");

  const handlePredict = async (inputData: any) => {
    // Only allow predictions if we have a taskId and can fetch
    if (!taskId || !canFetch) {
      console.error("Cannot make prediction: No task ID or fetch not allowed");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task_id: taskId,
          input_data: inputData,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setPredictions((prev) => [...prev, result]);
      } else {
        const error = await response.json();
        setPredictions((prev) => [
          ...prev,
          {
            success: false,
            prediction: null,
            input_data: inputData,
            model_type: "unknown",
            error: error.detail,
          },
        ]);
      }
    } catch (error) {
      console.error("Error making prediction:", error);
      setPredictions((prev) => [
        ...prev,
        {
          success: false,
          prediction: null,
          input_data: inputData,
          model_type: "unknown",
          error: "Network error",
        },
      ]);
    }
  };

  const handleTrain = (targetCol: string) => {
    setTargetColumn(targetCol);
    // Clear previous predictions when retraining
    setPredictions([]);
  };

  // Don't render the component if conditions aren't met
  if (!taskId || !canFetch || uploadStatus !== "success") {
    return (
      <section
        id="prediction"
        className="min-h-screen flex flex-col items-center justify-center gap-10"
      >
        <div className="text-center space-y-4">
          <h1 className="text-3xl lg:text-6xl font-extrabold scroll-m-20">
            Step 3: Test Predictions
          </h1>
          <p className="text-sm text-muted-foreground">
            {uploadStatus === "idle" && "Please upload a CSV file first"}
            {uploadStatus === "uploading" && "Processing your data..."}
            {uploadStatus === "error" && "Upload failed. Please try again."}
            {uploadStatus === "success" &&
              !canFetch &&
              "Preparing prediction interface..."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="prediction"
      className="min-h-[90vh] flex flex-col items-center justify-center gap-10"
    >
      <div className="text-center space-y-4">
        <h1 className="text-3xl lg:text-6xl font-extrabold scroll-m-20">
          Step 3: Test Predictions
        </h1>
        <p className="text-sm">
          Test your model with custom inputs and see real-time results
        </p>
        {taskId && (
          <p className="text-xs text-muted-foreground">Task ID: {taskId}</p>
        )}
      </div>
      <div className="flex w-full gap-4 items-start justify-start">
        <InputTable
          taskId={taskId}
          canFetch={canFetch}
          onPredict={handlePredict}
          onTrain={handleTrain}
        />
        <OutputDisplayer
          predictions={predictions}
          targetColumn={targetColumn}
        />
      </div>
      <Button asChild className="w-fit mx-auto" variant='link'>
        <Link href="#uploader">Upload again</Link>
      </Button>
    </section>
  );
};

export default Predictor;
