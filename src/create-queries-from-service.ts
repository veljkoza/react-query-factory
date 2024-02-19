/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryKey } from '@tanstack/react-query';
import {
  UseMutationFnWithParams,
  UseMutationFnWithoutParams,
  createUseMutation,
} from './create-use-mutation';
import {
  ServiceFunction,
  UseQueryFnWithParams,
  UseQueryFnWithoutParams,
  createUseQuery,
} from './create-use-query';

type FunctionConstraint<T> = {
  [K in keyof T]: (...args: any[]) => any;
};

function createQueriesFromService<T extends FunctionConstraint<T>>(
  service: T,
  queryKeyPrefix: string,
) {
  type ServiceToQueryFn<Params, TFunction> =
    TFunction extends ServiceFunction<infer TParams, infer TResult>
      ? Params extends []
        ? UseQueryFnWithoutParams<TResult>
        : UseQueryFnWithParams<TParams, TResult>
      : never;

  type ServiceToMutationFn<Params, TFunction> =
    TFunction extends ServiceFunction<infer TParams, infer TResult>
      ? Params extends []
        ? UseMutationFnWithoutParams<TResult>
        : UseMutationFnWithParams<TParams, TResult>
      : never;

  type Queries = {
    [K in keyof T]: {
      useQuery: ServiceToQueryFn<Parameters<T[K]>, T[K]>;
      useMutation: ServiceToMutationFn<Parameters<T[K]>, T[K]>;
      queryKey: (
        params: Parameters<T[K]> extends [infer Params] ? Params : void,
      ) => QueryKey;
    };
  };

  const queries: Queries = {} as Queries;

  type QueryKeyFn<TParams> = (params: TParams) => QueryKey;

  Object.keys(service).forEach((key) => {
    const serviceFn = service[key as keyof T];
    if (typeof serviceFn === 'function') {
      // Determine if the service function expects parameters
      const expectsParams = serviceFn.length > 0;

      // Use an appropriate type assertion based on whether the service function expects parameters
      if (expectsParams) {
        (queries[key as keyof T] as any) = {
          useQuery: createUseQuery(
            true,
            serviceFn as ServiceFunction<any, any>,
            (params) => [queryKeyPrefix, key, params],
          ) as UseQueryFnWithParams<any, any>,
          useMutation: createUseMutation(
            serviceFn as ServiceFunction<any, any>,
          ) as UseMutationFnWithParams<any, any>,
          queryKey: ((params) => [
            queryKeyPrefix,
            key,
            params,
          ]) as QueryKeyFn<any>,
        };
      } else {
        (queries[key as keyof T] as any) = {
          useQuery: createUseQuery(
            false,
            serviceFn as ServiceFunction<undefined, any>,
            (params) => [queryKeyPrefix, key, params],
          ) as UseQueryFnWithoutParams<any>,
          useMutation: createUseMutation(
            serviceFn as ServiceFunction<undefined, any>,
          ) as UseMutationFnWithoutParams<any>,
          queryKey: ((params) => [
            queryKeyPrefix,
            key,
            params,
          ]) as QueryKeyFn<undefined>,
        };
      }
    }
  });

  return queries as Queries;
}

export { createQueriesFromService };
