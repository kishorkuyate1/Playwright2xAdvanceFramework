import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
    static readonly PATH = '/playwright/ttacart/inventory';

    // Used by assertLoaded() to verify the Inventory page
    // displays the expected "Products" title.
    private readonly title: Locator;

    private readonly sortDropdown: Locator;

    // Used by assertLoaded() to count the products displayed
    // on the Inventory page and verify that more than 3 exist.
    private readonly items: Locator;

    private readonly itemNames: Locator;

    private readonly itemPrices: Locator;

    private readonly cartLink: Locator;

    private readonly cartBadge: Locator;


    // Constructor runs when the InventoryPage object is created.
    //
    // It receives the Playwright Page object and passes it
    // to BasePage using super().
    constructor(page: Page) {

        // Calls the BasePage constructor.
        //
        // InventoryPage extends BasePage, so methods/properties
        // such as this.page, this.goto() and this.el are available.
        super(page, 'InventoryPage');

        this.title = page.locator('[data-test="title"]');
        this.sortDropdown = page.locator('[data-test="product-sort-container"]');
        this.items = page.locator('[data-test="inventory-item"]');
        this.itemNames = page.locator('[data-test="inventory-item-name"]');
        this.itemPrices = page.locator('[data-test="inventory-item-price"]');
        this.cartLink = page.locator('[data-test="shopping-cart-link"]');
        this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    }
    // E2E calls inventoryPage.open()
    // ↓
    // Opens the Inventory page
    async open(): Promise<void> {

        // goto() comes from BasePage.
        // Navigates to the Inventory page.
        await this.goto(InventoryPage.PATH);

        // open() then calls assertLoaded()
        // ↓
        // Verifies the Inventory page loaded correctly.
        await this.assertLoaded();
    }


    // Called by open().
    //
    // Verifies the Inventory page before the E2E
    // continues to the next step.
    async assertLoaded(): Promise<void> {

        // Checks that the page title is "Products".
        await expect(this.title).toHaveText('Products');

        // Counts the inventory items.
        // E2E requires more than 3 products to be displayed.
        await expect.poll(async () => this.items.count()).toBeGreaterThan(3);
    }


    async productNames(): Promise<string[]> {
        return this.el.getAllTexts(this.itemNames);
    }


    // Called by addToCart().
    //
    // Creates the Locator for the Add to Cart button.
    // It does NOT click the button.
    private addBtn(id: string): Locator {
        return this.page.locator(`[data-test="add-to-cart-${id}"]`);
    }


    private removeBtn(id: string): Locator {
        return this.page.locator(`[data-test="remove-${id}"]`);
    }


    // E2E calls inventoryPage.addToCart(FIRST_ITEM_ID)
    // ↓
    // addBtn(id) creates the button Locator
    // ↓
    // el.click() clicks that Locator
    async addToCart(id: string): Promise<void> {
        await this.el.click(this.addBtn(id));
    }


    async removeFromCart(id: string): Promise<void> {
        await this.el.click(this.removeBtn(id));
    }


    async openCart(): Promise<void> {
        await this.el.click(this.cartLink);
        await this.page.waitForLoadState('domcontentloaded');
    }


    async openItem(id: string): Promise<void> {
        await this.el.click(
            this.page.locator(`[data-test="item-${id}-title-link"]`)
        );
        await this.page.waitForLoadState('domcontentloaded');
    }
}