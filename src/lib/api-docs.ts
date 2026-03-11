// ─────────────────────────────────────────────────────────────────────────────
// API Documentation Type System
//
// Every API route exports a `definition: RouteDefinition` alongside its
// HTTP handlers. The registry imports all definitions and builds the spec.
// The /docs page renders the spec — no build step required.
// ─────────────────────────────────────────────────────────────────────────────

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface SchemaField {
  type: string;
  description?: string;
  required?: boolean;
  enum?: string[];
}

export interface ParamDef {
  name: string;
  in: "query" | "path" | "header";
  description: string;
  required?: boolean;
  type: string;
  enum?: string[];
  default?: string | number;
}

export interface EndpointDef {
  summary: string;
  description?: string;
  /** If true, only shown to ADMIN role users in the docs UI */
  adminOnly?: boolean;
  parameters?: ParamDef[];
  requestBody?: {
    description: string;
    fields: Record<string, SchemaField>;
  };
  responses: Record<number, { description: string }>;
}

export type RouteDefinition = Partial<Record<HttpMethod, EndpointDef>>;

/** Flat representation of a single documented endpoint, used by the registry */
export interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  tag: string;
  def: EndpointDef;
}
