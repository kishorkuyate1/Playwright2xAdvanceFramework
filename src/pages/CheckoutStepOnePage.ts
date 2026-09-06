import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { CheckoutCustomer as GuestUser } from '@utils/DataGenerator';

/**
 * Checkout step 1 - guest details form (firstName / lastName / postalCode).
 *
 * problem_user quirk: the first valid submit clears `firstName` and shows
 * an inline error. Specs that exercise problem_user just submit twice; this
 * POM does NOT hide the quirk because the lesson uses it to demonstrate
 * dealing with flaky UIs.
 */
export class CheckoutStepOnePage extends BasePage {
    static readonly PATH = '/playwright/ttacart/checkout-step-one.html';

    // Used by assertLoaded() to verify the Checkout page is displayed.
    private readonly title: Locator;

    // Used by assertLoaded() and fillGuest().
    private readonly firstNameInput: Locator;

    // Used by fillGuest() to enter the customer's last name.
    private readonly lastNameInput: Locator;

    // Used by fillGuest() to enter the customer's postal code.
    private readonly postalCodeInput: Locator;

    // Used by continue() to submit the guest details.
    private readonly continueButton: Locator;

    private readonly cancelButton: Locator;
    private readonly errorBox: Locator;


    // "page" is the Playwright Page object.
    // Constructor runs when the CheckoutStepOnePage object is created.
    constructor(page: Page) {
        super(page, 'CheckoutStepOnePage');

        this.title = page.locator('[data-test="title"]');
        this.firstNameInput = page.locator('[data-test="firstName"]');
        this.lastNameInput = page.locator('[data-test="lastName"]');
        this.postalCodeInput = page.locator('[data-test="postalCode"]');
        this.continueButton = page.locator('[data-test="continue"]');
        this.cancelButton = page.locator('[data-test="cancel"]');
        this.errorBox = page.locator('[data-test="error"]');
    }


    // E2E calls checkoutStepOnePage.assertLoaded()
    // ↓
    // Verifies the Checkout page and first-name field are visible.
    async assertLoaded(): Promise<void> {

        // Checks that the page title contains "Checkout".
        await expect(this.title).toContainText('Checkout');

        // Checks that the first-name input is visible.
        await expect(this.firstNameInput).toBeVisible();
    }


    // E2E calls checkoutStepOnePage.fillGuest(customer)
    // ↓
    // Receives the generated customer data
    // ↓
    // Fills first name, last name and postal code.
    async fillGuest(g: GuestUser): Promise<void> {

        // Fills the first-name field with customer.firstName.
        await this.el.fill(this.firstNameInput, g.firstName);

        // Fills the last-name field with customer.lastName.
        await this.el.fill(this.lastNameInput, g.lastName);

        // Fills the postal-code field with customer.postalCode.
        await this.el.fill(this.postalCodeInput, g.postalCode);
    }


    // E2E calls checkoutStepOnePage.continue()
    // ↓
    // Clicks Continue
    // ↓
    // The browser moves to Checkout Step 2 when valid.
    async continue(): Promise<void> {
        await this.el.click(this.continueButton);
        // For valid input the page navigates to step 2; for invalid it stays.
        // Don't blindly assert here - let the spec verify post-state.
    }


    async cancel(): Promise<void> {
        await this.el.click(this.cancelButton);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async expectErrorContains(text: string): Promise<void> {
        await expect(this.errorBox).toBeVisible();
        await expect(this.errorBox).toContainText(text);
    }

    /**
     * Read-only access to the firstName value. Used by tests that check the
     * problem_user "auto-clear on continue" behaviour.
     */
    async firstNameValue(): Promise<string> {
        return this.el.getValue(this.firstNameInput);
    }
}