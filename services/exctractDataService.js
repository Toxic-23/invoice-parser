import xlsx from 'xlsx'
import { validateRecord } from './validationService.js'
import { extractCurrencyCodes } from '../utils/string.js'
import { INVOICE_STATUSES } from '../models/schemas.js'
import { ERROR_MESSAGES } from './errorService.js'

export const extractDataFromExcel = (binaryData) => {
    const workbook = xlsx.read(binaryData, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const sheetContent = xlsx.utils.sheet_to_json(sheet, { header: 1 })

    let InvoicingMonth,
        currencyRates = [],
        headings,
        invoicesData = []

    let foundHeadings = false

    for (const entry of sheetContent) {
        if (!foundHeadings && entry.length > 2) {
            headings = entry
            foundHeadings = true
        } else if (foundHeadings && entry.length > 0) {
            const record = {}
            headings.forEach((heading, index) => {
                record[heading] = entry[index] || null // Set null for missing values
            })
            let validationErrors = validateRecord(record)
            record.validationErrors =
                validationErrors.error?.details?.map((e) => e.message) || []
            invoicesData.push(record)
        } else if (
            !InvoicingMonth &&
            typeof entry[0] === 'string' &&
            !isNaN(Date.parse(entry[0]))
        ) {
            InvoicingMonth = entry[0]
        } else if (
            entry.length === 2 &&
            typeof entry[0] === 'string' &&
            typeof entry[1] === 'number'
        ) {
            let key = extractCurrencyCodes(entry[0])
            currencyRates.push({ [key]: entry[1] })
        }
    }

    return { InvoicingMonth, currencyRates, headings, invoicesData }
}

export const parseInvoicesData = (invoicesData, currencyRates) => {
    invoicesData = invoicesData.filter(
        (invoice) =>
            invoice.Status === INVOICE_STATUSES.Ready || invoice['Invoice #'],
    )
    invoicesData.forEach((invoice) => {
        let validationErrors = validateRecord(invoice)
        validationErrors =
            validationErrors.error?.details?.map((e) => e.message) || []
        let totalPrice = invoice['Total Price']
        if (totalPrice && Number.isInteger(totalPrice)) {
            let invoiceCurrency = invoice['Invoice Currency']
            if (!invoiceCurrency) {
                validationErrors.push(
                    ERROR_MESSAGES.INVOICE_CURRENCY_NOT_PRESENT,
                )
            } else {
                let rate = currencyRates.find(
                    (currency) => Object.keys(currency)[0] === invoiceCurrency,
                )
                rate = rate?.[invoiceCurrency]
                if (rate === undefined) {
                    validationErrors.push(
                        ERROR_MESSAGES.NO_CURRENCY_RATE_PRESENT(
                            invoiceCurrency,
                        ),
                    )
                } else {
                    invoice['Invoice Total'] = totalPrice * rate
                }
            }
        } else {
            validationErrors.push(ERROR_MESSAGES.TOTAL_PRICE_NOT_PRESENT)
        }

        invoice.validationErrors = validationErrors || []
    })
    return invoicesData
}
