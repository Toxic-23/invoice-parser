import Joi from 'joi'
import { ERROR_MESSAGES } from '../services/errorService.js'

const minLengthCustNo = 5
// Exact values for mandatory headings
const mandatoryHeadings = [
    'Customer',
    'Cust No',
    'Project Type',
    'Quantity',
    'Price Per Item',
    'Item Price Currency',
    'Total Price',
    'Invoice Currency',
    'Status',
    // Add more mandatory headings as needed
]

export const INVOICE_STATUSES = {
    Ready: 'Ready',
    Done: 'Done',
}
// Status ENUM
export const statusesEnum = Object.values(INVOICE_STATUSES)
// Project type ENUM
const projectTypesEnum = ['Finance', 'Marketing', '24/7 Support', 'Development']
// Custom validation function for date format
export const validateExcelInputDate = (value, helpers) => {
    const regex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/
    if (!regex.test(value)) {
        return helpers.message(
            ERROR_MESSAGES.INVALID_EXCEL_DATE,
        )
    }
    return value
}
// Custom currency function for currencies
export const validateCurrency = (value, helpers) => {
    const regex = /\b[A-Z]{3}\b/g
    if (!regex.test(value)) {
        return helpers.message(
            ERROR_MESSAGES.INVALID_CURRENCY,
        )
    }
    return value
}
// Schema for individual records
export const recordSchema = Joi.object({
    Customer: Joi.string().required(),
    "Cust No'": Joi.number()
        .required()
        .custom((value, helpers) => {
            const strValue = String(value) // Convert number to string
            if (strValue.length !== minLengthCustNo) {
                return helpers.message(
                    `Cust No must be a ${minLengthCustNo}-digit number.`,
                )
            }
            return strValue // Return the string value if it passes validation
        }),
    'Project Type': Joi.string()
        .required()
        .valid(...projectTypesEnum),
    Quantity: Joi.number().required(),
    'Price Per Item': Joi.number().required(),
    'Item Price Currency': Joi.string()
        .custom(validateCurrency, 'custom date format')
        .required(),
    'Total Price': Joi.number().required(),
    'Invoice Currency': Joi.string()
        .custom(validateCurrency, 'custom date format')
        .required(),
    Status: Joi.string()
        .required()
        .valid(...statusesEnum),
})

    .unknown(true) // Allow any additional fields
    .options({ abortEarly: false })

// Define the schema for the array of currency objects
const currenciesSchema = Joi.array()
    .items(
        Joi.object().pattern(
            Joi.string()
                .custom(validateCurrency, 'Currency key validation')
                .required(),
            Joi.number().required(),
        ),
    )
    .min(1) // At least one currency object is required

// Schema for input
export const inputSchema = Joi.object({
    InvoicingMonth: Joi.string()
        .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
        .required(),
    headings: Joi.array()
        .items(
            Joi.string().valid(...mandatoryHeadings), // Specify exact values for mandatory headings
            Joi.string(), // Allow any additional string for headings
        )
        .unique() // Ensure uniqueness of headings
        .required(),
    currencyRates: currenciesSchema,
}).options({ abortEarly: false })
