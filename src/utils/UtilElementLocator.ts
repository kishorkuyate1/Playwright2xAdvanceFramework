// Common utilities are kept in UtilElementLocator.ts
// so we can reuse them directly in Page Objects.
/**
 * UtilElementLocator
 * → Contains common reusable element actions.
 */

import { expect, Locator, Page } from '@playwright/test';
import { createLogger, type Logger } from '@utils/logger';
// createLogger → Creates logger
// Logger       → Logger type

export const DEFAULT_ACTION_TIMEOUT_MS = 15_000;

export type Flex = string | Locator;
// Target can be:
// string  → '#username'
// Locator → page.getByTestId('username')


export class UtilElementLocator {

    private readonly page: Page;
    // Stores Playwright Page

    private readonly log: Logger;
    // Stores logger

// Constructor runs automatically when UtilElementLocator is created.
// It receives the Playwright Page and logger scope.
// constructor = "Prepare the utility before using it."
    constructor(page: Page, scope: string = 'UtilElementLocator') {
        // Constructor receives Page and logger scope

        this.page = page;
        // Store Page

        this.log = createLogger(scope);
        // Create logger for this utility
    }

// Converts target into a Playwright Locator
// target: Flex
// → target can be a string OR a Locator.
// If target is a string:
// '#username'
// → Creates a Locator using page.locator()
// If target is already a Locator:
// page.getByTestId('username')
// → Uses it directly.
    private toLocator(target: Flex): Locator {
        return typeof target === 'string'
            ? this.page.locator(target) // If string → create locator
            : target;                    // If Locator → use it directly
    }
    private describe(target: Flex): string {
    // Converts target into readable text for logs
        return typeof target === 'string'
            ? target
            : target.toString();
    }

// ---------- MOUSE ACTIONS ----------
// async → Makes the method asynchronous.
// → Allows us to use "await" inside the method.

// Promise<void> → Defines what the async method returns.
// → Promise = result will be available in the future.
// → void = method does not return any value.

// Why both?
// async → How the method works.
// Promise<void> → What the method returns.

    async click(target: Flex, timeout: number = DEFAULT_ACTION_TIMEOUT_MS): Promise<void> {
        // Click element
        const loc = this.toLocator(target);
        // Convert target to Locator
        this.log.debug(`click ${this.describe(target)}`);
        // Write action in log
        await loc.click({ timeout });
        // Perform click
    }


    async doubleClick(target: Flex, timeout: number = DEFAULT_ACTION_TIMEOUT_MS): Promise<void> {
        // Double-click element
        const loc = this.toLocator(target);
        this.log.debug(`click ${this.describe(target)}`);
        await loc.dblclick({ timeout });
    }


    async rightClick(target: Flex, timeout: number = DEFAULT_ACTION_TIMEOUT_MS): Promise<void> {
        // Right-click element
        const loc = this.toLocator(target);
        await loc.click({ button: 'right', timeout });
    }


    async hover(target: Flex, timeout: number = DEFAULT_ACTION_TIMEOUT_MS): Promise<void> {
        // Move mouse over element

        const loc = this.toLocator(target);
        await loc.hover({ timeout });
    }


    // ---------- INPUT ACTIONS ----------

    async fill(target: Flex, value: string, timeout: number = DEFAULT_ACTION_TIMEOUT_MS): Promise<void> {
        // Fill text into input

        const loc = this.toLocator(target);
        this.log.debug(`fill ${this.describe(target)}`);
        await loc.fill(value, { timeout });
    }


    async type(target: Flex, value: string, timeout: number = DEFAULT_ACTION_TIMEOUT_MS): Promise<void> {
        // Type text character by character

        const loc = this.toLocator(target);
        await loc.pressSequentially(value, { timeout });
    }


    async clear(target: Flex, timeout: number = DEFAULT_ACTION_TIMEOUT_MS): Promise<void> {
        // Clear input field
        const loc = this.toLocator(target);
        await loc.clear({ timeout });
    }


    async pressSequentially(target: Flex,value: string,timeout: 
    number = DEFAULT_ACTION_TIMEOUT_MS,): Promise<void> {
        // Type text sequentially
        const loc = this.toLocator(target);
        await loc.pressSequentially(value, { timeout });
    }


    // ---------- TEXT & CONTENT ----------

    async getText(target: Flex): Promise<string> {
        // Get text content

        const loc = this.toLocator(target);
        const txt = (await loc.textContent()) ?? '';

        return txt.trim();
        // Remove extra spaces
    }


    async getInnerText(target: Flex): Promise<string> {
        // Get visible inner text

        const loc = this.toLocator(target);
        return (await loc.innerText()).trim();
    }


    async getAllTexts(target: Flex): Promise<string[]> {
        // Get text from multiple elements

        const loc = this.toLocator(target);
        const texts = await loc.allTextContents();

        return texts.map((t) => t.trim());
    }


    async getAttr(target: Flex, name: string): Promise<string | null> {
        // Get element attribute

        const loc = this.toLocator(target);
        return loc.getAttribute(name);
    }


    async getValue(target: Flex): Promise<string> {
        // Get input value

        const loc = this.toLocator(target);
        return loc.inputValue();
    }


    // ---------- COUNT ----------

    async count(target: Flex): Promise<number> {
        // Count matching elements

        const loc = this.toLocator(target);
        return loc.count();
    }


    // ---------- STATE CHECKS ----------

    async isVisible(target: Flex): Promise<boolean> {
        // Check if element is visible

        const loc = this.toLocator(target);
        return loc.isVisible();
    }


    async isEnabled(target: Flex): Promise<boolean> {
        // Check if element is enabled

        const loc = this.toLocator(target);
        return loc.isEnabled();
    }


    async isChecked(target: Flex): Promise<boolean> {
        // Check if checkbox/radio is checked

        const loc = this.toLocator(target);
        return loc.isChecked();
    }


    // ---------- WAITS ----------

    async waitForVisible(target: Flex, timeout: number = DEFAULT_ACTION_TIMEOUT_MS): Promise<void> {
        // Wait until element becomes visible

        const loc = this.toLocator(target);
        await expect(loc).toBeVisible({ timeout });
    }


    async waitForHidden(target: Flex, timeout: number = DEFAULT_ACTION_TIMEOUT_MS): Promise<void> {
        // Wait until element becomes hidden

        const loc = this.toLocator(target);
        await expect(loc).toBeHidden({ timeout });
    }


    async waitForPageLoad(): Promise<void> {
        // Wait for page loading

        this.log.debug('waitForPageLoad');

        await this.page.waitForLoadState('domcontentloaded');
        // Wait until DOM is loaded

        await this.page.waitForLoadState('networkidle').catch(() => {
            // Ignore networkidle timeout
        });
    }


    // ---------- SELECT DROPDOWN ----------

    async selectByText(target: Flex, text: string): Promise<void> {
        // Select dropdown option by visible text

        const loc = this.toLocator(target);
        await loc.selectOption({ label: text });
    }


    async selectByValue(target: Flex, value: string): Promise<void> {
        // Select dropdown option by value

        const loc = this.toLocator(target);
        await loc.selectOption({ value });
    }


    async selectByIndex(target: Flex, index: number): Promise<void> {
        // Select dropdown option by index

        const loc = this.toLocator(target);
        await loc.selectOption({ index });
    }
}


// ============================================================
// SIMPLE SUMMARY
// ============================================================

// UtilElementLocator.ts
// → Contains common reusable Playwright utilities.
//
// Mouse:
// click, doubleClick, rightClick, hover
//
// Input:
// fill, type, clear
//
// Get data:
// getText, getInnerText, getAllTexts, getAttr, getValue
//
// Checks:
// count, isVisible, isEnabled, isChecked
//
// Waits:
// waitForVisible, waitForHidden, waitForPageLoad
//
// Dropdown:
// selectByText, selectByValue, selectByIndex
//
// Main benefit:
// Write common Playwright code once → Reuse it everywhere.