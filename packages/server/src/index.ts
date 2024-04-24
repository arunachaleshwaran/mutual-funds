import type { ErrorRequestHandler } from 'express';
import ExpressError from './express-error.js';
import HttpStatusCode from './HttpStatusCode.js';
import cors from 'cors';
import express from 'express';
import route from './helper/routes.js';
const PORT = 4000;
const app = express();
app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Locals {
      phoneNumber: string;
    }
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(route);
app.use((req, res, next) => {
  if (req.headers.authorization === void 0)
    throw new ExpressError(
      'Unauthorized',
      HttpStatusCode.Unauthorized
    );
  res.locals.phoneNumber = req.headers.authorization;
  next();
});

const errorHandler: ErrorRequestHandler = (err, _req, res, _) => {
  console.error(err);
  if (err instanceof ExpressError)
    res.status(err.status).send(err.message);
  else
    res
      .status(HttpStatusCode.InternalServerError)
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unsafe-member-access
      .send(err?.message || 'Something went wrong');
};
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
