import Head from 'next/head'

export default function Home({title}) {
  return (
    <div className="container">
      <Head>
        <title>{title} SSG</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Welcome to {title} SSG
        </h1>
      </main>
    </div>
  )
}

export async function getStaticProps(context) {
  let title = "DIARMUID"

  if (context.preview) {
    title = "DIARMUID (preview)"
  }

  return {
    props: {
      "title": title,
    },
  }
}
