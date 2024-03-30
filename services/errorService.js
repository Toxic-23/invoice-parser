export const errorHandler = (error, req, res, next) => {
    console.error(error.stack)
    const statusCode = error.statusCode
    console.log(statusCode)
    res.status(statusCode).json({
        message: error.message,
        details: error.details,
    })
}

export const createError = (statusCode, message, details) => {
    const error = new Error(message)
    error.statusCode = statusCode || 500
    error.details = details
    throw error
}
