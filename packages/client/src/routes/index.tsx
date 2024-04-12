import { createFileRoute } from '@tanstack/react-router';

function Index() {
  // Show all the form
  return <>Hello World</>;
}

export const Route = createFileRoute('/')({
  component: Index,
});
