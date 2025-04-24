export const oneYearFromNow = () => {
    return new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 year in milliseconds
    );
}

export const thirtyDaysFromNow = () => {
    return new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    );
}