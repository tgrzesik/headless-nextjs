import Head from 'next/head'

export default function Home() {
  let date = new Date();
  const generated = date.toString()

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
