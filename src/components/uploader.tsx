"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  Upload,
  File,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import Dashboard from "./dashboard";

const fileSchema = z.object({
  file: z
    .any()
    .refine((files) => files && files.length > 0, "Please select a file")
    .refine((files) => files && files instanceof FileList, "Invalid file type")
    .refine(
      (files) =>
        files &&
        (files[0]?.type === "text/csv" || files[0]?.name.endsWith(".csv")),
      "Only CSV files are allowed"
    )
    .refine(
      (files) => files && files[0]?.size <= 50 * 1024 * 1024,
      "File size must be less than 50MB"
    ),
});

type FileFormData = z.infer<typeof fileSchema>;

type LogMessage = {
  timestamp: string;
  level: "info" | "success" | "error";
  message: string;
  progress?: number;
  finished?: boolean;
};

const Uploader = () => {
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("disconnected");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm<FileFormData>({
    resolver: zodResolver(fileSchema),
    defaultValues: {
      file: undefined,
    },
  });

  // Simple auto-scroll function - only affects logs container
  const scrollToBottom = useCallback(() => {
    if (logsContainerRef.current) {
      const container = logsContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  // Scroll to bottom when logs change
  useEffect(() => {
    scrollToBottom();
  }, [logs, scrollToBottom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const addLog = useCallback(
    (
      level: "info" | "success" | "error",
      message: string,
      progress?: number
    ) => {
      const log: LogMessage = {
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
        level,
        message,
        progress: progress || 0,
      };
      setLogs((prev) => [...prev, log]);
    },
    []
  );

  const connectWebSocket = useCallback(
    (taskId: string) => {
      if (socketRef.current) {
        socketRef.current.close();
      }

      const wsUrl = `ws://localhost:8000/ws/${taskId}`;
      console.log("Connecting to WebSocket:", wsUrl);

      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connected");
        setConnectionStatus("connected");
        addLog("info", "Connected to server");
      };

      socket.onmessage = (event) => {
        try {
          const log = JSON.parse(event.data);
          console.log("Received log:", log);

          setLogs((prev) => [...prev, log]);

          if (log.progress !== undefined) {
            setUploadProgress(log.progress);
          }

          // Only close WebSocket when task is actually finished
          if (log.finished === true) {
            if (log.level === "success") {
              setUploadStatus("success");
              // Close WebSocket connection on completion
              socket.close(1000, "Task completed successfully");
            } else if (log.level === "error") {
              setUploadStatus("error");
              // Close WebSocket connection on error
              socket.close(1000, "Task failed");
            }
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setConnectionStatus("disconnected");

        // Only try to reconnect if it was an unexpected close and we're still processing
        if (event.code !== 1000 && uploadStatus === "uploading") {
          addLog("info", "Connection lost, attempting to reconnect...");
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket(taskId);
          }, 2000);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("error");
        addLog("error", "WebSocket connection error");
      };
    },
    [addLog, uploadStatus]
  );

  const handleUpload = useCallback(
    async (file: File) => {
      setUploadStatus("uploading");
      setUploadProgress(0);
      setLogs([]);
      setCurrentTaskId(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        addLog("info", "Uploading file...", 5);

        const res = await fetch("http://localhost:8000/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res
            .json()
            .catch(() => ({ detail: "Upload failed" }));
          throw new Error(errorData.detail || "Upload failed");
        }

        const data = await res.json();
        const taskId = data.task_id;

        console.log("Upload successful, task ID:", taskId);
        setCurrentTaskId(taskId);

        addLog("success", `File uploaded successfully. Task ID: ${taskId}`);

        // Connect to WebSocket after successful upload
        connectWebSocket(taskId);
      } catch (error) {
        console.error("Upload error:", error);
        setUploadStatus("error");
        addLog("error", `Upload failed: ${error}`);
      }
    },
    [addLog, connectWebSocket]
  );

  const cancelTask = useCallback(async () => {
    if (!currentTaskId) return;

    try {
      const res = await fetch(`http://localhost:8000/cancel/${currentTaskId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        addLog("info", "Task cancelled");
        setUploadStatus("idle");
        if (socketRef.current) {
          socketRef.current.close();
        }
      }
    } catch (error) {
      console.error("Cancel error:", error);
      addLog("error", "Failed to cancel task");
    }
  }, [currentTaskId, addLog]);

  const onSubmit = useCallback(
    async (data: FileFormData) => {
      const file = data.file[0];
      await handleUpload(file);
    },
    [handleUpload]
  );

  const handleReset = useCallback(() => {
    // Cancel any active task
    if (currentTaskId && uploadStatus === "uploading") {
      cancelTask();
    }

    form.reset();
    setUploadStatus("idle");
    setUploadProgress(0);
    setUploadedFile(null);
    setLogs([]);
    setCurrentTaskId(null);
    setConnectionStatus("disconnected");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (socketRef.current) {
      socketRef.current.close();
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, [currentTaskId, uploadStatus, cancelTask, form]);

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case "uploading":
        return <Loader2 className="size-4 animate-spin" />;
      case "success":
        return <CheckCircle className="size-4 text-green-500" />;
      case "error":
        return <AlertCircle className="size-4 text-red-500" />;
      default:
        return <Upload className="size-4" />;
    }
  };

  const getCardStyle = () => {
    switch (uploadStatus) {
      case "success":
        return "border-green-900 bg-green-900/20";
      case "error":
        return "border-rose-900 bg-rose-900/20";
      case "uploading":
        return "border-blue-900 bg-blue-900/20";
      default:
        return "";
    }
  };

  return (
    <>
      <section
        id="uploader"
        className="min-h-screen flex flex-col gap-8 items-center justify-center px-4"
      >
        <div className="text-center space-y-4">
          <h1 className="text-3xl lg:text-6xl font-extrabold scroll-m-20">
            Step 1: Upload Your Data
          </h1>
          <p className="text-sm">
            Upload your CSV dataset for analysis (max 50MB)
          </p>
          {currentTaskId && (
            <p className="text-xs text-muted-foreground">
              Task ID: {currentTaskId} | Connection: {connectionStatus}
            </p>
          )}
        </div>

        <div className="w-full max-w-2xl space-y-2">
          <Card className={`transition-all duration-300 ${getCardStyle()}`}>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                {getStatusIcon()}
                {uploadStatus === "uploading"
                  ? "Processing..."
                  : uploadStatus === "success"
                  ? "Upload Complete"
                  : "Upload CSV File"}
              </CardTitle>
              <CardDescription className="text-xs">
                {uploadStatus === "success"
                  ? "Your CSV file has been processed successfully"
                  : "Choose a CSV file to upload (max 50MB)"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel>CSV File Only.</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".csv"
                            disabled={uploadStatus === "uploading"}
                            onChange={(e) => {
                              onChange(e.target.files);
                              if (e.target.files && e.target.files[0]) {
                                setUploadedFile(e.target.files[0]);
                              }
                            }}
                            {...field}
                            className="!h-10"
                            ref={fileInputRef}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Select a CSV file (maximum 50MB)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {uploadedFile && (
                    <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                      <File className="size-5 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {uploadedFile.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  )}

                  {uploadStatus === "uploading" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Processing...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}

                  <div className="flex gap-3">
                    {uploadStatus !== "success" && (
                      <Button
                        type="submit"
                        disabled={uploadStatus === "uploading"}
                        className="flex-1"
                      >
                        {uploadStatus === "uploading" ? (
                          <>
                            <Loader2 className="size-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Upload className="size-4 mr-2" />
                            Upload CSV
                          </>
                        )}
                      </Button>
                    )}

                    {uploadStatus === "uploading" && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelTask}
                        className="flex-1"
                      >
                        <X className="size-4 mr-2" />
                        Cancel
                      </Button>
                    )}

                    {uploadStatus === "success" && (
                      <Button asChild>
                        <Link className="flex-1" href="#dashboard">
                          View Data
                        </Link>
                      </Button>
                    )}

                    {uploadStatus !== "idle" && (
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={handleReset}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardContent className="p-0">
              <Accordion type="single" collapsible>
                <AccordionItem value="logs" className="border-none">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    View Logs ({logs.length})
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div
                      ref={logsContainerRef}
                      className="rounded-lg p-4 h-60 overflow-auto font-mono text-sm bg-background"
                    >
                      {logs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          Logs will appear here during processing...
                        </div>
                      ) : (
                        <>
                          {logs.map((log, index) => (
                            <div
                              key={index}
                              className="text-xs flex items-start gap-2 mb-1"
                            >
                              <span className="text-muted-foreground shrink-0">
                                {log.timestamp}
                              </span>
                              <span
                                className={`font-semibold shrink-0 ${
                                  log.level === "error"
                                    ? "text-red-500"
                                    : log.level === "success"
                                    ? "text-green-500"
                                    : "text-blue-500"
                                }`}
                              >
                                [{log.level.toUpperCase()}]
                              </span>
                              <span className="break-words">{log.message}</span>
                            </div>
                          ))}
                          <div ref={logsEndRef} />
                        </>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>
      <Dashboard />
    </>
  );
};

export default Uploader;
