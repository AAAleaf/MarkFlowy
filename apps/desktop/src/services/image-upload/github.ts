import { fetch } from '@tauri-apps/plugin-http'
import type { GitHubConfig, UploadResult } from './types'

function generateFileName(originalName: string, pathPrefix?: string): string {
  const ext = originalName.includes('.') ? originalName.slice(originalName.lastIndexOf('.')) : '.png'
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  const prefix = pathPrefix ? (pathPrefix.endsWith('/') ? pathPrefix : `${pathPrefix}/`) : 'images/'
  return `${prefix}${timestamp}-${random}${ext}`
}

export async function uploadToGitHub(
  fileBase64: string,
  fileName: string,
  config: GitHubConfig,
): Promise<UploadResult> {
  const objectPath = generateFileName(fileName, config.pathPrefix)
  const branch = config.branch || 'main'
  const url = `https://api.github.com/repos/${config.repo}/contents/${objectPath}`

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${config.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Upload image: ${fileName}`,
      content: fileBase64,
      branch,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`GitHub upload failed (${response.status}): ${text}`)
  }

  const data = await response.json() as { content?: { download_url?: string } }
  const downloadUrl = data.content?.download_url

  if (!downloadUrl) {
    throw new Error('GitHub upload succeeded but no download URL returned')
  }

  // Convert github.com blob URL to raw URL for direct image access
  const rawUrl = downloadUrl
    .replace('https://github.com/', 'https://raw.githubusercontent.com/')
    .replace('/blob/', '/')

  return { url: rawUrl, fileName: objectPath }
}
