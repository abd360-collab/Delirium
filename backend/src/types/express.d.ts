declare global {
    namespace Express {
        interface Request {
            requestId: string;
        }
    }
}

export {};


// to add filed requestId in the req object.