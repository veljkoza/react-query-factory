/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
  useQuery,
} from '@tanstack/react-query';

type ServiceFunction<TParams = undefined, TResult = unknown> = [
  TParams,
] extends [undefined]
  ? (params?: TParams) => Promise<TResult>
  : (params: TParams) => Promise<TResult>;

type UseQueryFnWithoutParams<TResult = unknown> = (
  options?: Omit<
    UseQueryOptions<TResult, unknown, TResult, QueryKey>,
    'queryKey' | 'queryFn'
  >,
) => UseQueryResult<TResult, unknown>;

type UseQueryFnWithParams<TParams, TResult = unknown> = (
  params: TParams,
  options?: Omit<
    UseQueryOptions<TResult, unknown, TResult, QueryKey>,
    'queryKey' | 'queryFn'
  >,
) => UseQueryResult<TResult, unknown>;

function createUseQuery<TResult>(
  expectsParams: false,
  serviceFn: ServiceFunction<undefined, TResult>,
  queryKey?: (params?: undefined) => QueryKey,
): UseQueryFnWithoutParams<TResult>;
function createUseQuery<TParams, TResult>(
  expectsParams: true,
  serviceFn: ServiceFunction<TParams, TResult>,
  queryKey?: (params: TParams) => QueryKey,
): UseQueryFnWithParams<TParams, TResult>;
function createUseQuery<TParams = undefined, TResult = unknown>(
  expectsParams: boolean,
  serviceFn: ServiceFunction<TParams, TResult>,
  queryKey?: (params: TParams) => QueryKey,
) {
  return function (
    params: TParams,
    options?: UseQueryOptions<TResult, unknown, TResult, QueryKey>,
  ) {
    const computedKey = queryKey?.(params) || options?.queryKey || [];
    const getOptions = () => {
      if (expectsParams) return options;
      return params;
    };
    return useQuery({
      queryFn: () => serviceFn(params),
      ...getOptions(),
      queryKey: computedKey,
    });
  };
}

type FunctionType = (...args: any[]) => any;

type CreateUseQueryTypeWithoutParams<T extends Record<keyof T, FunctionType>> =
  {
    [K in keyof T]: Parameters<T[K]>[0] extends undefined
      ? {
          useQuery: UseQueryFnWithoutParams<
            ReturnType<T[K]> extends Promise<infer R> ? R : never
          >;
        }
      : unknown;
  };

type CreateUseQueryTypeWithParams<T extends Record<keyof T, FunctionType>> = {
  [K in keyof T]: Parameters<T[K]>[0] extends undefined
    ? unknown
    : {
        useQuery: UseQueryFnWithParams<
          Parameters<T[K]>[0],
          ReturnType<T[K]> extends Promise<infer R> ? R : never
        >;
      };
};

type CreateUseQueryType<T extends Record<keyof T, FunctionType>> =
  CreateUseQueryTypeWithoutParams<T> & CreateUseQueryTypeWithParams<T>;

export {
  CreateUseQueryType,
  CreateUseQueryTypeWithParams,
  CreateUseQueryTypeWithoutParams,
  ServiceFunction,
  UseQueryFnWithParams,
  UseQueryFnWithoutParams,
  createUseQuery,
};
