export const isoDateToShortDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}