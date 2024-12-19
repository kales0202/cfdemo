interface ApiResponse<T = never> {
  code: number
  data: T | null
  msg: string
}

export function createResponse<T>(data: T | null = null, msg = '', code = 0): Response {
  const json: ApiResponse<T> = { code, data, msg }
  return new Response(JSON.stringify(json))
}

export function createErrorResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  msg: string = '',
  code = 500,
  status = 500,
): Response {
  msg = msg || (error && error.message) || 'function execute error'
  console.error('request error: ' + msg, error)
  const json: ApiResponse = {
    code,
    data: null,
    msg,
  }
  return new Response(JSON.stringify(json), { status })
}
