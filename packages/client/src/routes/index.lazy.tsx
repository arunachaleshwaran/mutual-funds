import { createLazyFileRoute } from '@tanstack/react-router';

function Index() {
  // Show all the form
  return <>Hello World</>;
}

export const Route = createLazyFileRoute('/')({
  component: Index,
});
