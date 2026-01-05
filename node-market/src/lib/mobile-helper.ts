import express from 'express';

export const isMobileRequest = (req: express.Request) => {
    return !req.headers.origin;
};