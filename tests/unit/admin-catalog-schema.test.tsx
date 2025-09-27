import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AdminCatalogSchemaPage, {
  FALLBACK_DATASET,
  buildAttributeDefinitions,
  evaluateCatalogSnapshot,
  loader,
  type CatalogSnapshot,
} from "../../web/routes/_app.admin.catalog.schema._index";
import { schema as productModelSchema } from "../../api/models/product/schema.gadget";

describe("evaluateCatalogSnapshot", () => {
  it("summarizes the fallback dataset with validation findings", () => {
    const definitions = buildAttributeDefinitions(productModelSchema);
    const snapshot = evaluateCatalogSnapshot(FALLBACK_DATASET, definitions);

    expect(snapshot.summary.totalAttributes).toBe(4);
    expect(snapshot.summary.requiredAttributes).toBe(3);
    expect(snapshot.summary.validationErrors).toBe(4);
    expect(snapshot.summary.validationWarnings).toBe(1);

    const identityGroup = snapshot.attributeGroups.find((group) => group.id === "identity");
    const commerceGroup = snapshot.attributeGroups.find((group) => group.id === "commerce");
    const operationsGroup = snapshot.attributeGroups.find((group) => group.id === "operations");

    expect(identityGroup?.status).toBe("critical");
    expect(commerceGroup?.status).toBe("critical");
    expect(operationsGroup?.status).toBe("warning");

    const contosoVendor = snapshot.vendorPreviews.find((vendor) => vendor.id === "vendor-contoso");
    expect(contosoVendor).toBeDefined();
    expect(contosoVendor?.riskLevel).toBe("high");
    expect(contosoVendor?.pendingIssues).toBe(2);
  });
});

describe("loader", () => {
  it("falls back to the sample dataset when the API client is unavailable", async () => {
    const result = await loader({ context: { api: {} } } as unknown as Parameters<typeof loader>[0]);

    expect(result.datasetSource).toBe("fallback");
    expect(result.attributeStats.length).toBeGreaterThan(0);
    expect(result.datasetError).toMatch(/not available/i);
  });
});

describe("AdminCatalogSchemaPage", () => {
  const renderPage = (snapshot: CatalogSnapshot) => render(<AdminCatalogSchemaPage loaderData={snapshot} />);

  it("renders summary metrics and vendor impact for the fallback dataset", () => {
    const definitions = buildAttributeDefinitions(productModelSchema);
    const snapshot = evaluateCatalogSnapshot(FALLBACK_DATASET, definitions);

    renderPage(snapshot);

    expect(screen.getByText("Schema overview")).toBeInTheDocument();
    expect(screen.getByText("Sample dataset")).toBeInTheDocument();
    expect(screen.getByText("Attributes defined")).toBeInTheDocument();
    expect(screen.getByText("Contoso Print Labs")).toBeInTheDocument();
    expect(screen.getByText("Holiday Card Pack")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
  });
});

