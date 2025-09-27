import { test, expect } from "@playwright/test";

const heroHeading = /Hey, Developer/i;

test.describe("Public landing page", () => {
  test("shows hero copy and edit CTA", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: heroHeading })).toBeVisible();
    await expect(page.getByRole("link", { name: /Edit this page/i })).toBeVisible();
  });

  test("navigates to sign in page", async ({ page }) => {
    await page.goto("/sign-in");

    await expect(page.getByRole("heading", { name: /Login/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Continue with email/i })).toBeVisible();
  });
});
