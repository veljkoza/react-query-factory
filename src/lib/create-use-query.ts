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


/**
 * Creates a custom `useQuery` hook tailored to a specific service function. This utility
 * function facilitates the integration of asynchronous service functions with React Query's
 * `useQuery` hook, allowing for data fetching with or without parameters.
 *
 * @template TResult The expected result type of the service function's promise.
 * @template TParams The type of parameters the service function expects, if any.
 * 
 * @param {object} params Configuration object for creating the custom `useQuery` hook.
 * @param {boolean} params.expectsParams Indicates whether the service function expects parameters.
 *   If `true`, the generated `useQuery` hook will expect the first argument to be the parameters
 *   for the service function. If `false`, the hook will not expect any parameters for the service function.
 * @param {ServiceFunction<TParams, TResult>} params.serviceFn The service function that will be
 *   invoked by the `useQuery` hook. This function should return a promise that resolves to the data
 *   you want to fetch.
 * @param {(params: TParams) => QueryKey} [params.queryKey] An optional function to generate a custom
 *   query key based on the parameters passed to the service function. If provided, it overrides the default
 *   query key generation. This is useful for ensuring that queries are correctly invalidated and refetched
 *   by React Query when parameters change.
 * 
 * @returns {UseQueryFnWithParams<TParams, TResult> | UseQueryFnWithoutParams<TResult>} A custom `useQuery`
 *   hook that is either parameterized (if `expectsParams` is `true`) or non-parameterized (if `expectsParams`
 *   is `false`). The hook, when invoked within a React component, will call the provided `serviceFn` with
 *   the specified parameters (if any) and manage the fetching state (loading, error, data) using React Query.
 *
 * @example
 * // Service function without parameters
 * const fetchTodos = () => fetch('/api/todos').then(res => res.json());
 * const useTodosQuery = createUseQuery({ expectsParams: false, serviceFn: fetchTodos });
 * // Inside a component
 * const { data: todos, isLoading } = useTodosQuery();
 *
 * @example
 * // Service function with parameters
 * const fetchTodoById = (todoId) => fetch(`/api/todos/${todoId}`).then(res => res.json());
 * const useTodoQuery = createUseQuery({ expectsParams: true, serviceFn: fetchTodoById, queryKey: (todoId) => ['todo', todoId] });
 * // Inside a component
 * const { data: todo, isLoading } = useTodoQuery(todoId);
 */

function createUseQuery<TResult>(
  params: {expectsParams: false,
    serviceFn: ServiceFunction<undefined, TResult>,
    queryKey?: (params?: undefined) => QueryKey,}
): UseQueryFnWithoutParams<TResult>;
function createUseQuery<TParams, TResult>(
  params: {expectsParams: true,
    serviceFn: ServiceFunction<TParams, TResult>,
    queryKey?: (params: TParams) => QueryKey,}
): UseQueryFnWithParams<TParams, TResult>;
function createUseQuery<TParams = undefined, TResult = unknown>(
 params: {
  expectsParams: boolean,
  serviceFn: ServiceFunction<TParams, TResult>,
  queryKey?: (params: TParams) => QueryKey,
 }
) {
  const {queryKey, expectsParams, serviceFn} = params
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
