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
import { QueryClient } from '@tanstack/query-core';
import { Router } from 'express';
import type { Schema } from '@mutual-fund/shared';
import type { Strategy } from '@mutual-fund/shared/strategies';
import strategies from '@mutual-fund/shared/strategies';

const queryClient = new QueryClient();
// eslint-disable-next-line new-cap
const route = Router();
type OrderResponse = Omit<
  Schema['order'],
  'paymentId' | 'phoneNumber'
> &
  Partial<Pick<Order, 'fund'>>;
/**
 * Fetch order id from mongodb and fetch its details from RTA server.
 * and cache the value for future use.
 */
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
          staleTime: Infinity,
          gcTime: Infinity,
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
 * Fetch order id from mongodb and fetch its details from RTA server.
 * and cache the value for future use.
 */
route.get<
  '/market-value',
  Record<string, never>,
  { invest: number; market: number },
  never,
  { orderIds: Array<Schema['order']['orderId']> }
>('/market-value', async (req, res, next) => {
  try {
    const { orderIds } = req.query;
    const ordersCache = orderIds.map(id =>
      queryClient
        .getQueryCache()
        .find<Order>({ queryKey: ['order', id] })
    );
    const orders = ordersCache
      .filter(cache => cache?.state.status === 'success')
      .map(cache => cache!.state.data) as Array<Order>;
    const marketRes = await Promise.all(
      orders.map(async order =>
        queryClient.ensureQueryData<MarketValue>({
          queryKey: ['market-value', order.fund],
          gcTime: 40000,
          staleTime: 30000,
          queryFn: async () => {
            const response = await fetch(
              `http://localhost:8081/market-value/${order.fund}`
            );
            return response.json() as Promise<MarketValue>;
          },
        })
      )
    );
    const invest = Math.round(
      orders.reduce((acc, order) => acc + order.amount, 0)
    );
    const market = Math.round(
      marketRes.reduce(
        (acc, { marketValue }, index) =>
          acc + marketValue * orders[index].units,
        0
      )
    );
    res.json({ invest, market });
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
      /** Check for payment process if not processed it will throw error */
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
            // Mininum data required to process and others will get from service on demand
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
