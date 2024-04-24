import type {
  MarketValue,
  Order,
  Payment,
  SuccessResponse,
} from '@mutual-fund/shared';
import { QueriesObserver, QueryClient } from '@tanstack/query-core';
import { collection, connect } from './db/mongo.js';
import type { ErrorRequestHandler } from 'express';
import ExpressError from './express-error.js';
import HttpStatusCode from './HttpStatusCode.js';
import type { Schema } from './db/schema.js';
import type { Strategy } from '@mutual-fund/shared/strategies';
import cors from 'cors';
import express from 'express';
import strategies from '@mutual-fund/shared/strategies';
const queryClient = new QueryClient();
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
app.use((req, res, next) => {
  if (req.headers.authorization === void 0)
    throw new ExpressError(
      'Unauthorized',
      HttpStatusCode.Unauthorized
    );
  res.locals.phoneNumber = req.headers.authorization;
  next();
});

/**
 * After payment processed the order is placed.
 */
app.post<
  '/transact/:id',
  { id: Schema['order']['paymentId'] },
  string,
  Record<string, never>,
  { strategy: Strategy['name'] },
  Record<string, never>
>('/transact/:id', async (req, res, next) => {
  try {
    const { id: transactionID } = req.params,
      currentStrategy = strategies.find(
        i => i.name === req.query.strategy
      ),
      payment = await queryClient.ensureQueryData({
        queryKey: ['payment', transactionID],
        queryFn: async () => {
          const response = await fetch(
            `http://localhost:8080/payment/${transactionID}`
          );
          return response.json() as Promise<Payment>;
        },
      });
    if (!currentStrategy)
      throw new ExpressError(
        'No strategy found',
        HttpStatusCode.BadRequest
      );
    const client = await connect();
    const orderColl = collection(client, 'order');
    const dbResult = await orderColl.countDocuments(
      { paymentId: transactionID },
      { limit: 1 }
    );
    /** Check if already processed */
    if (dbResult !== 0)
      throw new ExpressError(
        'Already Processed',
        HttpStatusCode.AlreadyReported
      );
    /** Check Market value and place order */
    const observe = new QueriesObserver<Array<Order>>(
      queryClient,
      currentStrategy.funds.map(fund => ({
        queryKey: ['order', fund.name, transactionID] as const,
        queryFn: async () => {
          let response = await fetch(
            `http://localhost:8081/market-value/${fund.name}`
          );
          const marketValue = (await response.json()) as MarketValue;
          const PERCENTAGE = 100;
          const amount =
            (payment.amount * fund.percentage) / PERCENTAGE;
          response = await fetch('http://localhost:8081/order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fund: fund.name,
              amount,
              units: amount / marketValue.marketValue,
              pricePerUnit: marketValue.marketValue,
              paymentID: transactionID,
            }),
          });
          const data =
            (await response.json()) as SuccessResponse<Order>;
          const order = data.data;
          await orderColl.insertOne({
            fund: order.fund,
            orderId: order.id,
            paymentId: order.paymentID,
            phoneNumber: res.locals.phoneNumber,
          });
          return order;
        },
      }))
    );
    /** Sends chunk of data for every process complete */
    observe.subscribe(result => {
      res.write(
        `\n${JSON.stringify(
          result.map(({ data, status, error }) => ({
            data,
            status,
            error,
          }))
        )}`
      );
      if (result.every(i => i.fetchStatus === 'idle')) {
        observe.destroy();
        res.end();
        void client.close();
      }
    });
  } catch (error) {
    next(error);
  }
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
