import Head from 'next/head'

export default function Home({preview}) {
  return (
    <div className="container">
      <Head>
        <title>Server</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          λ (Server) server-side rendered page {preview}
        </h1>
      </main>
    </div>
  )
}

export async function getServerSideProps(context) {
  let preview = "(preview mode disabled)"

  if (context.preview) {
    preview = "(preview mode enabled)"
  }

  return {
    props: {
      "preview": preview,
    },
  }
}
