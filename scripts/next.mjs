// Keep telemetry configuration out of the user's home; works on Windows/macOS/Linux.
process.env.NEXT_TELEMETRY_DISABLED = "1";
await import("next/dist/bin/next");
