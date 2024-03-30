import { errorHandler, createError } from '../../../services/errorService'

jest.spyOn(console, 'error').mockImplementation(() => {})

describe('errorService', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('errorHandler', () => {
        it('should respond with correct status code and message', () => {
            const error = new Error('Test error')
            error.statusCode = 404
            error.details = { additionalInfo: 'Additional information' }

            const req = {}
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            }
            const next = jest.fn()

            errorHandler(error, req, res, next)

            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith({
                message: 'Test error',
                details: { additionalInfo: 'Additional information' },
            })
            expect(next).not.toHaveBeenCalled()
        })

        it('should log error stack to console', () => {
            const error = new Error('Test error for logging')

            const req = {}
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            }
            const next = jest.fn()

            errorHandler(error, req, res, next)

            expect(console.error).toHaveBeenCalledWith(error.stack)
            expect(next).not.toHaveBeenCalled()
        })
    })

    describe('createError', () => {
        it('should create an error object with provided status code, message, and details', () => {
            const statusCode = 403
            const message = 'Forbidden'
            const details = { reason: 'Permission denied' }

            try {
                createError(statusCode, message, details)
            } catch (error) {
                expect(error.statusCode).toBe(403)
                expect(error.message).toBe(message)
                expect(error.details).toEqual(details)
            }
        })

        it('should throw an error with default status code if not provided', () => {
            const message = 'Test error without status code'

            try {
                createError(undefined, message)
            } catch (error) {
                expect(error.statusCode).toBe(500)
                expect(error.message).toBe('Test error without status code')
                expect(error.details).toBeUndefined()
            }
        })
    })
})
