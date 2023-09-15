import Head from 'next/head'

export default function Home({generated}) {
  return (
    <div className="container">
      <Head>
        <title>ISR</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
            (ISR) Server Side Generated page
        </h1>
        <p>Revalidated every 10 seoncds, last revalidate: {generated}</p>
      </main>
    </div>
  )
}

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export async function getStaticProps() {
  let time = new Date();
  const generated = time.toTimeString()

  return {
    props: {
      generated,
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 10 seconds
    revalidate: 10, // In seconds
  }
}
