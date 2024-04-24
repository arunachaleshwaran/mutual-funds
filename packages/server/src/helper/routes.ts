import type {
  MarketValue,
  Order,
  Payment,
  SuccessResponse,
} from '@mutual-fund/shared';
import { collection, connect } from './mongo.js';
import ExpressError from '../express-error.js';
import HttpStatusCode from '../HttpStatusCode.js';
import { QueriesObserver } from '@tanstack/query-core';
import { Router } from 'express';
import type { Schema } from '@mutual-fund/shared';
import type { Strategy } from '@mutual-fund/shared/strategies';
import queryClient from './tanstack-query.js';
import strategies from '@mutual-fund/shared/strategies';
// eslint-disable-next-line new-cap
const route = Router();
type OrderResponse = Omit<
  Schema['order'],
  'paymentId' | 'phoneNumber'
> &
  Partial<Pick<Order, 'fund'>>;
route.get<
  '/order',
  Record<string, never>,
  Array<Required<OrderResponse>>,
  never,
  Record<string, never>
>('/order', async (_, res, next) => {
  try {
    const { phoneNumber } = res.locals;
    const client = await connect();
    const orderColl = collection(client, 'order');
    const orders: Array<OrderResponse> = await orderColl
      .find(
        { phoneNumber },
        { projection: { _id: 0, phoneNumber: 0, paymentId: 0 } }
      )
      .toArray();
    const orderResponse = await Promise.all(
      orders.map(async order => {
        return queryClient.ensureQueryData({
          queryKey: ['order', order.orderId],
          queryFn: async () => {
            const response = await fetch(
              `http://localhost:8081/order/${order.orderId}`
            );
            return response.json() as Promise<Order>;
          },
        });
      })
    );
    orderResponse.forEach((order, index) => {
      orders[index].fund = order.fund;
    });
    res.json(orders as Array<Required<OrderResponse>>);
    await client.close();
  } catch (error) {
    next(error);
  }
});
/**
 * After payment processed the order is placed.
 */
route.post<
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
            strategy: req.query.strategy,
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
export default route;
