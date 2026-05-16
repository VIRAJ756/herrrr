/** Express error handler returning typed JSON errors. */
export function errorHandler(err, _req, res, _next) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const isDev = process.env.NODE_ENV === "development";
    if (isDev) {
        // eslint-disable-next-line no-console
        console.error(err);
    }
    res.status(500).json({
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message,
        },
    });
}
