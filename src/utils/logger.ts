// Logger is used to record the execution of the automation framework.
// 1. Import Winston
//    → Use Winston as the logging library of node.js.
//  Winston is a popular logging library that provides flexible logging options, including log levels, 
// formatting, and transports (where logs are sent).

import winston from 'winston';
// Get Winston formatting functions
// combine   → Combine formats
// timestamp → Add date & time
// printf    → Create custom log format
// colorize  → Add color to console logs
// errors    → Capture error stack
const { combine, timestamp, printf, colorize, errors } = winston.format;

// 2. Set LOG_LEVEL
//    → Decide which logs should be shown.
//      info, debug, warn, error
const LOG_LEVEL = process.env.LOG_LEVEL ?? 'info';


// 3. Create log format
// → Define how each log should look:
// Date + Level + Page + Message
// | Term            | Meaning                                                     | Example                          |
// | --------------- | ----------------------------------------------------------- | -------------------------------- |
// | `level`         | **Type/severity of log**                                    | `info`, `warn`, `error`, `debug` |
// | `message`       | **Actual information you want to log**                      | `"Login successful"`             |
// | `timestamp`     | **Date and time when log was created**                      | `2026-06-02 07:40:01`            |
// | `timestamp: ts` | Renames `timestamp` to **`ts`** for shorter use             | `ts` = `2026-06-02 07:40:01`     |
// | `scope`         | **Where the log came from**, usually Page Object/class name | `LoginPage`                      |
const lineFormat = printf(({ level, message, timestamp: ts, scope }) => {

// Ternary operator:
// scope exists → add [scope]
// scope doesn't exist → add nothing    
const tag = scope ? ` [${scope as string}]` : '';

// Example:
// 2026-06-02 07:40:01 [info] [LoginPage] clicked button
// ts        → timestamp() → Current date & time
// level     → logger.info()/warn()/error()/debug()
// message   → Message passed to logger
// scope     → createLogger('LoginPage')
    return `${ts as string} [${level}]${tag} ${message as string}`;
});


// 4. Create Logger
// → Create the main/shared logger.
export const logger = winston.createLogger({

    level: LOG_LEVEL,

    format: combine(
        errors({ stack: true }),                       // Capture error stack
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add date & time
        lineFormat,                                    // Apply custom format
    ),
    
// Main format → Common/default formatting
// Console format → Console-specific formatting + color
// File transport → Saves logs in combined.log
//
// In short:
// Main format = Common rules
// Console = Display logs
// File = Store logs

    // 5. Add Transports
    //    → Decide where logs will go:
    //      Console → Shows logs in terminal
    //      File    → Saves logs in logs/combined.log
    transports: [

        new winston.transports.Console({
            format: combine(
                colorize({ level: true }),              // Color log level
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                lineFormat,
            ),
        }),

        new winston.transports.File({
            filename: 'logs/combined.log'
        }),
    ],
});


// 6. Create Scoped Logger
//    → createLogger('LoginPage') creates a logger for LoginPage
//      and automatically adds [LoginPage].
export function createLogger(scope: string): winston.Logger {

    return logger.child({ scope });
}


// Define Logger as Winston Logger type
export type Logger = winston.Logger;


// Export logger as default
export default logger;


// 7. Use Logger
//    → logger.info()  → Normal information
//      logger.warn()  → Warning
//      logger.error() → Error
//      logger.debug() → Detailed information


// In short:
//
// Test Execution
//       ↓
//     Logger
//       ↓
// Console + Log File
//
// Logger tells us:
// WHAT happened + WHEN it happened + WHERE it happened