import { readFile, writeFile } from 'node:fs/promises'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const HOTSPOTS_FILE = new URL('./src/data/hotspots.json', import.meta.url)

function hotspotEditor() {
  return {
    name: 'hotspot-editor',
    configureServer(server) {
      server.middlewares.use('/__hotspots', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end()
        }
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', async () => {
          try {
            const { paintingId, hotspots } = JSON.parse(body)
            const all = JSON.parse(await readFile(HOTSPOTS_FILE, 'utf8'))
            if (hotspots.length) all[paintingId] = hotspots
            else delete all[paintingId]
            await writeFile(HOTSPOTS_FILE, JSON.stringify(all, null, 2) + '\n')
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch (error) {
            res.statusCode = 500
            res.end(JSON.stringify({ ok: false, error: error.message }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), hotspotEditor()],
})
