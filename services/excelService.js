import { validateInput } from '../models/schemas.js'
import { convertDateFormat } from '../utils/date.js'
import { createError } from './errorService.js'
import {
    extractDataFromExcel,
    parseInvoicesData,
} from './extractDataService.js'

export const ERROR_MESSAGES = {
    WRONG_INPUT: 'Invalid input data',
    INCOMPATIBLE_DATES: 'Dates are different in query and file!',
}

export const processExcelFile = (binaryData, invoicingMonthQuery) => {
    let { InvoicingMonth, currencyRates, headings, invoicesData } =
        extractDataFromExcel(binaryData)

    try {
        InvoicingMonth = convertDateFormat(
            InvoicingMonth,
            'MMM yyyy',
            'yyyy-MM',
        )
    } catch (err) {
        createError(400, err.message)
    }
    let inputErrors = validateInput({ InvoicingMonth, currencyRates, headings })
    if (inputErrors) {
        createError(
            400,
            ERROR_MESSAGES.WRONG_INPUT,
            inputErrors.map(({ message }) => message),
        )
    }
    if (InvoicingMonth !== invoicingMonthQuery) {
        createError(400, ERROR_MESSAGES.INCOMPATIBLE_DATES)
    }
    invoicesData = parseInvoicesData(invoicesData, currencyRates)
    return { InvoicingMonth, invoicesData, currencyRates }
}
