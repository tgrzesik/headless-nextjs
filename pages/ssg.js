import Head from 'next/head'

export default function Home({preview}) {
  return (
    <div className="container">
      <Head>
        <title>SSG</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          ● (SSG) Server Side Generated page {preview}
        </h1>
      </main>
    </div>
  )
}

export async function getStaticProps(context) {
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
