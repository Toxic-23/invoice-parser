export const ERROR_MESSAGES = {
    INTERNAL_SERVER_ERROR: 'Internal Server Error',
    WRONG_INPUT: 'Invalid input data',
    INCOMPATIBLE_DATES: 'Dates are different in query and file!',
    INVALID_DATE_FORMAT: (str, format) =>
        `Invalid date format at file: ${str}. Expected: ${format}`,
    TOTAL_PRICE_NOT_PRESENT:
        'It is impossible to calculate Invoice Total, because there is no Total Price or Total Price is not a number.',
    INVOICE_CURRENCY_NOT_PRESENT:
        'It is impossible to calculate Invoice Total, because there is no Invoice Currency.',
    NO_CURRENCY_RATE_PRESENT: (currency) =>
        `It is impossible to calculate Invoice Total, because there is no rate present for currency ${currency}`,
    INVALID_EXCEL_DATE: 'Invalid date format. Format should be like "Sep 2023".',
    INVALID_CURRENCY: 'Invalid date format. Format should be like "EUR, USD or ILS".',
    INVALID_CUSTOMER_NUMBER_LENGTH: (length) => `Cust No\` must be a ${length}-digit number.`
}
// Function to handle and format errors
export const errorHandler = (error, req, res, next) => {
    console.error(error.stack)
    const statusCode = error.statusCode || 500
    console.log(statusCode)
    res.status(statusCode).json({
        message: error.message,
        details: error.details,
    })
}

// Function to create custom errors
export const createError = (statusCode, message, details) => {
    const error = new Error(message)
    error.statusCode = statusCode
    error.details = details
    throw error
}
