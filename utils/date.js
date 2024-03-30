import { parse, format } from 'date-fns'

export const ERROR_MESSAGES = {
    INVALID_DATE_FORMAT: (str, format) =>
        `Invalid date format at file: ${str}. Expected: ${format}`,
}

export const convertDateFormat = (dateStr, inputFormat, outputFormat) => {
    const parsedDate = parse(dateStr, inputFormat, new Date())
    if (!isNaN(parsedDate.getTime())) {
        return format(parsedDate, outputFormat)
    } else {
        throw new Error(
            ERROR_MESSAGES.INVALID_DATE_FORMAT(dateStr, inputFormat),
        )
    }
}

export const validateExcelInputDate = (value, helpers) => {
    const regex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/
    return regex.test(value)
}

export const currentYear = new Date().getFullYear()
