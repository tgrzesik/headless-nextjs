import { useRouter } from 'next/router'
import Head from 'next/head'
import React from 'react'

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking', // can also be true or 'blocking'
  }
}

// `getStaticPaths` requires using `getStaticProps`
export async function getStaticProps(context) {
  let time = new Date();
  const generated = time.toTimeString()

  return {
    // Passed to the page component as props
    props: {
      generated,
    },
    revalidate: 29,
  }
}

export default function PostPage({generated}) {
  const router = useRouter()
  const id = router.query.id as string

  return (
    <div className="container">
    <Head>
      <title>ISR {id}</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main>
      <h1 className="title">
          (ISR) Server Side Generated page (dynamic ID: {id})
      </h1>
      <p>Revalidated every 29 seconds, last revalidate: {generated}</p>
    </main>
  </div>
  )
}
