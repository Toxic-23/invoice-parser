import { inputSchema, recordSchema } from '../models/schemas.js'

export const validateInput = (input) => inputSchema.validate(input)

export const validateRecord = (record) => recordSchema.validate(record)
