import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import { AuthService } from "./authentication.service.js";

const registerSupporter = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;

        console.log(payload);

        const result = await AuthService.RegisterSupporter(payload);

        res.status(201).json({
            httpStatusCode: 201,
            success: true,
            message: "Supporter registered successfully",
            data: result,
        })
    }
)

export const AuthController = {
    registerSupporter,
};
