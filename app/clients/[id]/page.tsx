import { ClientDetail } from './client-detail';

// Next 16: params is a Promise — await it in a server component, then hand the
// id to the client component that does the data fetching.
export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClientDetail id={id} />;
}
