/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'

// 与后端约定的请求成功码
const SUCCESS_CODE = 0

// 定义一个常见后端请求返回
type BaseApiResponse<T> = {
  code: number
  msg: string
  data: T
}

// 拓展 axios 请求配置，加入我们自己的配置
interface RequestOptions {
  // 是否全局展示请求错误信息
  logError?: boolean
  // 是否跳过响应转换
  skipResponseTransform?: boolean
}

// 拓展自定义请求配置
interface ExpandAxiosRequestConfig<D = any> extends AxiosRequestConfig<D> {
  interceptorHooks?: InterceptorHooks
  added?: RequestOptions
}

// 拓展 axios 请求配置
interface ExpandInternalAxiosRequestConfig<D = any> extends InternalAxiosRequestConfig<D> {
  interceptorHooks?: InterceptorHooks
  added?: RequestOptions
}

// 拓展 axios 返回配置
interface ExpandAxiosResponse<T = any, D = any> extends AxiosResponse<T, D> {
  config: ExpandInternalAxiosRequestConfig<D>
}

export interface InterceptorHooks {
  requestInterceptor?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig
  requestInterceptorCatch?: (error: any) => any
  responseInterceptor?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>
  responseInterceptorCatch?: (error: any) => any
}

// 请求拦截器
const transform: InterceptorHooks = {
  requestInterceptor(config) {
    // 请求头部处理，如添加 token
    return config
  },
  requestInterceptorCatch(err) {
    // 请求错误，这里可以用全局提示框进行提示
    return Promise.reject(err)
  },
  responseInterceptor(response: ExpandAxiosResponse) {
    // 如果跳过响应转换，则直接返回响应
    if (response.config.added?.skipResponseTransform) {
      return response.data
    }
    const result = response.data as BaseApiResponse<any>
    // 因为 axios 返回不支持扩展自定义配置，需要自己断言一下
    if (response.status !== 200) return Promise.reject(response)
    if (result.code !== SUCCESS_CODE) {
      // 这里全局提示错误
      if (response.config.added?.logError) {
        console.error(result.msg)
      }
      return Promise.reject(result)
    }
    // 请求返回值，建议将 返回值 进行解构
    return result.data
  },
  responseInterceptorCatch(err) {
    // 这里用来处理 http 常见错误，进行全局提示
    const mapErrorStatus = new Map([
      [400, '请求方式错误'],
      [401, '请重新登录'],
      [403, '拒绝访问'],
      [404, '请求地址有误'],
      [500, '服务器出错'],
      [502, '服务器出错'],
      [503, '服务不可用'],
      [504, '请求超时'],
    ])
    const message = mapErrorStatus.get(err.response.status) || '请求出错，请稍后再试'
    // 此处全局报错
    console.error(message)
    return Promise.reject(err.response)
  },
}

// 导出Request类，可以用来自定义传递配置来创建实例
class Request {
  // axios 实例
  private _instance: AxiosInstance
  // 默认配置
  private _defaultConfig: ExpandAxiosRequestConfig = {
    baseURL: '/api',
    timeout: 5000,
    added: {
      logError: true,
      skipResponseTransform: false,
    },
  }
  private _interceptorHooks?: InterceptorHooks

  constructor(config: ExpandAxiosRequestConfig) {
    // 使用axios.create创建axios实例
    this._instance = axios.create(Object.assign(this._defaultConfig, config))
    this._interceptorHooks = config.interceptorHooks
    this.setupInterceptors()
  }

  // 通用拦截，在初始化时就进行注册和运行，对基础属性进行处理
  private setupInterceptors() {
    this._instance.interceptors.request.use(
      this._interceptorHooks?.requestInterceptor,
      this._interceptorHooks?.requestInterceptorCatch,
    )
    this._instance.interceptors.response.use(
      this._interceptorHooks?.responseInterceptor,
      this._interceptorHooks?.responseInterceptorCatch,
    )
  }

  // 定义核心请求
  public request(config: ExpandAxiosRequestConfig): Promise<AxiosResponse> {
    // ！！！⚠️ 注意：axios 已经将请求使用 promise 封装过了
    // 这里直接返回，不需要我们再使用 promise 封装一层
    return this._instance.request(config)
  }

  public get<T = any>(url: string, config?: ExpandAxiosRequestConfig): Promise<T> {
    return this._instance.get(url, config)
  }

  public post<T = any>(url: string, data?: any, config?: ExpandAxiosRequestConfig): Promise<T> {
    return this._instance.post(url, data, config)
  }

  public put<T = any>(url: string, data?: any, config?: ExpandAxiosRequestConfig): Promise<T> {
    return this._instance.put(url, data, config)
  }

  public delete<T = any>(url: string, config?: ExpandAxiosRequestConfig): Promise<T> {
    return this._instance.delete(url, config)
  }

  public getFile<T = any>(url: string, config?: ExpandAxiosRequestConfig): Promise<T> {
    config!.added!.skipResponseTransform = true
    return this._instance.get(url, config)
  }
}

// 具体使用时先实例一个请求对象
export const request = new Request({
  baseURL: '/api',
  timeout: 5000,
  interceptorHooks: transform,
})
