import {test, expect } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { createLogger } from '@utils/logger';

const log=createLogger('login.spec');

test.describe('TTA Cart ',()=>{

    let loginPage: LoginPage;

    test.beforeEach('Login Page', async({page})=>{
        loginPage= new LoginPage(page);

        await test.step('Open the LoginPage', async()=>{
            log.info('Open The TTA Cart');
            await loginPage.open();
        });
    });

    test('Login with Valid UserName and Password @p0', async({page})=>{

        await test.step('Step 1', async()=>{
            log.info('Logging in as standard_user');
            await loginPage.LoginAs('standard_user', 'tta_secret');
        });

        await test.step('Verify login form is no longer shown', async () => {
            log.info('Asserting login form is hidden after login');
            await expect(page.locator('[data-test="login-button"]')).toBeHidden();
        });
    });

    test('Loging With Invalid UserName and Passwor @p1', async({page})=>{

        await test.step('step 1', async()=>{
            log.info("Login As invalid user");
            await loginPage.LoginAsInvalid('Nonstand_User','ABC@123');
        });

        await test.step('step 2', async()=>{
            log.info('Asserting login form is hidden after login');
            await expect(page.locator('[data-test="error"]')).toHaveText(
                'Epic sadface: Username and password do not match any user in this service'
            );
        });
    });

});