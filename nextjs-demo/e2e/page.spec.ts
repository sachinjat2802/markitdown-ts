import { test, expect } from '@playwright/test';
import path from 'path';

test('has title and can parse a file', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page.locator('h1')).toContainText('MarkItDown Parser');

  // Verify file input exists
  const fileInput = page.locator('input[type="file"]');
  await expect(fileInput).toBeAttached();

  // Test parsing an HTML file
  const fileChooserPromise = page.waitForEvent('filechooser');

  // Click on the dropzone to trigger file chooser
  await page.locator('text=Drag & drop a file here').click();
  const fileChooser = await fileChooserPromise;

  // Set the file path
  await fileChooser.setFiles(path.join(__dirname, '../test.html'));

  // Verify file was selected
  await expect(page.locator('text=test.html')).toBeVisible();

  // Click submit
  await page.locator('button:has-text("Parse Document")').click();

  // Verify loading state
  await expect(page.locator('button:has-text("Parsing...")')).toBeVisible();

  // Verify parsed output, give it a longer timeout
  const textarea = page.locator('textarea');
  await expect(textarea).toHaveValue(/Hello[\s\S]*World/, { timeout: 15000 });
});
