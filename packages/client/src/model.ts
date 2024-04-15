import type { Strategy } from './strategies';

export type Payment = {
  id: string;
  accountNumber: string;
  ifscCode: string;
  amount: number;
  redirectUrl: string;
  status: 'Failed' | 'Success';
  createdAt: ReturnType<Date['toISOString']>;
  utr: string;
};
export type MarketValue = {
  name: Strategy['funds'][number]['name'];
  marketValue: number;
};

export type Order = {
  id: string;
  fund: Strategy['funds'][number]['name'];
  amount: number;
  units: number;
  pricePerUnit: number;
  status: 'Failed' | 'Submitted';
  paymentID: '3cd4267a-75f6-40f7-86dc-5ec4802e7ca9';
  submittedAt: ReturnType<Date['toISOString']>;
  succeededAt: ReturnType<Date['toISOString']>;
  failedAt: ReturnType<Date['toISOString']>;
};
