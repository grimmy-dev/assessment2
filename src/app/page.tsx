"use client";
import { useState, useCallback } from "react";
import HeroSection from "@/components/hero-section";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import Predictor from "@/components/prediction/predictor";
import Uploader from "@/components/uploader";
import Footer from "@/components/footer";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function Home() {
  // Global state for task management
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [canFetchDashboard, setCanFetchDashboard] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");

  // Global state handlers
  const handleTaskIdChange = useCallback((taskId: string | null) => {
    setCurrentTaskId(taskId);
  }, []);

  const handleCanFetchChange = useCallback((canFetch: boolean) => {
    setCanFetchDashboard(canFetch);
  }, []);

  const handleUploadStatusChange = useCallback((status: UploadStatus) => {
    setUploadStatus(status);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentTaskId(null);
    setCanFetchDashboard(false);
    setUploadStatus("idle");
  }, []);

  return (
    <MaxWidthWrapper>
      <HeroSection />
      <Uploader
        currentTaskId={currentTaskId}
        canFetchDashboard={canFetchDashboard}
        uploadStatus={uploadStatus}
        onTaskIdChange={handleTaskIdChange}
        onCanFetchChange={handleCanFetchChange}
        onUploadStatusChange={handleUploadStatusChange}
        onReset={handleReset}
      />
      <Predictor
        taskId={currentTaskId}
        canFetch={canFetchDashboard}
        uploadStatus={uploadStatus}
      />
      <Footer/>
    </MaxWidthWrapper>
  );
}
