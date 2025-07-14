import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>DocTurbo Pilot</title>
      </Head>
      <main className="flex min-h-screen items-center justify-center">
        <h1 className="text-3xl font-bold">DocTurbo API is live!</h1>
      </main>
    </>
  );
}
