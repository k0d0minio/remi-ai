import { describe, expect, it } from "vitest";
import { gatewayRefusal, parseGatewayModels } from "./gateway";

describe("parseGatewayModels", () => {
  it("reads the fields that the rules need", () => {
    const body = {
      object: "list",
      data: [
        {
          id: "mistral/mistral-nemo",
          object: "model",
          name: "Mistral Nemo 12B",
          type: "language",
          zdr: "none",
          no_training: "all",
          tags: ["tool-use", "structured-output"],
          pricing: { input: "0.000000029", output: "0.00000003" },
        },
      ],
    };
    expect(parseGatewayModels(body)).toEqual([
      {
        id: "mistral/mistral-nemo",
        name: "Mistral Nemo 12B",
        type: "language",
        tags: ["tool-use", "structured-output"],
        noTraining: "all",
        zdr: "none",
      },
    ]);
  });

  it("gives null or an empty list for a field that the gateway did not send", () => {
    expect(parseGatewayModels({ data: [{ id: "acme/small" }] })).toEqual([
      {
        id: "acme/small",
        name: "acme/small",
        type: null,
        tags: [],
        noTraining: null,
        zdr: null,
      },
    ]);
  });

  it("throws on a body of another shape", () => {
    expect(() => parseGatewayModels({ error: { message: "no" } })).toThrow();
    expect(() => parseGatewayModels({ data: [{ name: "no id" }] })).toThrow();
  });
});

describe("gatewayRefusal", () => {
  it("reads the refusal of the free plan as no_access", () => {
    const refusal = gatewayRefusal(
      new Error("Free tier users do not have access to this model"),
    );
    expect(refusal?.reason).toBe("no_access");
    expect(refusal?.message).not.toContain("Free tier");
  });

  it("reads a 403 and the forbidden types as no_access", () => {
    expect(gatewayRefusal({ statusCode: 403 })?.reason).toBe("no_access");
    expect(gatewayRefusal({ type: "forbidden" })?.reason).toBe("no_access");
    expect(gatewayRefusal({ type: "access_policy_denied" })?.reason).toBe(
      "no_access",
    );
  });

  it("reads a model that the gateway does not know as unknown_model", () => {
    expect(gatewayRefusal({ type: "model_not_found" })?.reason).toBe(
      "unknown_model",
    );
    expect(gatewayRefusal({ statusCode: 404 })?.reason).toBe("unknown_model");
  });

  it("reads the error that a retry error or a cause wraps", () => {
    expect(
      gatewayRefusal({ lastError: { statusCode: 403 } })?.reason,
    ).toBe("no_access");
    expect(
      gatewayRefusal({ cause: { lastError: { type: "model_not_found" } } })
        ?.reason,
    ).toBe("unknown_model");
  });

  it("gives null for another failure", () => {
    expect(gatewayRefusal(new Error("socket hang up"))).toBeNull();
    expect(gatewayRefusal({ statusCode: 500 })).toBeNull();
    expect(gatewayRefusal(null)).toBeNull();
    const loop: { cause?: unknown } = {};
    loop.cause = loop;
    expect(gatewayRefusal(loop)).toBeNull();
  });
});
