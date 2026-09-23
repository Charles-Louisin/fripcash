export type ApiErrorBody = {
  statusCode: number;
  code: string;
  message: string;
  correlationId?: string;
  locale: "FR" | "EN";
};

export class ApiError extends Error {
  constructor(public readonly body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
  }
}

export type AuthErrorBody = {
  code?: string;
  message?: string;
  status?: number;
};
