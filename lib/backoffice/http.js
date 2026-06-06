import { ZodError } from 'zod';
import { NextResponse } from 'next/server';

export function json(data, init = {}) {
  return NextResponse.json(data, init);
}

function friendlyZodMessage(issue) {
  const path = issue.path[issue.path.length - 1] || '';
  if (issue.code === 'too_small') {
    if (path === 'password') return `Password must be at least ${issue.minimum} characters.`;
    if (issue.minimum === 1) return `${String(path) || 'Field'} is required.`;
    return `${String(path) || 'Field'} must be at least ${issue.minimum} characters.`;
  }
  if (issue.code === 'too_big') {
    return `${String(path) || 'Field'} is too long.`;
  }
  if (issue.code === 'invalid_string' && issue.validation === 'email') {
    return 'Please enter a valid email address.';
  }
  if (issue.code === 'invalid_type' && path === 'password') {
    return 'Password is required.';
  }
  if (issue.code === 'invalid_literal' && path === 'privacyPolicyAccepted') {
    return 'You must accept the privacy policy.';
  }
  return issue.message;
}

export function handleApiError(error) {
  if (error instanceof ZodError) {
    return json(
      {
        error: 'Validation failed.',
        issues: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: friendlyZodMessage(issue),
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
