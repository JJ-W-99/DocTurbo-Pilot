import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>DocTurbo Pilot</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-bold">DocTurbo API is live!</h1>
        <Link
          href="/agreement/new"
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Start Rental Agreement
        </Link>
      </main>
    </>
  );
}
