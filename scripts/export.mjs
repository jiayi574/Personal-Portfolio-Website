process.env.STATIC_EXPORT = '1';
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.argv = [process.argv[0], process.argv[1], 'build'];
await import('next/dist/bin/next');
