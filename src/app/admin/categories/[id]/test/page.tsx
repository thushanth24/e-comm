import { notFound } from 'next/navigation';

type Props = {
  params: {
    id: string;
  };
};

export default async function TestPage({ params }: Props) {
  return (
    <div>
      <h1>Test Page</h1>
      <p>ID: {params.id}</p>
    </div>
  );
}
