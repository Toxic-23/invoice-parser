import fs from 'fs'
import path from 'path'

import * as excelService from '../../../services/excelService'
import * as errorService from '../../../services/errorService'
import * as extractDataService from '../../../services/extractDataService'
import * as schemas from '../../../models/schemas'
import * as dateUtils from '../../../utils/date'

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
    it('should process the Excel file correctly and return data', () => {
        const fileDataPath = path.join(__dirname, '../../file.xlsx')
        const binaryData = fs.readFileSync(fileDataPath)

        const expectedResultPath = path.join(__dirname, './mock/default.json')
        const expectedResult = JSON.parse(fs.readFileSync(expectedResultPath))

        const expectedHeadingsPath = path.join(
            __dirname,
            './mock/default_with_headings.json',
        )
        const expectedHeadings = JSON.parse(
            fs.readFileSync(expectedHeadingsPath),
        )

        extractDataService.extractDataFromExcel.mockReturnValueOnce(
            expectedHeadings,
        )
        dateUtils.convertDateFormat.mockReturnValueOnce(
            expectedResult.InvoicingMonth,
        )
        schemas.validateInput.mockReturnValueOnce(null)
        extractDataService.parseInvoicesData.mockReturnValueOnce(
            expectedResult.invoicesData,
        )
        const result = excelService.processExcelFile(
            binaryData,
            expectedResult.InvoicingMonth,
        )
        expect(result).toEqual(expectedResult)
        expect(errorService.createError).not.toHaveBeenCalled()
    })

    it('should throw an error if dates are ', () => {
        const fileDataPath = path.join(__dirname, '../../file_broken_date.xlsx')
        const binaryData = fs.readFileSync(fileDataPath)

        const expectedInputParsedPath = path.join(
            __dirname,
            './mock/default_with_headings.json',
        )
        const expectedInputParsed = JSON.parse(
            fs.readFileSync(expectedInputParsedPath),
        )

        const invoicingMonthQuery = '2023-09'

        extractDataService.extractDataFromExcel.mockReturnValueOnce(
            expectedInputParsed,
        )

        excelService.processExcelFile(binaryData, invoicingMonthQuery)
        expect(errorService.createError).toHaveBeenCalled()
    })
})
