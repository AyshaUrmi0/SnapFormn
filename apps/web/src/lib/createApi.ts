import { api } from './api-client';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export const methodsEnums = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

interface RequestConfig {
  url: string;
  method?: HttpMethod;
  data?: unknown;
  params?: Record<string, string | number | undefined>;
}

interface CreateApiOptions<TVariables, TResponse> {
  request: (variables: TVariables) => RequestConfig;
  transformResponse?: (
    result: unknown,
    variables: TVariables,
  ) => TResponse | Promise<TResponse>;
}

export function createApi<TVariables, TResponse>({
  request,
  transformResponse,
}: CreateApiOptions<TVariables, TResponse>) {
  return async (variables: TVariables): Promise<TResponse> => {
    const { url, method = 'GET', data, params } = request(variables);

    let result: unknown;

    switch (method) {
      case 'GET':
        result = await api.get(url, { params });
        break;
      case 'POST':
        result = await api.post(url, data, { params });
        break;
      case 'PUT':
        result = await api.put(url, data, { params });
        break;
      case 'PATCH':
        result = await api.patch(url, data, { params });
        break;
      case 'DELETE':
        result = await api.del(url, { params });
        break;
    }

    if (transformResponse) {
      return transformResponse(result, variables);
    }

    return result as TResponse;
  };
}
