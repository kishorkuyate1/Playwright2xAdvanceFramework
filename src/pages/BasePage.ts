// BasePage = Common base class for all Page Objects.
// It provides page, element utilities, logger and navigation.
import { Page } from '@playwright/test';
// Page → Playwright browser page type
import { UtilElementLocator } from '@utils/UtilElementLocator';
// UtilElementLocator → Common reusable element actions
import { createLogger, type Logger } from '@utils/logger';
// createLogger → Creates logger
// Logger → Logger type
export abstract class BasePage {
// Base class that other Page Objects will extend
//WHY "protected"?
// Because these properties belong to BasePage,
// but child Page Objects also need to use them.
    protected readonly page: Page;
    // Stores Playwright Page
    protected readonly el: UtilElementLocator;
    // Provides reusable actions like click(), fill(), etc.
    protected readonly log: Logger;
    // Provides logging for the Page Object

    protected constructor(page: Page, scope: string) {
    // Constructor receives Page and Page Object name
        this.page = page;
        // Store Playwright Page
        this.el = new UtilElementLocator(page, scope);
        // Create reusable element utility
        this.log = createLogger(scope);
        // Create logger for this Page Object
    }

    protected async goto(relativePath: string): Promise<void> {
    // Common method for navigating to a page
        await this.page.goto(relativePath);
        // Open the given URL/path
        await this.page.waitForLoadState('domcontentloaded');
        // Wait until the page DOM is loaded
    }
}


// ============================================================
// SIMPLE SUMMARY
// ============================================================

// BasePage provides common things to every Page Object:
//
// page → Playwright Page
// el   → Common element actions
// log  → Page-specific logger
// goto → Common navigation method
//
// Other Page Objects extend BasePage:
//
// LoginPage extends BasePage
// HomePage extends BasePage
// CartPage extends BasePage
//
// Main purpose:
// Write common code once → Reuse it in all Page Objects.