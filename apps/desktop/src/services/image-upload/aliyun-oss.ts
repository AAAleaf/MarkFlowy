import { fetch } from '@tauri-apps/plugin-http'
import type { AliyunOSSConfig, UploadResult } from './types'

/**
 * Generate a unique file name for upload
 */
function generateFileName(originalName: string, pathPrefix?: string): string {
  const ext = originalName.includes('.') ? originalName.slice(originalName.lastIndexOf('.')) : '.png'
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  const prefix = pathPrefix ? (pathPrefix.endsWith('/') ? pathPrefix : `${pathPrefix}/`) : ''
  return `${prefix}${timestamp}-${random}${ext}`
}

/**
 * Create HMAC-SHA1 signature for Alibaba Cloud OSS (V1 signature)
 * Uses Web Crypto API available in WebView
 */
async function signRequest(
  method: string,
  contentMd5: string,
  contentType: string,
  date: string,
  resource: string,
  accessKeySecret: string,
): Promise<string> {
  const stringToSign = `${method}\n${contentMd5}\n${contentType}\n${date}\n${resource}`

  const encoder = new TextEncoder()
  const keyData = encoder.encode(accessKeySecret)
  const msgData = encoder.encode(stringToSign)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData)
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
}

export async function uploadToAliyunOSS(
  fileBase64: string,
  fileName: string,
  config: AliyunOSSConfig,
): Promise<UploadResult> {
  const objectKey = generateFileName(fileName, config.pathPrefix)
  const date = new Date().toUTCString()
  const contentType = 'application/octet-stream'
  const resource = `/${config.bucket}/${objectKey}`

  const signature = await signRequest(
    'PUT',
    '',
    contentType,
    date,
    resource,
    config.accessKeySecret,
  )

  const endpoint = `https://${config.bucket}.${config.region}.aliyuncs.com`
  const url = `${endpoint}/${objectKey}`

  // Convert base64 to ArrayBuffer
  const binaryStr = atob(fileBase64)
  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i)
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      'Date': date,
      'Authorization': `OSS ${config.accessKeyId}:${signature}`,
    },
    body: bytes.buffer,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Aliyun OSS upload failed (${response.status}): ${text}`)
  }

  const finalUrl = config.customDomain
    ? `${config.customDomain.replace(/\/$/, '')}/${objectKey}`
    : url

  return { url: finalUrl, fileName: objectKey }
}
