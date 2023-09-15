import Link from 'next/link'
import React from 'react'

export async function getStaticProps() {
  return {
    props: {
      name: 'Benny Hill',
    },
  }
}

export default function IndexPage({
  name,
}) {
  return (
    <>
      <p>Found name: {name} ⭐️</p>
      <Link href="/">Home?</Link>
    </>
  )
}
