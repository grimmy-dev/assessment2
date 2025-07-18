"use client";
import { useState, useRef, useEffect, useCallback } from "react";
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
  ArrowUpIcon,
} from "lucide-react";
import Link from "next/link";
import Dashboard from "./dashboard";

const fileSchema = z.object({
  file: z
    .any()
    .refine((files) => files?.length > 0, "Please select a file")
    .refine((files) => files instanceof FileList, "Invalid file type")
    .refine(
      (files) =>
        files?.[0]?.type === "text/csv" || files?.[0]?.name.endsWith(".csv"),
      "Only CSV files are allowed"
    )
    .refine(
      (files) => files?.[0]?.size <= 50 * 1024 * 1024,
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

type UploadStatus = "idle" | "uploading" | "success" | "error";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface UploaderProps {
  currentTaskId: string | null;
  canFetchDashboard: boolean;
  uploadStatus: UploadStatus;
  onTaskIdChange: (taskId: string | null) => void;
  onCanFetchChange: (canFetch: boolean) => void;
  onUploadStatusChange: (status: UploadStatus) => void;
  onReset: () => void;
}

const Uploader: React.FC<UploaderProps> = ({
  currentTaskId,
  canFetchDashboard,
  uploadStatus,
  onTaskIdChange,
  onCanFetchChange,
  onUploadStatusChange,
  onReset: globalReset,
}) => {
  // Local state that doesn't need to be global
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm<FileFormData>({
    resolver: zodResolver(fileSchema),
    defaultValues: { file: undefined },
  });

  const scrollToBottom = useCallback(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop =
        logsContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [logs, scrollToBottom]);

  useEffect(() => {
    return () => {
      socketRef.current?.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const addLog = useCallback(
    (level: LogMessage["level"], message: string, progress?: number) => {
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
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setConnectionStatus("connected");
        addLog("info", "Connected to server");
      };

      socket.onmessage = (event) => {
        try {
          const log = JSON.parse(event.data);
          setLogs((prev) => [...prev, log]);

          if (log.progress !== undefined) {
            setUploadProgress(log.progress);
          }

          if (log.finished === true) {
            if (log.level === "success") {
              onCanFetchChange(true);
              onUploadStatusChange("success");
            } else if (log.level === "error") {
              onUploadStatusChange("error");
            }
            socket.close(1000, "Task completed");
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.onclose = (event) => {
        setConnectionStatus("disconnected");
        if (event.code !== 1000 && uploadStatus === "uploading") {
          addLog("info", "Connection lost, attempting to reconnect...");
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket(taskId);
          }, 2000);
        }
      };

      socket.onerror = () => {
        setConnectionStatus("error");
        addLog("error", "WebSocket connection error");
      };
    },
    [addLog, uploadStatus, onCanFetchChange, onUploadStatusChange]
  );

  const handleUpload = useCallback(
    async (file: File) => {
      onUploadStatusChange("uploading");
      setUploadProgress(0);
      setLogs([]);
      onTaskIdChange(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        addLog("info", "Uploading file...");

        const response = await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ detail: "Upload failed" }));
          throw new Error(errorData.detail || "Upload failed");
        }

        const data = await response.json();
        onTaskIdChange(data.task_id);
        addLog(
          "success",
          `File uploaded successfully. Task ID: ${data.task_id}`
        );
        connectWebSocket(data.task_id);
      } catch (error) {
        onUploadStatusChange("error");
        addLog(
          "error",
          `Upload failed: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
    [addLog, connectWebSocket, onTaskIdChange, onUploadStatusChange]
  );

  const cancelTask = useCallback(async () => {
    if (!currentTaskId) return;

    try {
      const response = await fetch(`${API_URL}/cancel/${currentTaskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        addLog("info", "Task cancelled");
        onUploadStatusChange("idle");
        socketRef.current?.close();
      }
    } catch (error) {
      addLog(
        "error",
        `failed to cancel task: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }, [currentTaskId, addLog, onUploadStatusChange]);

  const onSubmit = useCallback(
    async (data: FileFormData) => {
      const file = data.file[0];
      await handleUpload(file);
    },
    [handleUpload]
  );

  const handleReset = useCallback(() => {
    if (currentTaskId && uploadStatus === "uploading") {
      cancelTask();
    }

    form.reset();
    setUploadProgress(0);
    setUploadedFile(null);
    setLogs([]);
    setConnectionStatus("disconnected");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    socketRef.current?.close();

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Call the global reset function
    globalReset();
  }, [currentTaskId, uploadStatus, cancelTask, form, globalReset]);

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
                        <FormLabel>CSV File Only</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".csv"
                            disabled={uploadStatus === "uploading"}
                            onChange={(e) => {
                              onChange(e.target.files);
                              if (e.target.files?.[0]) {
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
                        className="flex-1 group"
                      >
                        {uploadStatus === "uploading" ? (
                          <>
                            <Loader2 className="size-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <div className="size-4 flex flex-col overflow-hidden">
                              <ArrowUpIcon
                                strokeWidth="4"
                                className="size-4 group-hover:-translate-y-4 transition-transform duration-400"
                              />
                              <ArrowUpIcon
                                strokeWidth="4"
                                className="size-4 group-hover:-translate-y-4 transition-transform duration-800"
                              />
                            </div>
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
                        logs.map((log, index) => (
                          <div
                            key={index}
                            className="text-sm flex items-start gap-2 mb-1"
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
                        ))
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>
      <Dashboard taskId={currentTaskId} canFetch={canFetchDashboard} />
    </>
  );
};

export default Uploader;
