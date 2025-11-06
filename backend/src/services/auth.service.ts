import VerificationCodeType from '../constants/verificationCodeType';
import SessionModel from '../models/session.model';
import UserModel from '../models/user.model';
import VerificationCodeModel from '../models/verificationCode.model';
import { fiveMinutesAgo, ONE_DAY_MS, oneHourFromNow, oneYearFromNow, thirtyDaysFromNow } from '../utils/date';
import appAssert from '../utils/appAssert';
import { CONFLICT, INTERNAL_SERVER_ERROR, NOT_FOUND, UNAUTHORIZED } from '../constants/http';
import { RefreshTokenPayload, refreshTokenSignOptions, signToken, verifyToken } from '../utils/jwt';
import { sendMail } from '../utils/emailUtils';
import { getPasswordResetTemplate, getVerifyEmailTemplate } from '../utils/emailUtils';
import { APP_ORIGIN } from '../constants/env';
import { mongoId } from '../schemas/mongo.schema';

export type SignupUserParams = {
  email: string;
  username: string;
  password: string;
  userAgent?: string;
};

/**
 * Creates a new user and returns the user and authentication tokens.
 * @param userData.email - The email of the user
 * @param userData.username - The username of the user
 * @param userData.password - The password of the user
 * @returns The created user and the access and refresh tokens
 */
export const signupUser = async (userData: SignupUserParams) => {
  // Verify existing user doesn't exist
  const existingUser = await UserModel.exists({ $or: [{ email: userData.email }, { username: userData.username }] });
  appAssert(!existingUser, CONFLICT, 'Email/Username already in use');
  // Create user
  const user = await UserModel.create({
    email: userData.email,
    username: userData.username,
    password: userData.password,
  });
  // Create verification code
  const verificationCode = await VerificationCodeModel.create({
    userId: user._id,
    codeType: VerificationCodeType.EMAILVERIFICATION,
    expiresAt: oneYearFromNow(),
  });
  // Send verification email
  const verificationUrl = `${APP_ORIGIN}/email/verify/${verificationCode._id}`;
  await sendMail({
    to: user.email,
    ...getVerifyEmailTemplate(verificationUrl),
  });
  // Create session (unit of time user is logged in for)
  const session = await SessionModel.create({
    userId: user._id,
    userAgent: userData.userAgent,
  });
  const sessionInfo = { sessionId: session._id };
  // Sign access token and refresh token
  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);
  const accessToken = signToken({ ...sessionInfo, userId: user._id }); // Defaults to AccessTokenSignOptions
  // return user and tokens
  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

export type LoginUserParams = {
  email: string;
  password: string;
  userAgent?: string;
};

/**
 * Logs in a user and returns the user and authentication tokens.
 * @param email - The email of the user
 * @param password - The password of the user
 * @returns The created user and the access and refresh tokens
 * @returns The created user and the access and refresh tokens
 */
export const loginUser = async ({ email, password, userAgent }: LoginUserParams) => {
  // Get user by email
  const user = await UserModel.findOne({ email });
  // Verify user exists
  appAssert(user, UNAUTHORIZED, 'No user found with that email/password');
  // Validate password
  const isValidPassword = await user.comparePassword(password);
  appAssert(isValidPassword, UNAUTHORIZED, 'Invalid password');
  // Create session (unit of time user is logged in for)
  const session = await SessionModel.create({
    userId: user._id,
    userAgent: userAgent,
  });
  const sessionInfo = { sessionId: session._id };
  // Sign access token and refresh token
  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);
  const accessToken = signToken({ ...sessionInfo, userId: user._id });
  // return user and access tokens
  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

/**
 * Logs out a user by deleting their session from the database.
 * @param accessToken - Access token for user to logout
 */
export const logoutUser = async (accessToken: string) => {
  const { payload } = verifyToken(accessToken);
  if (payload) await SessionModel.findByIdAndDelete(payload.sessionId);
};

/**
 * Refreshes the access token for a user by verifying the refresh token and creating a new access token.
 * @param refreshToken - Refresh token for user to refresh access token
 * @returns The new access token and refresh token (if applicable)
 */
export const refreshAccessToken = async (refreshToken: string) => {
  const { payload } = verifyToken<RefreshTokenPayload>(
    refreshToken,
    { secret: refreshTokenSignOptions.secret });
  appAssert(payload, UNAUTHORIZED, 'Invalid token'); // Token expired or invalid
  const session = await SessionModel.findById(payload.sessionId);
  appAssert(
    session && session.expiresAt.getTime() > Date.now(),
    UNAUTHORIZED,
    'Session Expired'); // Session expired or invalid
  // Refresh session if it expires in the next 24 hours (better user experience)
  const sessionNeedsRefresh = session.expiresAt.getTime() - Date.now() < ONE_DAY_MS;
  if (sessionNeedsRefresh) {
    session.expiresAt = thirtyDaysFromNow();
    await session.save();
  }
  const newRefreshToken = sessionNeedsRefresh ? signToken(
    { sessionId: session._id },
    refreshTokenSignOptions
  ) : undefined;
  // Sign new access token
  const accessToken = signToken({
    sessionId: session._id,
    userId: session.userId,
  });
  return { accessToken, newRefreshToken };
};

/**
 * Takes an email verification code ID; looks up the code in the database;
 * if a code is found, grabs the user ID from the code document;
 * then looks up the user in the database and marks them as verified;
 * finally, deletes the code from the database.
 * @param verificationCode - The verification code to verify
 */
export const verifyEmail = async (verificationCode: mongoId) => {
  const code = await VerificationCodeModel.findOne({
    _id: verificationCode,
    codeType: VerificationCodeType.EMAILVERIFICATION,
    expiresAt: { $gt: new Date() }, // Check if code is expired
  });
  appAssert(code, NOT_FOUND, 'Invalid or expired code'); // Code expired or invalid
  const user = await UserModel.findById(code.userId);
  appAssert(user, NOT_FOUND, 'User not found');
  user.verified = true;
  await user.save();
  await code.deleteOne(); // Delete code from database
  return { user: user.omitPassword() };
};

/**
 * Sends a password reset email to the user with a verification code.
 *  - Makes sure that they are not past the rate limit of 1 email every 5 minutes
 * @param email - The email of the user to send the password reset email to
 * @returns The verification code for the password reset
 */
export const forgotPassword = async (email: string) => {
  // Catch any errors and log them (but always return a success message)
  // Prevents data leaks
  try {
    const user = await UserModel.findOne({ email });
    appAssert(user, NOT_FOUND, 'Could not find user');
    //Check rate limit (so they can't spam email resets)
    const fiveMinutes = fiveMinutesAgo();
    const count = await VerificationCodeModel.countDocuments({
      userId: user._id,
      codeType: VerificationCodeType.PASSWORDRESET,
      createdAt: { $gt: fiveMinutes }, // created in the last 5 minutesq
    });
    appAssert(count <= 1, UNAUTHORIZED, 'Too many requests. Please try again later.');
    const expiresAt = oneHourFromNow();
    const verificationCode = await VerificationCodeModel.create({
      userId: user._id,
      codeType: VerificationCodeType.PASSWORDRESET,
      expiresAt,
    });
    // Send password reset email
    const verificationUrl = `${APP_ORIGIN}/password/reset/?code=${verificationCode._id}&exp=${expiresAt.getTime()}`;
    const { data, error } = await sendMail({
      to: user.email,
      ...getPasswordResetTemplate(verificationUrl),
    });
    // Check if email was sent successfully
    appAssert(
      data?.id,
      INTERNAL_SERVER_ERROR,
      `${error?.name} - ${error?.message}`);
    return {
      verificationUrl,
      emailId: data.id
    };
  } catch (error: any) {
    console.log("SendPasswordResetError:", error.message);
    return {};
  }
};

type ResetPasswordParams = {
  verificationCode: mongoId;
  password: string;
};

/**
 * Resets the user's password using the verification code and new password.
 * @param verificationCode - The verification code (must be within 1 hour of creation)
 * @param newPassword - The new password to set for the user
 */
export const resetPassword = async ({ verificationCode, password }: ResetPasswordParams) => {
  const code = await VerificationCodeModel.findOne({
    _id: verificationCode,
    codeType: VerificationCodeType.PASSWORDRESET,
    expiresAt: { $gt: new Date() }, // Check if code is expired
  });
  appAssert(code, NOT_FOUND, 'Invalid or expired code'); // Code expired or invalid
  const user = await UserModel.findById(code.userId);
  appAssert(user, NOT_FOUND, 'User not found');
  user.password = password;
  await user.save();
  await code.deleteOne(); // Delete verification code from DB
  await SessionModel.deleteMany({ userId: user._id }); // delete all sessions (user has login on password reset)
  return { user: user.omitPassword() };
};