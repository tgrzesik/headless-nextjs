import Image from 'next/image'
import styles from './page.module.css'
import Link from 'next/link'

export default async function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          Get started by editing&nbsp;
          <code className={styles.code}>app/page.tsx</code>
        </p>
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
            Dynamic <span>-&gt;</span>
          </h2>
        </Link>

        <Link href="/app-router/dynamic" className={styles.card}>
          <h2>
            Static <span>-&gt;</span>
          </h2>
        </Link>
      </div>
    </main>
  )
}
