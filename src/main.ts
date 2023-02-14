import dotenv from 'dotenv';
import Application from './class/Application.class';
dotenv.config();

Application.getInstance().start();


declare global {
    namespace Express {
        export interface Request {
            requestedReward?: any;
        }
    }
}
