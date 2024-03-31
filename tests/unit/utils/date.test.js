import * as dateFns from 'date-fns'
import {
    convertDateFormat,
    validateExcelInputDate,
    ERROR_MESSAGES,
    currentYear,
} from '../../../utils/date'

jest.mock('date-fns', () => ({
    parse: jest.fn(),
    format: jest.fn(),
}))

describe('date util', () => {
    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe('convertDateFormat', () => {
        it('should correctly convert date format', () => {
            const inputDateStr = '01 Jan 2022'
            const inputFormat = 'dd MMM yyyy'
            const outputFormat = 'yyyy-MM-dd'
            const expectedOutput = '2022-01-01'

            dateFns.parse.mockReturnValue(new Date(inputDateStr))
            dateFns.format.mockReturnValue(expectedOutput)

            const result = convertDateFormat(
                inputDateStr,
                inputFormat,
                outputFormat,
            )

            expect(result).toEqual(expectedOutput)
            expect(dateFns.parse).toHaveBeenCalledWith(
                inputDateStr,
                inputFormat,
                expect.any(Date),
            )
            expect(dateFns.format).toHaveBeenCalledWith(
                new Date(inputDateStr),
                outputFormat,
            )
        })

        it('should throw error for invalid date format', () => {
            const inputDateStr = 'Invalid Date'
            const inputFormat = 'dd MMM yyyy'

            dateFns.parse.mockReturnValue(new Date(NaN))

            expect(() => {
                convertDateFormat(inputDateStr, inputFormat, 'yyyy-MM-dd')
            }).toThrowError(
                ERROR_MESSAGES.INVALID_DATE_FORMAT(inputDateStr, inputFormat),
            )
        })
    })

    describe('validateExcelInputDate', () => {
        it('should return true for valid date format', () => {
            const validDateStr = 'Jan 2022'
            expect(validateExcelInputDate(validDateStr)).toBe(true)
        })

        it('should return false for invalid date format', () => {
            const invalidDateStr = 'Invalid Date'
            expect(validateExcelInputDate(invalidDateStr)).toBe(false)
        })
    })

    describe('currentYear', () => {
        it('should return the current year', () => {
            const expectedYear = new Date().getFullYear()
            expect(currentYear).toEqual(expectedYear)
        })
    })
})
