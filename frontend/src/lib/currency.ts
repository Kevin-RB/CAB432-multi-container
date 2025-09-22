
export const formatCurrency = (value: number, currency: string = 'AUD'): string => {
    return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency,
    }).format(value);
}