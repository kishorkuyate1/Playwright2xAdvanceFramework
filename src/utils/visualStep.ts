/**
 * visualStep — like `test.step`. When ATTACH_SCREENSHOTS=true, it also grabs
 * a screenshot at the end of the step and attaches it to the TTA report.
 *
 *   await visualStep(page, 'Open the cart', async () => {
 *       await cartPage.open();
 *   });
 *
 * The reporter (CustomReporter.ts) matches an attachment named
 * `step-<index>-...` to the step at that index. We keep a per-test counter
 * (the steps run sequentially, so the order matches the reporter's own step
 * numbering) and attach the PNG under that exact name.
 */

import { test, type Page, type TestInfo } from '@playwright/test';

const ATTACH_SCREENSHOTS = process.env.ATTACH_SCREENSHOTS?.toLowerCase() === 'true';

// Stores a separate step count for each test.
// The counter is used when screenshots are attached.
const stepCounters = new WeakMap<TestInfo, number>();


// Used by visualStep() when creating the screenshot attachment name.
// Example:
// "Open the cart" → "open-the-cart"
function slugify(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}


export async function visualStep(
    page: Page,
    title: string,
    body: () => Promise<void>,
): Promise<void> {

    // E2E calls visualStep(page, title, async () => { ... })
    // ↓
    // Creates a Playwright test step using the given title.
    await test.step(title, async () => {

        // Runs the actual E2E code passed inside visualStep().
        //
        // Example:
        // visualStep(..., async () => {
        //     await cartPage.open();
        // });
        //
        // body() executes:
        //     cartPage.open()
        await body();

        // Gets the current test information.
        // Used to store the step's screenshot attachment.
        const info = test.info();

        // Gets the current step number.
        // Starts at 0 when the test has no previous steps.
        const index = stepCounters.get(info) ?? 0;

        // Increases the step counter for the next visualStep().
        stepCounters.set(info, index + 1);


        // Only runs when ATTACH_SCREENSHOTS=true.
        //
        // Creates a screenshot and attaches it to the test report.
        if (ATTACH_SCREENSHOTS) {
            await info.attach(`step-${index}-${slugify(title)}`, {
                body: await page.screenshot(),
                contentType: 'image/png',
            });
        }
    });
}