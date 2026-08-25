import {Locator, Page} from '@playwright/test';

import {BasePage} from './BasePage';

export class LoginPage extends BasePage{

    static readonly PATH='https://app.thetestingacademy.com/playwright/ttacart/';

//private  → Locator can be accessed only inside the LoginPage class.
//readonly → Locator reference cannot be changed after initialization.
    private readonly usernameInput:Locator;
    private readonly passwordInput:Locator;
    private readonly loginButton: Locator;
    private readonly errorBox: Locator;
    private readonly loginCredentialsHint: Locator;
/*
Constructor
→ Initializes the LoginPage.

page.locator()
→ Finds and stores the Login Page elements.

this.usernameInput
this.passwordInput
this.loginButton
→ Can then be reused in methods like LoginAs().
*/
    constructor(page:Page){
        super(page, 'LoginPage');
        this.usernameInput = page.locator('[data-test="username"]');
        this.passwordInput = page.locator('[data-test="password"]');
        this.loginButton = page.locator('[data-test="login-button"]');
        this.errorBox = page.locator('[data-test="error"]');
        this.loginCredentialsHint = page.locator('[data-test="login-credentials"]');
    }
    
/*1. async
→ Means this method does some asynchronous work.
→ We can use "await" inside it.
2. Promise<void>
→ Promise means "this method will finish sometime in the future."
→ void means "it will not return any value."
3. this.log.info("Open Login Page")
→ Creates a log message.
*/
    async open():Promise<void>{
        this.log.info("Open Login Page");
        await this.goto(LoginPage.PATH);
    }

/*el = UtilElementLocator
→ Reusable utility for common Playwright actions.

el.fill()
→ Enter text into a field.

el.click()
→ Click an element.
*/
    async LoginAs(username : string, password : string): Promise<void>{
        this.log.info(`LoginAs${username}`);
        await this.el.fill(this.usernameInput, username);
        await this.el.fill(this.passwordInput, password);
        await this.el.click(this.loginButton);

    }
    async LoginAsInvalid(username : string, password : string): Promise<void>{
        this.log.info(`LoginAs${username}`);
        await this.el.fill(this.usernameInput, username);
        await this.el.fill(this.passwordInput, password);
        await this.el.click(this.loginButton);
        await this.el.getText(this.errorBox);
        console.log(this.errorBox);

    }
    
}

