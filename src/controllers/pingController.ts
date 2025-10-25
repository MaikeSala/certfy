import { Request, Response } from 'express';


export const ping = (req: Request, res: Response): void => {

    res.json({
        message: "pong"
    });
};