import { notFound } from 'next/navigation';

type Props = {
  params: {
    id: string;
  };
};

export default async function TestPage({ params }: Props) {
  const { id } = await params;
  return (
    <div>
      <h1>Test Page</h1>
      <p>ID: {id}</p>
    </div>
  );
}
