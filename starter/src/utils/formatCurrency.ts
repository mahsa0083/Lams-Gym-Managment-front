function formatCurrency(
    value: number,
    currency: string = 'USD',
    locale = 'en-US',
    decimals: number = 0,
) {
    const options: Intl.NumberFormatOptions = {
        style: 'currency',
        currency,
    }

    if (typeof decimals === 'number') {
        options.minimumFractionDigits = decimals
        options.maximumFractionDigits = decimals
    }

    return new Intl.NumberFormat(locale, options).format(value)
}

export default formatCurrency
