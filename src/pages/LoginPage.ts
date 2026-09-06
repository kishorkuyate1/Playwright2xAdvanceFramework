import {expect, Locator, Page} from '@playwright/test';

import {BasePage} from './BasePage';

export class LoginPage extends BasePage{

//static readonly PATH='/playwright/ttacart/';
static readonly PATH = '/playwright/ttacart/index.html';

    // Used by LoginAs() to enter the username.
    private readonly usernameInput:Locator;

    // Used by LoginAs() to enter the password.
    private readonly passwordInput:Locator;

    // Used by LoginAs() to submit the login form.
    private readonly loginButton: Locator;

    private readonly errorBox: Locator;
    private readonly loginCredentialsHint: Locator;


    // Constructor runs when the LoginPage object is created.
    //
    // "page" is the Playwright Page object.
    // super() calls the BasePage constructor.
    constructor(page:Page){
        super(page, 'LoginPage');

        this.usernameInput = page.locator('[data-test="username"]');
        this.passwordInput = page.locator('[data-test="password"]');
        this.loginButton = page.locator('[data-test="login-button"]');
        this.errorBox = page.locator('[data-test="error"]');
        this.loginCredentialsHint = page.locator('[data-test="login-credentials"]');
    }
    

    // E2E calls loginPage.open()
    // ↓
    // Opens the Login page.
    async open():Promise<void>{

        this.log.info("Open Login Page");

        // goto() comes from BasePage.
        // Opens LoginPage.PATH in the browser.
        await this.goto(LoginPage.PATH);
    }


    // E2E calls loginPage.LoginAs(username, password)
    // ↓
    // Fills username
    // ↓
    // Fills password
    // ↓
    // Clicks Login
    // ↓
    // Waits until login succeeds or an error appears.
    async LoginAs(username : string, password : string): Promise<void>{

        this.log.info(`LoginAs${username}`);

        // Fills the username entered by the E2E test.
        await this.el.fill(this.usernameInput, username);

        // Fills the password entered by the E2E test.
        await this.el.fill(this.passwordInput, password);

        // Clicks the Login button.
        await this.el.click(this.loginButton);

        // Waits until either:
        // 1. The browser reaches the Inventory page, OR
        // 2. A login error becomes visible.
        await expect.poll(async () => (
            this.page.url().includes('/inventory') || await this.errorBox.isVisible()
        )).toBe(true);    
    }


    async LoginAsInvalid(username : string, password : string): Promise<void>{
        this.log.info(`LoginAs${username}`);
        await this.el.fill(this.usernameInput, username);
        await this.el.fill(this.passwordInput, password);
        await this.el.click(this.loginButton);
        await this.el.getText(this.errorBox);
        console.log(this.errorBox);

    }

    async waitForLoginButtonHidden(): Promise<void> {
        await this.el.waitForHidden(this.loginButton);
    }

    
}