export default async function handler(req, res) {
  try {
    console.log('[Next.js] Revalidating /odisr')
    await res.revalidate('/odisr')

    console.log('[Next.js] Revalidating /isr')
    await res.revalidate('/isr')

    return res.json({ revalidated_paths: ["/isr", "/odisr"] })
  } catch (err) {
    console.log(err)
    return res.status(500).send('Error revalidating')
  }
}
