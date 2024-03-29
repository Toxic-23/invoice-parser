import { validateInput, validateRecord } from './validationService.js'
import { convertDateFormat } from '../utils/date.js'
import { ERROR_MESSAGES, createError } from './errorService.js'
import {
    extractDataFromExcel,
    parseInvoicesData,
} from './exctractDataService.js'

export const processExcelFile = (binaryData, invoicingMonthQuery) => {
    // read input
    let { InvoicingMonth, currencyRates, headings, invoicesData } =
        extractDataFromExcel(binaryData)
    // convert Excel date to needed format
    try {
        InvoicingMonth = convertDateFormat(
            InvoicingMonth,
            'MMM yyyy',
            'yyyy-MM',
        )
    } catch (err) {
        createError(400, err.message)
    }
    // validate input data
    let inputErrors = validateInput({ InvoicingMonth, currencyRates, headings })

    if (inputErrors.error?.details) {
        createError(400, ERROR_MESSAGES.WRONG_INPUT, inputErrors.error.details)
    }

    // validate Excel date corresponds date in query parameter
    if (InvoicingMonth !== invoicingMonthQuery) {
        createError(400, ERROR_MESSAGES.INCOMPATIBLE_DATES)
    }

    invoicesData = parseInvoicesData(invoicesData, currencyRates)

    return { InvoicingMonth, invoicesData, currencyRates }
}
