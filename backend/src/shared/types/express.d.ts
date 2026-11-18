declare global {
    namespace Express {
        interface Request {
            requestId: string;

            user?: {
                id: string;
                role: "CUSTOMER" | "ADMIN";
            };
        }
    }
}

export {};

// to add filed requestId in the req object.