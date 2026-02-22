import { expect, test } from "playwright/test";

test.describe("dev page gallery", () => {
  test("renders empty-state when no stories are registered", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Page Preview Gallery")).toBeVisible();
    await expect(page.getByText("No previews registered")).toBeVisible();
    await expect(
      page.getByText(
        "Pass a stories file with `page-preview dev --stories path/to/page-preview-stories.ts`.",
      ),
    ).toBeVisible();
  });

  test("falls back to gallery when page route is invalid", async ({ page }) => {
    await page.goto("/not-found");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("Page Preview Gallery")).toBeVisible();
  });
});
