export default function handler(req, res) {
  res.setDraftMode({ enable: true })
  res.end('Draft mode enabled. "/api/clear-draftmode" to disable')
}
