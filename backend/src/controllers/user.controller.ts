import catchErrors from '../utils/catchErrors';
import { signupUser, loginUser } from '../services/user.service';
import { CREATED, OK } from '../constants/http';
import { setAuthCookies } from '../utils/cookies';
import { signupSchema, loginSchema } from './user.schemas';

/**
 * Handles user signup by validating the request, creating a new user, and sending authentication cookies.
 */
export const signup = catchErrors(async (req, res) => {
    // validate request
    const request = signupSchema.parse({
        ...req.body,
        userAgent: req.headers['user-agent'],
    });
    // call service
    const { user, accessToken, refreshToken } = await signupUser(request);
    //return response
    return setAuthCookies({ res, accessToken, refreshToken })
        .status(CREATED).json(user);
});

export const login = catchErrors(async (req, res) => {
    const request = loginSchema.parse({
        ...req.body,
        userAgent: req.headers['user-agent'],
    });
    const { accessToken, refreshToken } = await loginUser(request);
    return setAuthCookies({ res, accessToken, refreshToken })
        .status(OK).json({ message: 'Logged in successfully' });
});

export const logout = catchErrors(async (req, res) => {
    const accessToken = req.cookies.accessToken;
    const { payload } = 
    const request = loginSchema.parse({
        ...req.body,
        userAgent: req.headers['user-agent'],
    });
    return res.status(OK).json({ message: 'User logged out' });
});