import bcrypt from 'bcrypt'; // Hashing/salting

/**
 * Hashes a password with bcrypt.
 */
export const hashValue = async (val: string, saltRounds?: number) => {
    return bcrypt.hash(val, saltRounds || 10);
};

/**
 * Compares a password with a hashed password using bcrypt.
 */
export const compareValue = async (val: string, hashedVal: string) => {
    return bcrypt.compare(val, hashedVal).catch(() => false); // Returns false if error thrown
};