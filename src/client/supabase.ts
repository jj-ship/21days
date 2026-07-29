import { createClient } from '@supabase/supabase-js'
import Taro from '@tarojs/taro'

const supabaseUrl = process.env.TARO_APP_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.TARO_APP_SUPABASE_ANON_KEY ?? ''

// 小程序兼容的 fetch 实现，使用 Taro.request
const customFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input.toString()
  const method = init?.method?.toUpperCase() || 'POST'
  const headers = (init?.headers as Record<string, string>) || {}
  let body = init?.body

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      // 保持原样
    }
  }

  return new Promise((resolve, reject) => {
    Taro.request({
      url,
      method: method as any,
      data: body,
      header: headers,
      dataType: '其他',
      responseType: 'text',
      success: (res) => {
        const response = new Response(JSON.stringify(res.data), {
          status: res.statusCode,
          statusText: res.errMsg || '',
          headers: new Headers(res.header as Record<string, string>),
        })
        resolve(response)
      },
      fail: (err) => {
        reject(new Error(err.errMsg || 'request failed'))
      },
    })
  })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: { fetch: customFetch },
})