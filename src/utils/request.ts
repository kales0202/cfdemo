import axios from 'axios'
import type { AxiosResponse } from 'axios'

interface BaseResponse<T = never> {
  code: number
  data: T
  msg: string
}

const request = axios.create({
  baseURL: '/api',
  timeout: 5000,
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 这里可以添加token等通用header
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
request.interceptors.response.use(
  <T>(response: AxiosResponse<BaseResponse<T>>) => {
    const res = response.data
    if (res.code !== 0) {
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    return res.data as T
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default request
