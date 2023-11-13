export default async function handler(req, res) {
  const page = req.query.page

  if (!page) {
    res.status(500).send('Page query param not found')
  }

  try {
    await res.revalidate(req.query.page)
    return res.json({ revalidated: true })
  } catch (err) {
    console.log(err)
    return res.status(500).send('Error revalidating')
  }
}
