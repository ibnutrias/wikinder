import { describe, expect, it } from "vitest";

import { apiError, apiJson, parsePageId } from "@/lib/api";

describe("parsePageId", () => {
  it("accepts positive integers", () => {
    expect(parsePageId("42")).toBe(42);
    expect(parsePageId("1")).toBe(1);
  });

  it("rejects anything that is not a positive integer", () => {
    expect(parsePageId(null)).toBeNull();
    expect(parsePageId("")).toBeNull();
    expect(parsePageId("abc")).toBeNull();
    expect(parsePageId("0")).toBeNull();
    expect(parsePageId("-3")).toBeNull();
    expect(parsePageId("1.5")).toBeNull();
    expect(parsePageId("Infinity")).toBeNull();
  });
});

describe("uniform error responses", () => {
  it("maps input errors to 400", async () => {
    const response = apiError("invalid_lang");
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: { code: string; message: string } };
    expect(body.error.code).toBe("invalid_lang");
    expect(body.error.message.length).toBeGreaterThan(0);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("maps upstream failures to 502 and timeouts to 504", () => {
    expect(apiError("upstream_error").status).toBe(502);
    expect(apiError("upstream_shape").status).toBe(502);
    expect(apiError("upstream_timeout").status).toBe(504);
    expect(apiError("not_found").status).toBe(404);
  });
});

describe("apiJson", () => {
  it("sets the requested cache policy", async () => {
    const response = apiJson({ ok: true }, "public, max-age=60");
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=60");
    expect(await response.json()).toEqual({ ok: true });
  });
});
