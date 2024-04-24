import type { Strategy } from '@mutual-fund/shared/strategies';

export type Schema = {
  order: {
    phoneNumber: string;
    strategy: Strategy['name'];
    orderId: string;
    paymentId: string;
  };
};
