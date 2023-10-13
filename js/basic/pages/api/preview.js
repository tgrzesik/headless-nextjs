export default function handler(req, res) {
  res.setPreviewData({})
  res.end('Preview mode enabled. "/api/clear-preview" to disable')
}
