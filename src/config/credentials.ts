// Export the credentials object so it can be imported and used
// in other files such as LoginPage.ts or Login.spec.ts.
export const credentials = {

    // Read the STANDARD_USER value from the environment variable.
    // If STANDARD_USER is not available, use 'standard_user' as the fallback value.
    standardUser: process.env.STANDARD_USER ?? 'standard_user',

    // Read the TTA_SECRET value from the environment variable.
    // If TTA_SECRET is not available, use 'tta_secret' as the fallback value.
    password: process.env.TTA_SECRET ?? 'tta_secret',

// 'as const' makes the properties read-only.
// This prevents the credential values from being changed accidentally.
} as const;