import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { loader } from "../../web/routes/_app.admin.products._index";

describe("Admin Products", () => {
  it("computes KPIs from loader data", async () => {
    const mockRecords = [
      { id: "p1", price: 10, order: { id: "o1" } },
      { id: "p2", price: 20, order: null },
      { id: "p3", price: 30, order: { id: "o2" } },
    ];

    const result = await loader({
      context: {
        api: {
          product: {
            findMany: async () => mockRecords,
          },
        },
      },
    } as unknown as Parameters<typeof loader>[0]);

    expect(result.stats.total).toBe(3);
    expect(result.stats.attached).toBe(2);
    expect(result.stats.unattached).toBe(1);
    expect(result.stats.averagePrice).toBeCloseTo((10 + 20 + 30) / 3);
  });

  it.todo("renders table columns and navigations");
});
