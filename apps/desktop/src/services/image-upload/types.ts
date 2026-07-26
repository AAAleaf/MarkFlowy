export type ImageHostingService = 'aliyun_oss' | 'github' | 'tencent_cos'

export interface UploadResult {
  url: string
  fileName: string
}

export interface AliyunOSSConfig {
  accessKeyId: string
  accessKeySecret: string
  bucket: string
  region: string // e.g. "oss-cn-hangzhou"
  customDomain?: string
  pathPrefix?: string
}

export interface GitHubConfig {
  token: string
  repo: string // "owner/repo"
  branch?: string // default "main"
  pathPrefix?: string
}

export interface TencentCOSConfig {
  secretId: string
  secretKey: string
  bucket: string
  region: string // e.g. "ap-guangzhou"
  customDomain?: string
  pathPrefix?: string
}

export interface ImageUploadConfig {
  service: ImageHostingService
  aliyun?: AliyunOSSConfig
  github?: GitHubConfig
  tencent?: TencentCOSConfig
}
