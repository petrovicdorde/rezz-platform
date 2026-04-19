import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/pretraga')({
  validateSearch: (search: Record<string, unknown>) => ({
    tip: (search.tip as string) || undefined,
    grad: (search.grad as string) || undefined,
    datum: (search.datum as string) || undefined,
    vrijeme: (search.vrijeme as string) || undefined,
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: '/lokali',
      search: {
        tip: search.tip,
        grad: search.grad,
        datum: search.datum,
        vrijeme: search.vrijeme,
      },
    });
  },
  component: () => null,
});
