import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Atlas Next.js Site</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Atlas Platform Edge
        </h1>

        <p className="description">
          Next.js features demo (<a href="https://github.com/diarmuidie/headless-nextjs">source</a>)
        </p>

        <div className="grid">
          <Link href="/sample-isr/sample-static" className="card">
            <h3>ISR &rarr;</h3>
            <p>Static Incremental static regeneration page.</p>
          </Link>

          <Link href="/sample-isr/sample-dynamic" className="card">
            <h3>ISR &rarr;</h3>
            <p>Dynamic Incremental static regeneration page.</p>
          </Link>

          <Link href="/sample-server" className="card">
            <h3>SSG &rarr;</h3>
            <p>Server side generated page.</p>
          </Link>

          <Link
            href="/sample-static"
            className="card"
          >
            <h3>Static &rarr;</h3>
            <p>Static page.</p>
          </Link>

          <Link
            href="/sample-server"
            className="card"
          >
            <h3>Server &rarr;</h3>
            <p>Server side rendered page.</p>
          </Link>

          <Link
            href="/sample-odisr"
            className="card"
          >
            <h3>OD-ISR &rarr;</h3>
            <p>
              On-demand incremental static regeneration page.
            </p>
          </Link>

          <div className="card">
            <h3>Image Component &rarr;</h3>
            <a href="/bridge.png">
              <Image
                src="/bridge.png"
                width={220}
                height={220}
              />
            </a>
          </div>

        </div>
      </main>

      <footer>
        <a
          href="https://wpengine.com/headless-wordpress/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/wpe.svg" alt="WP Engine Logo" className="logo" />
        </a>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        .description a {
          text-decoration: underline;
        }

        .description a:hover {
          color: #0070f3
        }


        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .logo {
          height: 1em;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
