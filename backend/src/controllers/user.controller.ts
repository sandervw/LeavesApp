import { NOT_FOUND, OK } from '../constants/http';
import UserModel from '../models/user.model';
import appAssert from '../utils/appAssert';
import { catchErrors } from '../utils/errorUtils';

/**
 * Retrieves the user information (sans password) by userId
 * No need to validate request, as authenticate middleware already does that
 * No need for a service either, as this is a simple query to the database
 */
export const getUserController = catchErrors(async (req, res) => {
    const user = await UserModel.findById(req.userId);
    appAssert(user, NOT_FOUND, 'User not found');
    return res.status(OK).json(user.omitPassword());
});