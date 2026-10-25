"use client";

import { useEffect } from "react";
import { clientLog } from "@/lib/clientLog";

function describe(value: unknown): string {
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

// Mounted once in the root layout so every page reports uncaught errors and console.error calls.
export function ErrorReporter() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => clientLog("window", e.message, { file: e.filename, line: e.lineno });
    const onRejection = (e: PromiseRejectionEvent) => clientLog("promise", String((e.reason as any)?.message ?? e.reason));
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      originalConsoleError(...args);
      clientLog("console", args.map(describe).join(" "), undefined, "error");
    };

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      console.error = originalConsoleError;
    };
  }, []);

  return null;
}
