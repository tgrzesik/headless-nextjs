import Head from 'next/head'

export default function Home() {
  let time = new Date();
  const generated = time.toTimeString()

  return (
    <div className="container">
      <Head>
        <title>Static</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          ○ (Static) static page (no preview mode for static pages), page built: {generated}
        </h1>
      </main>
    </div>
  )
}
