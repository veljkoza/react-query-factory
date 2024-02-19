import {
  MutationFunction,
  UseMutationOptions,
  UseMutationResult,
  useMutation,
} from '@tanstack/react-query';
import { ServiceFunction } from './create-use-query';

// Define UseMutationFn types for with and without parameters
type UseMutationFnWithoutParams<TResult> = (
  options?: Omit<
    UseMutationOptions<TResult, unknown, void, unknown>,
    'mutationFn'
  >,
) => UseMutationResult<TResult, unknown, void, unknown>;

type UseMutationFnWithParams<TParams, TResult> = (
  options?: Omit<
    UseMutationOptions<TResult, unknown, TParams, unknown>,
    'mutationFn'
  >,
) => UseMutationResult<TResult, unknown, TParams, unknown>;
// Overloaded function definitions
function createUseMutation<TResult>(
  serviceFn: ServiceFunction<undefined, TResult>,
): UseMutationFnWithoutParams<TResult>;

function createUseMutation<TParams, TResult>(
  serviceFn: ServiceFunction<TParams, TResult>,
): UseMutationFnWithParams<TParams, TResult>;

// Implementation
function createUseMutation<TParams = undefined, TResult = unknown>(
  serviceFn: ServiceFunction<TParams, TResult>,
) {
  return function (
    options?: Omit<
      UseMutationOptions<TResult, unknown, TParams, unknown>,
      'mutationFn'
    >,
  ) {
    return useMutation<TResult, unknown, TParams, unknown>({
      mutationFn: serviceFn as MutationFunction<TResult, TParams>,
      ...options,
    });
  };
}

export {
  UseMutationFnWithParams,
  UseMutationFnWithoutParams,
  createUseMutation,
};
