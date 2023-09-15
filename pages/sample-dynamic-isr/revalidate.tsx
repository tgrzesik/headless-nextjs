import Link from 'next/link'
import type { InferGetStaticPropsType } from 'next'
import React from 'react'

export async function getStaticProps() {
  return {
    props: {
      name: 'Walter P. Engine',
    },
    revalidate: 90,
  }
}

export default function IndexPage({
  name,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <p>Found name: {name} ⭐️</p>
      <Link href="/">Home?</Link>
    </>
  )
}
