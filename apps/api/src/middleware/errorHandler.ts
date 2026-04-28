import type { NextFunction, Request, Response } from "express";

export type ApiErrorBody = { error: { code: string; message: string } };

/** Express error handler returning typed JSON errors. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response<ApiErrorBody>,
  _next: NextFunction,
): void {
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

