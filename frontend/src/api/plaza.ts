/**
 * Public Model Plaza API (no auth)
 * 公开「模型广场」:展示所有 active 非专属分组下可路由的模型 + 平台 + 价格。
 */

import { apiClient } from './client'
import type { UserSupportedModelPricing } from './channels'

/** 公开模型广场中的单个模型条目(后端 /public/plaza 返回的扁平结构)。 */
export interface PlazaModel {
  name: string
  platform: string
  groups: string[]
  pricing: UserSupportedModelPricing | null
}

/** 拉取公开模型广场数据(无需登录)。 */
export async function getPlazaModels(options?: { signal?: AbortSignal }): Promise<PlazaModel[]> {
  const { data } = await apiClient.get<PlazaModel[]>('/public/plaza', {
    signal: options?.signal
  })
  return data
}

export const plazaAPI = { getPlazaModels }

export default plazaAPI
