export const oneYearFromNow = () => {
    return new Date(
        Date.now() + 365 * ONE_DAY_MS // 1 year in milliseconds
    );
}

export const thirtyDaysFromNow = () => {
    return new Date(
        Date.now() + 30 * ONE_DAY_MS // 30 days in milliseconds
    );
}

export const oneHourFromNow = () => {
    return new Date(
        Date.now() + 60 * 60 * 1000 // 1 hour in milliseconds
    );
}

export const fifteenMinutesFromNow = () => {
    return new Date(
        Date.now() + 15 * 60 * 1000 // 15 minutes in milliseconds
    );
}

export const fiveMinutesAgo = () => {
    return new Date(
        Date.now() - 5 * 60 * 1000 // 5 minutes in milliseconds
    );
}

export const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 1 day in milliseconds