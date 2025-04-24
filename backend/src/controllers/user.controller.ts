import { z } from 'zod';
import catchErrors from '../utils/catchErrors';

const userSchema = z.object({
    email: z.string().email().min(1).max(255),
    username: z.string().min(1).max(255),
    password: z.string().min(6).max(255),
    userAgent: z.string().optional(),
});

export const signup = catchErrors(async (req, res) => {
    // validate request
    const request = userSchema.parse({
        ...req.body,
        userAgent: req.headers['user-agent'],
    });
    // call service

    //return response
});

// export const login = async (req: Request, res: Response) => {
//     try {
//         const result = await userService.loginUser(req.body);
//         res.status(200).json(result);
//     } catch (error) {
//         res.status(500).json(getErrorMessage(error));
//     }
// };