import { Request, Response } from "express";
import { getErrorMessage } from "../utils/errorUtil";
import userService from "../services/userService";

export const signup = async (req: Request, res: Response) => {
    try {
        const result = await userService.signupUser(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(getErrorMessage(error));        
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const result = await userService.loginUser(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(getErrorMessage(error));        
    }
}