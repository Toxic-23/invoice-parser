import fs from 'fs'
import path from 'path'

import * as excelService from '../../../services/excelService'
import * as errorService from '../../../services/errorService'
import * as extractDataService from '../../../services/extractDataService'
import * as schemas from '../../../models/schemas'
import * as dateUtils from '../../../utils/date'
import { ERROR_MESSAGES as DATE_UTIL_ERROR_MESSAGES } from '../../../utils/date'
import { ERROR_MESSAGES as SERVICE_ERROR_MESSAGES } from '../../../services/excelService'
jest.mock('../../../services/errorService.js', () => ({
    createError: jest.fn(),
}))
jest.mock('../../../services/extractDataService')
jest.mock('../../../models/schemas')
jest.mock('../../../utils/date')

describe('processExcelFile', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should throw an error if date format conversion fails', () => {
        const fileDataPath = path.join(
            __dirname,
            '../../fixtures/file_broken_date.xlsx',
        )
        const binaryData = fs.readFileSync(fileDataPath)
        const mockedError = new Error('Date format conversion error')

        extractDataService.extractDataFromExcel.mockReturnValueOnce({
            InvoicingMonth: 'Sep 2023',
            currencyRates: [],
            headings: ['Customer', 'Quantity'],
            invoicesData: [{}, {}],
        })
        dateUtils.convertDateFormat.mockImplementationOnce(() => {
            throw mockedError
        })

        excelService.processExcelFile(binaryData, '2023-09')

        expect(errorService.createError).toHaveBeenCalledWith(
            400,
            'Date format conversion error',
        )
    })

    it('should throw an error if input data validation fails', () => {
        const fileDataPath = path.join(__dirname, '../../fixtures/file.xlsx')
        const binaryData = fs.readFileSync(fileDataPath)
        const expectedInputParsedPath = path.join(
            __dirname,
            './mock/default_with_headings.json',
        )
        const expectedInputParsed = JSON.parse(
            fs.readFileSync(expectedInputParsedPath),
        )

        const invoicingMonthQuery = '2023-09'
        const validationError = [
            { message: 'Validation error 1' },
            { message: 'Validation error 2' },
        ]

        extractDataService.extractDataFromExcel.mockReturnValueOnce(
            expectedInputParsed,
        )
        dateUtils.convertDateFormat.mockReturnValueOnce('2023-09')
        schemas.validateInput.mockReturnValueOnce(validationError)

        excelService.processExcelFile(binaryData, invoicingMonthQuery)

        expect(errorService.createError).toHaveBeenCalledWith(
            400,
            SERVICE_ERROR_MESSAGES.WRONG_INPUT,
            ['Validation error 1', 'Validation error 2'],
        )
    })
})
