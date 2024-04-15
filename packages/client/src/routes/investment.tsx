import type { Strategy } from '../strategies';
import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/investment')({
  component: Comp,
  validateSearch: (search: Record<string, unknown>) => {
    const { strategy, transactionID } = search;
    if (typeof strategy !== 'string')
      throw new Error('No strategy found');
    if (typeof transactionID !== 'string')
      throw new Error('No transactionID found');
    return {
      strategy: strategy as Strategy['name'],
      transactionID,
    };
  },
});
function Comp() {
  const { strategy, transactionID } = Route.useSearch();
  return (
    <div>
      <h1>
        Investment for {strategy} with {transactionID}
      </h1>
    </div>
  );
}
