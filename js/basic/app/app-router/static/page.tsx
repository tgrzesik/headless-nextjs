import Image from 'next/image'
import styles from '../page.module.css'
import Link from 'next/link'

async function getData() {
  const res = await fetch('https://api.openbrewerydb.org/v1/breweries/random?size=1', { next: { revalidate: 15, tags: ["brew"] } })

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }

  return res.json()
}

export default async function Home() {
  const data = await getData()

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <div>
          <Link href="/app-router/dynamic">
            Dynamic
          </Link>
        </div>
      </div>

      <div className={styles.center}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div className={styles.grid}>
        <Link href="/app-router/dynamic" className={styles.card}>
          <h2>
          Dynamic<span>-&gt;</span>
          </h2>
        </Link>
      </div>
    </main>
  )
}
