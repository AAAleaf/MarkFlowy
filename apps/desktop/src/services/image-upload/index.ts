import useAppSettingStore from '@/stores/useAppSettingStore'
import { uploadToAliyunOSS } from './aliyun-oss'
import { uploadToGitHub } from './github'
import { uploadToTencentCOS } from './tencent-cos'
import type { ImageHostingService, UploadResult } from './types'

export type { AliyunOSSConfig, GitHubConfig, ImageHostingService, TencentCOSConfig, UploadResult } from './types'

/**
 * Upload an image (as base64 without data-url prefix) to the configured remote image hosting service.
 * Reads configuration from the app settings store.
 */
export async function uploadToRemote(fileBase64: string, fileName: string): Promise<UploadResult> {
  const settingData = useAppSettingStore.getState().settingData
  const service = (settingData.upload_image_remote_service as ImageHostingService) || 'aliyun_oss'
  const pathPrefix = (settingData.upload_image_remote_path_prefix as string) || ''

  switch (service) {
    case 'aliyun_oss': {
      const result = await uploadToAliyunOSS(fileBase64, fileName, {
        accessKeyId: settingData.upload_image_aliyun_access_key_id as string,
        accessKeySecret: settingData.upload_image_aliyun_access_key_secret as string,
        bucket: settingData.upload_image_aliyun_bucket as string,
        region: settingData.upload_image_aliyun_region as string,
        customDomain: settingData.upload_image_aliyun_custom_domain as string | undefined,
        pathPrefix,
      })
      return result
    }

    case 'github': {
      const result = await uploadToGitHub(fileBase64, fileName, {
        token: settingData.upload_image_github_token as string,
        repo: settingData.upload_image_github_repo as string,
        branch: (settingData.upload_image_github_branch as string) || 'main',
        pathPrefix,
      })
      return result
    }

    case 'tencent_cos': {
      const result = await uploadToTencentCOS(fileBase64, fileName, {
        secretId: settingData.upload_image_cos_secret_id as string,
        secretKey: settingData.upload_image_cos_secret_key as string,
        bucket: settingData.upload_image_cos_bucket as string,
        region: settingData.upload_image_cos_region as string,
        customDomain: settingData.upload_image_cos_custom_domain as string | undefined,
        pathPrefix,
      })
      return result
    }

    default:
      throw new Error(`Unknown image hosting service: ${service}`)
  }
}

/**
 * Validate that the required configuration fields are present for the selected service.
 */
export function validateRemoteConfig(): { valid: boolean; message?: string } {
  const settingData = useAppSettingStore.getState().settingData
  const service = (settingData.upload_image_remote_service as ImageHostingService) || 'aliyun_oss'

  switch (service) {
    case 'aliyun_oss': {
      const { upload_image_aliyun_access_key_id, upload_image_aliyun_access_key_secret, upload_image_aliyun_bucket, upload_image_aliyun_region } = settingData
      if (!upload_image_aliyun_access_key_id || !upload_image_aliyun_access_key_secret || !upload_image_aliyun_bucket || !upload_image_aliyun_region) {
        return { valid: false, message: '请完善阿里云 OSS 配置（AccessKeyId、AccessKeySecret、Bucket、Region）' }
      }
      return { valid: true }
    }

    case 'github': {
      const { upload_image_github_token, upload_image_github_repo } = settingData
      if (!upload_image_github_token || !upload_image_github_repo) {
        return { valid: false, message: '请完善 GitHub 配置（Token、仓库地址）' }
      }
      return { valid: true }
    }

    case 'tencent_cos': {
      const { upload_image_cos_secret_id, upload_image_cos_secret_key, upload_image_cos_bucket, upload_image_cos_region } = settingData
      if (!upload_image_cos_secret_id || !upload_image_cos_secret_key || !upload_image_cos_bucket || !upload_image_cos_region) {
        return { valid: false, message: '请完善腾讯云 COS 配置（SecretId、SecretKey、Bucket、Region）' }
      }
      return { valid: true }
    }

    default:
      return { valid: false, message: `未知的图床服务: ${service}` }
  }
}
