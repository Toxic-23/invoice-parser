import fs from 'fs'
import path from 'path'
import {
    uploadExcelFile,
    ERROR_MESSAGES,
} from '../../../controllers/uploadController.js'
import { createError } from '../../../services/errorService.js'
import { processExcelFile } from '../../../services/excelService.js'

const mockRequest = (
    query,
    headers,
    fileData,
    onDataCallback,
    onEndCallback,
) => ({
    query,
    headers,
    fileData,
    on: jest.fn((event, callback) => {
        if (event === 'data') {
            onDataCallback(callback)
        } else if (event === 'end') {
            onEndCallback(callback)
        }
    }),
})

const mockResponse = () => {
    const res = {}
    res.json = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    return res
}

const mockNext = jest.fn()

jest.mock('../../../services/excelService.js', () => ({
    processExcelFile: jest.fn(),
}))

jest.mock('../../../services/errorService.js', () => ({
    createError: jest.fn(),
}))

describe('uploadExcelFile controller', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should respond with an error if no invoicingMonth query parameter is provided', () => {
        const req = mockRequest(null, null, null, jest.fn(), jest.fn())
        const res = mockResponse()
        uploadExcelFile(req, res, mockNext)
        expect(createError).toHaveBeenCalledWith(
            400,
            ERROR_MESSAGES.NO_INVOICING_MONTH,
        )
    })

    it('should respond with an error if no file is attached to the request', () => {
        const req = mockRequest(
            { invoicingMonth: '2024-03' },
            { 'content-type': 'invalid/mime-type' },
            null,
            jest.fn(),
            jest.fn(),
        )
        const res = mockResponse()
        uploadExcelFile(req, res, mockNext)
        expect(createError).toHaveBeenCalledWith(
            400,
            ERROR_MESSAGES.NO_FILE_PRESENT,
        )
    })

    it('should respond with an error if invalid file is attached to the request', () => {
        const fileDataPath = path.join(__dirname, '../../txt_file.txt')
        const fileData = fs.readFileSync(fileDataPath)
        const req = mockRequest(
            { invoicingMonth: '2023-03' },
            {
                'content-type': 'text/plain',
            },
            fileData,
            jest.fn((callback) => callback(fileData)),
            jest.fn((callback) => callback()),
        )
        const res = mockResponse()
        uploadExcelFile(req, res, mockNext)
        expect(createError).toHaveBeenCalledWith(
            400,
            ERROR_MESSAGES.NO_FILE_PRESENT,
        )
    })

    it('should process the Excel file and send the result as JSON', () => {
        const fileDataPath = path.join(__dirname, '../../file.xlsx')
        const fileData = fs.readFileSync(fileDataPath)
        const req = mockRequest(
            { invoicingMonth: '2024-03' },
            {
                'content-type':
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
            fileData,
            jest.fn((callback) => callback(fileData)),
            jest.fn((callback) => callback()),
        )
        const res = mockResponse()
        const expectedResultPath = path.join(__dirname, './mock/default.json')
        const expectedResult = JSON.parse(fs.readFileSync(expectedResultPath))

        processExcelFile.mockReturnValue(expectedResult)

        uploadExcelFile(req, res, mockNext)
        expect(res.json).toHaveBeenCalledWith(expectedResult)
    })

    it('should call next with error if processing Excel file throws an error', () => {
        const req = mockRequest(
            '2024-03',
            {
                'content-type':
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
            Buffer.from('dummy data'),
            jest.fn((callback) => callback(Buffer.from('dummy data'))),
            jest.fn((callback) => callback()),
        )
        const res = mockResponse()
        const error = new Error('Some error')

        processExcelFile.mockImplementation(() => {
            throw error
        })

        uploadExcelFile(req, res, mockNext)

        expect(mockNext).toHaveBeenCalledWith(error)
    })
})
