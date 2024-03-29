export const extractCurrencyCodes = (text) => {
    const regex = /\b[A-Z]{3}\b/g // Matches three uppercase letters surrounded by word boundaries
    const matches = text.match(regex)
    return matches ? matches[0] : null
}
