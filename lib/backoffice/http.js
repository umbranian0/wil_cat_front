import { ZodError } from 'zod';
import { NextResponse } from 'next/server';

export function json(data, init = {}) {
  return NextResponse.json(data, init);
}

export function handleApiError(error) {
  if (error instanceof ZodError) {
    return json(
      {
        error: 'Validation failed.',
        issues: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
      { status: 400 }
    );
  }

  const status = error.status || 500;
  return json(
    {
      error: status >= 500 ? 'Unexpected server error.' : error.message,
    },
    { status }
  );
}
