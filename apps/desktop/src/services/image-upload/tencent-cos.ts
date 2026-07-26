import { fetch } from '@tauri-apps/plugin-http'
import type { TencentCOSConfig, UploadResult } from './types'

function generateFileName(originalName: string, pathPrefix?: string): string {
  const ext = originalName.includes('.') ? originalName.slice(originalName.lastIndexOf('.')) : '.png'
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  const prefix = pathPrefix ? (pathPrefix.endsWith('/') ? pathPrefix : `${pathPrefix}/`) : ''
  return `${prefix}${timestamp}-${random}${ext}`
}

/**
 * HMAC-SHA256 signing helper using Web Crypto API
 */
async function hmacSha256(key: string | ArrayBuffer, message: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const keyData = typeof key === 'string' ? encoder.encode(key) : key

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message))
}

async function sha256Hex(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(message))
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Tencent Cloud COS uses a custom HMAC-SHA1 based signature.
 * For simplicity, we use the simplified token-based auth via SecretId/SecretKey
 * with the COS XML API PUT Object.
 */
export async function uploadToTencentCOS(
  fileBase64: string,
  fileName: string,
  config: TencentCOSConfig,
): Promise<UploadResult> {
  const objectKey = generateFileName(fileName, config.pathPrefix)
  const host = `${config.bucket}.cos.${config.region}.myqcloud.com`
  const url = `https://${host}/${objectKey}`

  // COS simplified signature (q-sign-algorithm=sha1 based)
  const now = Math.floor(Date.now() / 1000)
  const startTime = now - 60
  const endTime = now + 600
  const keyTime = `${startTime};${endTime}`

  const encoder = new TextEncoder()

  // SignKey = HMAC-SHA1(SecretKey, KeyTime)
  const signKeyBuffer = await hmacSha256(config.secretKey, keyTime)
  const signKey = bufferToHex(signKeyBuffer)

  // HttpString = "put\n/{objectKey}\n\n\n"
  const httpString = `put\n/${objectKey}\n\n\n`

  // StringToSign = "sha1\n{KeyTime}\n{SHA1(HttpString)}\n"
  const httpStringSha1 = await sha256Hex(httpString)
  const stringToSign = `sha1\n${keyTime}\n${httpStringSha1}\n`

  // Signature = HMAC-SHA1(SignKey, StringToSign)
  const signatureBuffer = await hmacSha256(signKey, stringToSign)
  const signature = bufferToHex(signatureBuffer)

  const authorization = [
    `q-sign-algorithm=sha1`,
    `q-ak=${config.secretId}`,
    `q-sign-time=${keyTime}`,
    `q-key-time=${keyTime}`,
    `q-header-list=`,
    `q-url-param-list=`,
    `q-signature=${signature}`,
  ].join('&')

  // Convert base64 to ArrayBuffer
  const binaryStr = atob(fileBase64)
  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i)
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': authorization,
      'Content-Type': 'application/octet-stream',
    },
    body: bytes.buffer,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Tencent COS upload failed (${response.status}): ${text}`)
  }

  const finalUrl = config.customDomain
    ? `${config.customDomain.replace(/\/$/, '')}/${objectKey}`
    : url

  return { url: finalUrl, fileName: objectKey }
}
