import { z } from 'zod';
import catchErrors from '../utils/catchErrors';
import { signupUser } from '../services/user.service';
import { CREATED } from '../constants/http';
import { setAuthCookies } from '../utils/cookies';

const userSchema = z.object({
    email: z.string().email().min(1).max(255),
    username: z.string().min(1).max(255),
    password: z.string().min(6).max(255),
    userAgent: z.string().optional(),
});

/**
 * Handles user signup by validating the request, creating a new user, and sending authentication cookies.
 */
export const signup = catchErrors(async (req, res) => {
    // validate request
    const request = userSchema.parse({
        ...req.body,
        userAgent: req.headers['user-agent'],
    });
    // call service
    const { user, accessToken, refreshToken } = await signupUser(request);
    //return response
    return setAuthCookies({ res, accessToken, refreshToken })
    .status(CREATED).json(user);
});