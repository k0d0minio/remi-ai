import { describe, expect, it } from "vitest";
import {
  type AppKey,
  type OriginContext,
  resolveOrigin,
  vercelBranchAlias,
} from "./links";
import { sha256Hex } from "./sha256";

const apps: AppKey[] = ["web", "marketing", "admin", "docs"];

const production: Record<AppKey, string> = {
  web: "https://app.remiai.be",
  marketing: "https://www.remiai.be",
  admin: "https://admin.remiai.be",
  docs: "https://docs.remiai.be",
};

const uat: Record<AppKey, string> = {
  web: "https://uat-app.remiai.be",
  marketing: "https://uat.remiai.be",
  admin: "https://uat-admin.remiai.be",
  docs: "https://docs.remiai.be",
};

describe("sha256Hex", () => {
  it("gives the FIPS 180-4 test vectors", () => {
    expect(sha256Hex("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
    expect(sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    // 56 bytes: the padding needs a second block.
    expect(
      sha256Hex("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq"),
    ).toBe("248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1");
  });
});

describe("vercelBranchAlias", () => {
  it("names a short branch in full", () => {
    expect(vercelBranchAlias("web", "bursts")).toBe(
      "https://app-git-bursts-remi21.vercel.app",
    );
  });

  // The aliases that Vercel gave these branches, read from their pull requests.
  it.each([
    [
      "contact/rem-135-les-liens-entre-applications-dune-preview-ne",
      {
        web: "https://app-git-contact-rem-135-les-liens-entre-applicati-f22013-remi21.vercel.app",
        admin:
          "https://admin-git-contact-rem-135-les-liens-entre-applica-eee7be-remi21.vercel.app",
        marketing:
          "https://marketing-git-contact-rem-135-les-liens-entre-app-b3010e-remi21.vercel.app",
        docs: "https://documentation-git-contact-rem-135-les-liens-entre-bb4bc1-remi21.vercel.app",
      },
    ],
    [
      "contact/rem-9-inscription-patient-simplifier-lacceptation",
      {
        web: "https://app-git-contact-rem-9-inscription-patient-simplif-1ee973-remi21.vercel.app",
        admin:
          "https://admin-git-contact-rem-9-inscription-patient-simpl-7db31c-remi21.vercel.app",
        marketing:
          "https://marketing-git-contact-rem-9-inscription-patient-s-b9bb11-remi21.vercel.app",
        docs: "https://documentation-git-contact-rem-9-inscription-patie-db2319-remi21.vercel.app",
      },
    ],
    [
      // The cut ends on a hyphen, and Vercel removes it.
      "contact/rem-12-inscription-patient-adapter-laffichage-mobile",
      {
        marketing:
          "https://marketing-git-contact-rem-12-inscription-patient-2bf8c2-remi21.vercel.app",
      },
    ],
  ] as const)("names the alias of %s", (branch, expected) => {
    for (const [app, alias] of Object.entries(expected)) {
      expect(vercelBranchAlias(app as AppKey, branch)).toBe(alias);
    }
  });
});

describe("resolveOrigin", () => {
  const branch = "contact/rem-135-les-liens-entre-applications-dune-preview-ne";

  it.each(apps)(
    "gives %s on a preview the alias of the same branch",
    (app) => {
      const origin = resolveOrigin(app, { targetEnv: "preview", branch });
      expect(origin).toBe(vercelBranchAlias(app, branch));
    },
  );

  it.each(apps)(
    "ignores a production override for %s on a preview",
    (app) => {
      const context: OriginContext = {
        targetEnv: "preview",
        branch,
        override: production[app],
      };
      expect(resolveOrigin(app, context)).toBe(vercelBranchAlias(app, branch));
    },
  );

  it.each(apps)(
    "gives %s on a preview with no branch the UAT origin",
    (app) => {
      const context: OriginContext = {
        targetEnv: "preview",
        override: production[app],
      };
      expect(resolveOrigin(app, context)).toBe(uat[app]);
    },
  );

  it("never gives a preview a production origin of the app, admin or marketing", () => {
    for (const app of ["web", "admin", "marketing"] as const) {
      for (const context of [
        { targetEnv: "preview", branch },
        { targetEnv: "preview" },
        { targetEnv: "preview", override: production[app] },
      ]) {
        expect(resolveOrigin(app, context)).not.toBe(production[app]);
      }
    }
  });

  it.each(apps)("gives %s on uat its override", (app) => {
    const context: OriginContext = {
      targetEnv: "uat",
      branch: "main",
      override: uat[app],
    };
    expect(resolveOrigin(app, context)).toBe(uat[app]);
  });

  it.each(apps)("gives %s in production its override", (app) => {
    const context: OriginContext = {
      targetEnv: "production",
      branch: "main",
      override: production[app],
    };
    expect(resolveOrigin(app, context)).toBe(production[app]);
  });

  it.each(apps)(
    "gives %s in production with no override the table",
    (app) => {
      expect(resolveOrigin(app, { targetEnv: "production" })).toBe(
        production[app],
      );
    },
  );

  it("gives the dev ports in local development", () => {
    expect(resolveOrigin("web", { development: true })).toBe(
      "http://localhost:3000",
    );
    expect(resolveOrigin("docs", { development: true })).toBe(
      "http://localhost:3003",
    );
  });
});
