// Imports Playwright's base test object and expect assertion function.
// "base" is renamed to "test" so we can extend it with our own fixtures.
import {test as base,expect} from '@playwright/test';

// Imports all Page Object classes used by the tests.
import { LoginPage } from '@pages/LoginPage';
import { CartPage } from '@pages/CartPage';
import { InventoryPage } from '@pages/InventoryPage';
import { ItemDetailPage } from '@pages/ItemDetailPage';
import { CheckoutStepOnePage } from '@pages/CheckoutStepOnePage';
import { CheckoutStepTwoPage } from '@pages/CheckoutStepTwoPage';
import { CheckoutCompletePage } from '@pages/CheckoutCompletePage';

// Imports login test data from the JSON file.
import loginTestData from '@testdata/logintestdata.json';


// Defines the structure of one login record from the JSON file.
// Each user must have a username and password.
type LoginRecord = {
    username: string;
    password: string;
};

// Defines the data returned by the loginWithSelectedItem fixture.
export type SelectedItemState = {
    inventoryPage: InventoryPage;
    itemId: string;
};


// Converts the imported JSON data into an array of LoginRecord objects.
const users = loginTestData as LoginRecord[];


// Searches the users array for the standard user.
// find() returns the matching user object.
const validUser = users.find(({ username }) => username === 'standard_user');

// Stores the product ID that will be used by the selected-item fixture.
const SELECTED_ITEM_ID = 'test-allthethings-tshirt-red';


// Makes sure the required users exist before tests start.
//
// If either user is missing, the test setup stops with an error.
if (!validUser) {
    throw new Error('Required standard_user test data is missing');
}


// Defines all custom fixtures that our tests can use.
//
// After this type is defined, tests can request fixtures such as:
// loginPage
// inventoryPage
// cartPage
// validLogin
// loginWithInventory
export type TestFixture = {

    // Page Object fixtures.
    loginPage: LoginPage;
    inventoryPage: InventoryPage;
    itemDetailPage: ItemDetailPage;
    cartPage: CartPage;
    checkoutStepOnePage: CheckoutStepOnePage;
    checkoutStepTwoPage: CheckoutStepTwoPage;
    checkoutCompletePage: CheckoutCompletePage;

    // Ready-to-use application-state fixtures.
    validLogin: LoginPage;
    loginWithInventory: InventoryPage;
    loginWithSelectedItem: SelectedItemState;
};

// Creates a new Playwright "test" object with our custom fixtures.
//
// base.extend() means:
// Playwright's normal test
//        +
// our custom fixtures
//        ↓
// new test object
export const test = base.extend<TestFixture>({
    // Creates a LoginPage object for the test.
    //
    // E2E can now request:
    // loginPage
    //
    // Flow:
    // test
    //  ↓
    // loginPage fixture
    //  ↓
    // new LoginPage(page)
    loginPage: async ({ page }, use) => {

        // Creates LoginPage using Playwright's page object.
        // use() makes this LoginPage available to the test.
        await use(new LoginPage(page));
    },
    // Creates an InventoryPage object.
    //
    // E2E can request:
    // inventoryPage
    inventoryPage: async ({ page }, use) => {

        // Creates InventoryPage and provides it to the test.
        await use(new InventoryPage(page));
    },


    // Creates an ItemDetailPage object.
    itemDetailPage: async ({ page }, use) => {
        await use(new ItemDetailPage(page));
    },


    // Creates a CartPage object.
    //
    // E2E can request:
    // cartPage
    cartPage: async ({ page }, use) => {

        // Creates CartPage and provides it to the test.
        await use(new CartPage(page));
    },


    // Creates a CheckoutStepOnePage object.
    checkoutStepOnePage: async ({ page }, use) => {
        await use(new CheckoutStepOnePage(page));
    },


    // Creates a CheckoutStepTwoPage object.
    checkoutStepTwoPage: async ({ page }, use) => {

        // Creates CheckoutStepTwoPage and provides it to the test.
        await use(new CheckoutStepTwoPage(page));
    },


    // Creates a CheckoutCompletePage object.
    checkoutCompletePage: async ({ page }, use) => {

        // Creates CheckoutCompletePage and provides it to the test.
        await use(new CheckoutCompletePage(page));
    },



    // Creates a ready-to-use successful login state.
    //
    // Flow:
    // validLogin
    //    ↓
    // loginPage.open()
    //    ↓
    // loginPage.LoginAs()
    //    ↓
    // loginPage.waitForLoginButtonHidden()
    //    ↓
    // use(loginPage)
    validLogin: async ({ loginPage }, use) => {

        // Opens the Login page.
        await loginPage.open();

        // Logs in using the valid standard user's credentials.
        await loginPage.LoginAs(validUser.username, validUser.password);

        // Waits until the Login button is hidden,
        // confirming that the login process has completed.
        await loginPage.waitForLoginButtonHidden();

        // Provides the logged-in LoginPage object to the next fixture/test.
        await use(loginPage);
    },


    // Depends on the validLogin fixture.
    //
    // Because validLogin runs first, the user is already logged in.
    //
    // Flow:
    // validLogin
    //    ↓
    // loginWithInventory
    //    ↓
    // inventoryPage.assertLoaded()
    loginWithInventory: async ({ validLogin, inventoryPage }, use) => {

        // validLogin is included as a dependency.
        // This line tells TypeScript/runtime that the dependency is intentionally used.
        void validLogin;

        // Verifies that the Inventory page is loaded.
        await inventoryPage.assertLoaded();

        // Provides the ready-to-use InventoryPage to the test.
        await use(inventoryPage);
    },


    // Depends on loginWithInventory.
    //
    // By this point:
    // 1. User is logged in.
    // 2. Inventory page is loaded.
    //
    // Flow:
    // loginWithInventory
    //    ↓
    // addToCart()
    //    ↓
    // selected product is added
    loginWithSelectedItem: async ({ loginWithInventory }, use) => {

        // Adds the predefined product to the cart.
        //
        // loginWithInventory is actually an InventoryPage object.
        await loginWithInventory.addToCart(SELECTED_ITEM_ID);

        // Returns the InventoryPage and selected product ID
        // as a ready-to-use state for the test.
        await use({
            inventoryPage: loginWithInventory,
            itemId: SELECTED_ITEM_ID,
        });
    },
    
});


// Exports expect so test files can import it from this custom fixture file.
export { expect };