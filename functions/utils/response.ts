interface ApiResponse<T = never> {
  code: number
  data: T | null
  msg: string
}

export function createResponse<T>(data: T | null = null, msg = 'success', code = 0): Response {
  const json: ApiResponse<T> = {
    code,
    data,
    msg,
  }
  return new Response(JSON.stringify(json))
}

export function createErrorResponse(msg: string, code = 500, status = 500): Response {
  const json: ApiResponse = {
    code,
    data: null,
    msg,
  }
  return new Response(JSON.stringify(json), { status })
}
