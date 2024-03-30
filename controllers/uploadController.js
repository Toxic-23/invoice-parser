import { createError } from '../services/errorService.js'
import { processExcelFile } from '../services/excelService.js'

export const ERROR_MESSAGES = {
    NO_INVOICING_MONTH:
        'Query parameter invoicingMonth is required in format YYYY-MM',
    NO_FILE_PRESENT: 'Please, attach Excel file to the request!',
}

const EXCEL_MIME_TYPES = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
    'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
]

export const uploadExcelFile = (req, res, next) => {
    let binaryData = Buffer.alloc(0)

    const invoicingMonth = req.query?.invoicingMonth
    if (!invoicingMonth) {
        next(createError(400, ERROR_MESSAGES.NO_INVOICING_MONTH))
    }
    if (!EXCEL_MIME_TYPES.includes(req?.headers?.['content-type'])) {
        return next(createError(400, ERROR_MESSAGES.NO_FILE_PRESENT))
    }
    req.on('data', (chunk) => {
        binaryData = Buffer.concat([binaryData, chunk])
    })

    req.on('end', () => {
        try {
            const result = processExcelFile(binaryData, invoicingMonth)
            res.json(result)
        } catch (error) {
            next(error)
        }
    })
}
