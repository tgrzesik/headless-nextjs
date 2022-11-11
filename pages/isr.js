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
          ● (ISR) Server Side Generated page {generated}
        </h1>
      </main>
    </div>
  )
}

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
