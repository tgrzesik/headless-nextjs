const { createServer } = require('http')
const launcher = require("./___next_launcher.cjs");

const hostname = 'localhost'
const port = 3000

createServer(async (req, res) => {
  await launcher(req, res)
})
.once('error', (err) => {
  console.error(err)
  process.exit(1)
})
.listen(port, () => {
  console.log(`> Ready on http://${hostname}:${port}`)
})
