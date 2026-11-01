import type { NextFunction, Request, Response } from "express";
import { ValidationException } from "@/execptions";
import type { ErrorFieldData } from "@/execptions";

type RequestPart = "body" | "query" | "params";

type AsyncSchema = {
  parseAsync(data: unknown): Promise<unknown>;
};

type ValidationSchemas = {
  body?: AsyncSchema;
  query?: AsyncSchema;
  params?: AsyncSchema;
};

type ValidationIssue = {
  path: (string | number)[];
  message: string;
};

function isValidationError(
  error: unknown,
): error is { issues: ValidationIssue[] } {
  if (typeof error !== "object" || error === null || !("issues" in error)) {
    return false;
  }

  const issues = error.issues;
  return (
    Array.isArray(issues) &&
    issues.every(
      (issue): issue is ValidationIssue =>
        typeof issue === "object" &&
        issue !== null &&
        "path" in issue &&
        Array.isArray(issue.path) &&
        issue.path.every(
          (part: unknown) => typeof part === "string" || typeof part === "number",
        ) &&
        "message" in issue &&
        typeof issue.message === "string",
    )
  );
}

export function validationMiddleware(schemas: ValidationSchemas) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const requestData = {
        body: req.body,
        query: req.query,
        params: req.params,
      };
      const parsed: Partial<Record<RequestPart, unknown>> = {};
      const issues: ValidationIssue[] = [];

      for (const part of ["body", "query", "params"] as const) {
        const schema = schemas[part];
        if (!schema) {
          continue;
        }

        try {
          parsed[part] = await schema.parseAsync(requestData[part]);
        } catch (error) {
          if (!isValidationError(error)) {
            throw error;
          }
          issues.push(
            ...error.issues.map((issue) => ({
              ...issue,
              path: [part, ...issue.path],
            })),
          );
        }
      }

      if (issues.length > 0) {
        const invalidData: ErrorFieldData = issues.map((issue) => ({
          [String(issue.path[1] ?? issue.path[0])]: issue.message,
        }));
        const invalidFields = invalidData
          .map((entry) => Object.keys(entry)[0])
          .join(", ");
        next(
          new ValidationException(
            `Invalid input for: ${invalidFields}`,
            invalidData,
          ),
        );
        return;
      }

      if (schemas.body) {
        req.body = parsed.body;
      }
      if (schemas.params && parsed.params) {
        req.params = parsed.params as Request["params"];
      }
      if (schemas.query) {
        Object.defineProperty(req, "query", {
          value: parsed.query,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
