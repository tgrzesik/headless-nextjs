import { useRouter } from 'next/router'
import Head from 'next/head'
import React from 'react'

export async function getStaticPaths() {
  return {
    paths: [
      {
        params: {
          id: ['12'],
        },
      },
    ],
    fallback: 'blocking', // can also be true or 'blocking'
  }
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

// `getStaticPaths` requires using `getStaticProps`
export async function getStaticProps(context) {
  console.log("pausing...")
  await delay(5000);
  console.log("continuing...")

  let date = new Date();
  const generated = date.toString()

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
          (ISR) Server Side Generated page (dynamic ID: {id}) with a 5 second render duration (to simulate waiting on a slow API call)
      </h1>
      <p>Revalidated every 29 seconds, last revalidate: {generated}</p>
    </main>
  </div>
  )
}
