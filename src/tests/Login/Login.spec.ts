import {test, expect } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { createLogger } from '@utils/logger';

const log=createLogger('login.spec');


  test.describe('TTA Cart ',()=>{

    // Groups all Login tests into one test suite.
    let loginPage: LoginPage;

    // Runs before every test.
    test.beforeEach('Login Page', async({page})=>{
        // Creates LoginPage object using Playwright page.
        loginPage= new LoginPage(page);

        await test.step('Open the LoginPage', async()=>{
            // Creates a named step in the Playwright report.
            log.info('Open The TTA Cart');
            // Prints execution log.
            await loginPage.open();
            // Opens the Login Page.
        });
    });

    // Valid Login test.
    test('Login with Valid UserName and Password @p0', async({page})=>{

        await test.step('Step 1', async()=>{
            // Creates Step 1 in the report.
            log.info('Logging in as standard_user');
            // Prints login information.
            await loginPage.LoginAs('standard_user', 'tta_secret');
            // Performs login with valid credentials.
        });
 
        await test.step('Verify login form is no longer shown', async () => {
            // Creates verification step.
            log.info('Asserting login form is hidden after login');
            // Prints verification information.
            await expect(page.locator('[data-test="login-button"]')).toBeHidden();
            // Verifies Login button is hidden after successful login.
        });
    });

    // Invalid Login test.
    test('Loging With Invalid UserName and Passwor @p1', async({page})=>{

        await test.step('step 1', async()=>{
            // Creates Step 1 in the report.
            log.info("Login As invalid user");
            // Prints execution log.
            await loginPage.LoginAsInvalid('Nonstand_User','ABC@123');
            // Performs login with invalid credentials.
        });

        await test.step('step 2', async()=>{
            // Creates Step 2 in the report.
            log.info('Asserting login form is hidden after login');
            // Prints verification log.
            await expect(page.locator('[data-test="error"]')).toHaveText(
                'Epic sadface: Username and password do not match any user in this service'
            );
            // Verifies the expected invalid-login error message.
        });
    });

});