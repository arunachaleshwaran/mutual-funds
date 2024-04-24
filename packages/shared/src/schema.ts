import type { Strategy } from './strategies.js';

export type Schema = {
  order: {
    phoneNumber: string;
    strategy: Strategy['name'];
    orderId: string;
    paymentId: string;
  };
};
