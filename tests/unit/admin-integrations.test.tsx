import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import AdminIntegrationsPage, {
  FALLBACK_INTEGRATIONS,
  loader,
  type IntegrationRecord,
} from "../../web/routes/_app.admin.integrations._index";

describe("admin integrations loader", () => {
  it("falls back to sample data when the integration manager is unavailable", async () => {
    const result = await loader({ context: { api: {} } } as unknown as Parameters<typeof loader>[0]);

    expect(result.source).toBe("fallback");
    expect(result.integrations).toEqual(FALLBACK_INTEGRATIONS);
    expect(result.error).toMatch(/not available/i);
  });

  it("normalizes API responses into integration records", async () => {
    const integrationRecord: IntegrationRecord = {
      id: "integration-1",
      provider: "Provider",
      label: "Provider Live",
      type: "courier",
      status: "connected",
      mode: "live",
      lastSyncAt: "2025-02-02T10:00:00Z",
      createdAt: "2025-02-01T00:00:00Z",
      scopes: ["orders.read"],
      credentials: [
        {
          id: "cred-1",
          env: "production",
          status: "active",
          connectionType: "oauth",
          clientId: "client-1",
          lastRotatedAt: "2025-01-01T00:00:00Z",
          expiresAt: "2025-03-01T00:00:00Z",
          owner: "Owner",
          notes: "Primary credential",
        },
      ],
      webhooks: [
        {
          id: "wh-1",
          url: "https://example.com",
          status: "healthy",
          lastEventAt: "2025-02-02T12:00:00Z",
          secretMasked: "wh_***",
        },
      ],
      notes: "Sample integration",
      maintenanceWindow: "Sundays",
    };

    const result = await loader({
      context: {
        api: {
          integration: {
            findMany: async () => [
              {
                id: integrationRecord.id,
                provider: integrationRecord.provider,
                label: integrationRecord.label,
                type: integrationRecord.type,
                status: integrationRecord.status,
                createdAt: integrationRecord.createdAt,
                metadata: {
                  lastSyncAt: integrationRecord.lastSyncAt,
                  notes: integrationRecord.notes,
                  maintenanceWindow: integrationRecord.maintenanceWindow,
                },
                scopes: integrationRecord.scopes,
                integrationCredentials: integrationRecord.credentials,
                webhookEndpoints: integrationRecord.webhooks,
              },
            ],
          },
        },
      },
    } as unknown as Parameters<typeof loader>[0]);

    expect(result.source).toBe("api");
    expect(result.error).toBeUndefined();
    expect(result.integrations).toHaveLength(1);
    expect(result.integrations[0]).toMatchObject({
      id: "integration-1",
      provider: "Provider",
      status: "connected",
      mode: "live",
      credentials: [
        expect.objectContaining({ id: "cred-1", status: "active", env: "production" }),
      ],
      webhooks: [expect.objectContaining({ id: "wh-1", status: "healthy" })],
      notes: "Sample integration",
      maintenanceWindow: "Sundays",
    });
  });
});

describe("AdminIntegrationsPage", () => {
  const renderPage = (overrides?: Partial<Parameters<typeof AdminIntegrationsPage>[0]["loaderData"]>) =>
    render(
      <AdminIntegrationsPage
        loaderData={{ integrations: FALLBACK_INTEGRATIONS, source: "fallback", ...overrides }}
      />
    );

  it("renders summary metrics from the provided integrations", () => {
    renderPage();

    const liveConnectionsTile = screen.getByText("Live connections").closest("div");
    expect(liveConnectionsTile).not.toBeNull();
    expect(within(liveConnectionsTile as HTMLElement).getByText("2")).toBeInTheDocument();

    const credentialsTile = screen.getByText("Credentials to rotate").closest("div");
    expect(credentialsTile).not.toBeNull();
    expect(within(credentialsTile as HTMLElement).getByText("2")).toBeInTheDocument();
  });

  it("filters integrations by type", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByText("Shopify Marketplace")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Courier" }));

    expect(screen.queryByText("Shopify Marketplace")).not.toBeInTheDocument();
    expect(screen.getByText("FedEx Courier")).toBeInTheDocument();
  });

  it("updates the detail panel when an integration row is selected", () => {
    renderPage();

    expect(
      screen.getByText(
        "Syncs orders every 15 minutes and publishes fulfillment updates back to Shopify."
      )
    ).toBeInTheDocument();

    const amazonRow = screen.getByText("Amazon Marketplace").closest("tr");
    expect(amazonRow).not.toBeNull();

    amazonRow && amazonRow.click();

    expect(
      screen.getByText(
        "Retry queue is backing up because webhook signature verification is failing."
      )
    ).toBeInTheDocument();
  });
});
