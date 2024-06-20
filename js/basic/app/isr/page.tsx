import { ExternalLink } from '../../ui/external-link';

export default function Page() {
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <h1 className="text-xl font-bold">Incremental Static Regeneration</h1>

      <ul>
        <li>In this example, three posts fetch data using granular ISR.</li>
        <li>Caches responses are fresh for 10 seconds.</li>
        <li>
          Try navigating to each post and noting the timestamp of when the page
          was rendered. Refresh the page after 10 seconds to trigger a
          revalidation for the next request. Refresh again to see the
          revalidated page.
        </li>
        <li>Note that the fetch cache can be persisted across builds.</li>
        <li>For on demand regenerating the pages run the following:</li>
        <li>all pages: $ curl -gIL 'http://localhost:8080/api/revalidate-app?path=/isr/[id]'</li>
        <li>specific page: $ curl -gIL 'http://localhost:8080/api/revalidate-app?path=/isr/3'</li>
        <li>by tag: $ curl -IL http://localhost:8080/api/revalidate-app\?collection\=collection</li>
      </ul>

      <div className="flex gap-2">
        <ExternalLink href="https://nextjs.org/docs/app/building-your-application/data-fetching/fetching#revalidating-data">
          Docs
        </ExternalLink>
        <ExternalLink href="https://github.com/vercel/app-playground/tree/main/app/isr">
          Code
        </ExternalLink>
      </div>
    </div>
  );
}
