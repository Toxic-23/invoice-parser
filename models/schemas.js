import Joi from 'joi'

const MIN_LENGTH_CUST_NO = 5

export const ERROR_MESSAGES = {
    INVALID_EXCEL_DATE:
        'Invalid date format. Format should be like "Sep 2023".',
    INVALID_CURRENCY:
        'Invalid date format. Format should be like "EUR, USD or ILS".',
    MISSED_MANDATORY_HEADINGS: (headings) =>
        `You are missing mandatory headings in your data: ${headings.join(',')}`,
    INVALID_CUST_NO: `Cust No must be a ${MIN_LENGTH_CUST_NO}-digit number.`,
    NO_CURRENCIES_PRESENT: 'At least one currency is required.',
}

const MANDATORY_HEADINGS = [
    'Customer',
    "Cust No'",
    'Project Type',
    'Quantity',
    'Price Per Item',
    'Item Price Currency',
    'Total Price',
    'Invoice Currency',
    'Status',
]

export const INVOICE_STATUSES = {
    Ready: 'Ready',
    Done: 'Done',
}

export const statusesEnum = Object.values(INVOICE_STATUSES)

const projectTypesEnum = ['Finance', 'Marketing', '24/7 Support', 'Development']

export const validateExcelInputDate = (value, helpers) => {
    const regex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/
    if (!regex.test(value)) {
        return helpers.message(ERROR_MESSAGES.INVALID_EXCEL_DATE)
    }
    return value
}

export const validateCurrency = (value, helpers) => {
    const regex = /\b[A-Z]{3}\b/g
    if (!regex.test(value)) {
        return helpers.message(ERROR_MESSAGES.INVALID_CURRENCY)
    }
    return value
}

const validateMandatoryHeadings = (value, helpers) => {
    const missingHeadings = MANDATORY_HEADINGS.filter(
        (field) => !value.includes(field),
    )
    if (missingHeadings.length > 0) {
        return helpers.message(
            ERROR_MESSAGES.MISSED_MANDATORY_HEADINGS(missingHeadings),
        )
    }
    return value
}

export const recordSchema = Joi.object({
    Customer: Joi.string().required(),
    "Cust No'": Joi.number()
        .required()
        .custom((value, helpers) => {
            const strValue = String(value)
            if (strValue.length !== MIN_LENGTH_CUST_NO) {
                return helpers.message(ERROR_MESSAGES.INVALID_CUST_NO)
            }
            return strValue
        }),
    'Project Type': Joi.string()
        .required()
        .valid(...projectTypesEnum),
    Quantity: Joi.number().required(),
    'Price Per Item': Joi.number().required(),
    'Item Price Currency': Joi.string().custom(validateCurrency).required(),
    'Total Price': Joi.number().required(),
    'Invoice Currency': Joi.string().custom(validateCurrency).required(),
    Status: Joi.string()
        .required()
        .valid(...statusesEnum),
})

    .unknown(true)
    .options({ abortEarly: false })

const currenciesSchema = Joi.array()
    .items(
        Joi.object().pattern(
            Joi.string().custom(validateCurrency).required(),
            Joi.number().required(),
        ),
    )
    .min(1)
    .messages({
        'array.min': ERROR_MESSAGES.NO_CURRENCIES_PRESENT,
    })

export const inputSchema = Joi.object({
    InvoicingMonth: Joi.string()
        .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
        .required(),
    headings: Joi.array()
        .items(Joi.string())
        .sparse()
        .custom(validateMandatoryHeadings),
    currencyRates: currenciesSchema,
}).options({ abortEarly: false })

export const validateInput = (input) =>
    inputSchema.validate(input)?.error?.details

export const validateRecord = (record) => recordSchema.validate(record)
