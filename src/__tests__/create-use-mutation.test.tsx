import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createUseMutation } from '../lib/create-use-mutation';
import { PropsWithChildren } from 'react';
import React from 'react';

// Setup a QueryClient to wrap our hook within a provider
const queryClient = new QueryClient();

// Wrapper component that provides the necessary context for useMutation to work
const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const mockMutationFnNoParams = jest.fn(() => Promise.resolve('mutation result'));

test('createUseMutation without parameters', async () => {
  const useCustomMutation = createUseMutation(mockMutationFnNoParams);
  const { result } = renderHook(() => useCustomMutation(), { wrapper });

  // Act and trigger the mutation
  await act( async() => {
    return result.current.mutate();
  });

  await waitFor(() => result.current.data)

  // Check if the mutation was successful and the result is as expected
  expect(result.current.data).toBe('mutation result');
  // Ensure the mutation function was called
  expect(mockMutationFnNoParams).toHaveBeenCalled();
});

const mockMutationFnWithParams = jest.fn((params: {name: string}) => Promise.resolve(`mutation result ${params.name}`));

test('createUseMutation with parameters', async () => {
  const useCustomMutation = createUseMutation(mockMutationFnWithParams);
  const param = {name: 'veljkoza'};
  const { result } = renderHook(() => useCustomMutation(), { wrapper });

  // Act and trigger the mutation with a parameter
  await act(async () => {
    return result.current.mutate({name: param.name});
  });
  await waitFor(() => result.current.data)

  // Check if the mutation was successful and the result is as expected
  expect(result.current.data).toBe(`mutation result ${param.name}`);
  // Ensure the mutation function was called with the correct parameter
  expect(mockMutationFnWithParams).toHaveBeenCalledWith(param);
});
