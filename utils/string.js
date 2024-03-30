export const extractCurrencyCodes = (text) => {
    const regex = /\b[A-Z]{3}\b/g
    const matches = text.match(regex)
    return matches ? matches[0] : null
}
