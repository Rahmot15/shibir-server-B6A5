import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import { AuthService } from "./authentication.service.js";
import { sendResponse } from "../../shared/sendResponse.js";

const registerSupporter = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;

        console.log(payload);

        const result = await AuthService.RegisterSupporter(payload);

        sendResponse(res, {
            httpStatusCode: 201,
            success: true,
            message: "Supporter registered successfully",
            data: result,
        })
    }
)

const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await AuthService.loginUser(payload);
        sendResponse(res, {
            httpStatusCode: 200,
            success: true,
            message: "User logged in successfully",
            data: result,
        })
    }
)

export const AuthController = {
    registerSupporter,
    loginUser,
};
