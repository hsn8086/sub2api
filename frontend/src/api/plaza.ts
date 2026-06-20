/**
 * Public Model Plaza API (no auth)
 * 公开「模型广场」:展示所有 active 非专属分组下可路由的模型 + 平台 + 价格。
 */

import { apiClient } from './client'
import type { UserSupportedModelPricing } from './channels'

/** 模型所属分组(含默认倍率与订阅类型)。 */
export interface PlazaGroup {
  name: string
  rate_multiplier: number
  subscription_type: string
}

/** 公开模型广场中的单个模型条目(后端 /public/plaza 返回的扁平结构)。一个模型可属于多个分组。 */
export interface PlazaModel {
  name: string
  platform: string
  groups: PlazaGroup[]
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
