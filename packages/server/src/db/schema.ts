import type { Strategy } from '@mutual-fund/shared/strategies';

export type Schema = {
  order: {
    phoneNumber: string;
    fund: Strategy['funds'][number]['name'];
    orderId: string;
    paymentId: string;
  };
};
