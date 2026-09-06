import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';


export class CartPage extends BasePage {
    static readonly PATH = '/playwright/ttacart/cart.html';

    private readonly title: Locator;
    private readonly itemRows: Locator;
    private readonly itemNames: Locator;
    private readonly continueShoppingLink: Locator;
    private readonly checkoutButton: Locator;

    // "page" is the Playwright Page object for the browser tab.
    constructor(page: Page) {
        super(page, 'CartPage');

        this.title = page.locator('[data-test="title"]');
        this.itemRows = page.locator('[data-test="inventory-item"]');
        this.itemNames = page.locator('[data-test="inventory-item-name"]');
        this.continueShoppingLink = page.locator('[data-test="continue-shopping"]');
        this.checkoutButton = page.locator('[data-test="checkout"]');
    }
    // Called directly from the E2E test:
    //
    // await cartPage.open();
    //
    // The purpose of this method is to open the Cart page
    // and then verify that the page loaded correctly.
    //
    // Execution:
    //
    // E2E test
    //    ↓
    // cartPage.open()
    //    ↓
    // this.goto(CartPage.PATH)
    //    ↓
    // this.assertLoaded()
    async open(): Promise<void> {

    // E2E calls cartPage.open()
    // ↓
    // Opens the Cart page
    await this.goto(CartPage.PATH);

    // open() then calls assertLoaded()
    // ↓
    // Verifies "Your Cart" is displayed
    await this.assertLoaded();
}
async assertLoaded(): Promise<void> {

    // Checks that the page title contains "Your Cart"
    await expect(this.title).toContainText('Your Cart');
}
async rowCount(): Promise<number> {

    // Counts the number of items in the cart
    // ↓
    // E2E checks that the count is 1
    return this.itemRows.count();
}
async checkout(): Promise<void> {

    // Clicks the Checkout button
    // ↓
    // Then waits for the next page to load
    await this.el.click(this.checkoutButton);
    await this.page.waitForLoadState('domcontentloaded');
}
}