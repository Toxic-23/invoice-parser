import { parse, format } from 'date-fns'
import { ERROR_MESSAGES } from '../services/errorService.js'

export const convertDateFormat = (dateStr, inputFormat, outputFormat) => {
    // Attempt to parse date using the specified input format
    const parsedDate = parse(dateStr, inputFormat, new Date())

    // Check if parsing was successful
    if (!isNaN(parsedDate.getTime())) {
        // If parsing was successful, format the date using the specified output format
        return format(parsedDate, outputFormat)
    } else {
        throw new Error(
            ERROR_MESSAGES.INVALID_DATE_FORMAT(dateStr, inputFormat),
        )
    }
}
// Custom validation function for date format
export const validateExcelInputDate = (value, helpers) => {
    const regex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/
    return regex.test(value)
}

// Get the current year
export const currentYear = new Date().getFullYear()
