import fs from 'fs'
import path from 'path'
import * as extractDataService from '../../../services/extractDataService'

describe('extractDataService', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })
    describe('extractDataFromExcel', () => {
        it('should extract data from Excel file correctly', () => {
            const fileDataPath = path.join(
                __dirname,
                '../../fixtures/file.xlsx',
            )
            const binaryData = fs.readFileSync(fileDataPath)

            const result = extractDataService.extractDataFromExcel(binaryData)

            expect(result.InvoicingMonth).toEqual('Sep 2023')
            expect(result.currencyRates).toEqual([
                {
                    USD: 3.849,
                },
                {
                    EUR: 4.0575,
                },
                {
                    GBP: 4.7003,
                },
            ])
            expect(result.headings).toHaveLength(11)
            expect(result.invoicesData).toHaveLength(29)
        })
    })

    describe('parseInvoicesData', () => {
        it('should extract relevant invoices from the file correctly', () => {
            const fileDataPath = path.join(
                __dirname,
                '../../fixtures/file.xlsx',
            )
            const binaryData = fs.readFileSync(fileDataPath)

            const parsedInput =
                extractDataService.extractDataFromExcel(binaryData)
            const result = extractDataService.parseInvoicesData(
                parsedInput.invoicesData,
                parsedInput.currencyRates,
            )

            const invoicesWithMissingCurrency = result.filter(
                (invoice) => !invoice['Invoice Currency'],
            )
            expect(invoicesWithMissingCurrency.length).toBeGreaterThan(0)

            invoicesWithMissingCurrency.forEach((invoice) => {
                let errors = invoice.validationErrors.filter(
                    (i) => i === '"Invoice Currency" must be a string',
                )
                expect(errors).toHaveLength(1)
            })
        })
    })
})
