import { processExcelFile } from '../services/excelService.js'

export const uploadExcelFile = (req, res, next) => {
    let binaryData = Buffer.alloc(0)

    req.on('data', (chunk) => {
        binaryData = Buffer.concat([binaryData, chunk])
    })

    req.on('end', () => {
        const invoicingMonth = req.query.invoicingMonth
        try {
            const result = processExcelFile(binaryData, invoicingMonth)
            res.json(result)
        } catch (error) {
            next(error)
        }
    })
}
