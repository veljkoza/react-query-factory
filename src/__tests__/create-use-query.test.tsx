import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createUseQuery } from '../lib/create-use-query';
import React, { PropsWithChildren } from 'react';

// Setup a QueryClient to wrap our hook with a provider
const queryClient = new QueryClient();

// Wrapper component that provides the necessary context for useQuery to work
const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const mockServiceFnNoParams = jest.fn(() => Promise.resolve('data'));

test('createUseQuery without parameters', async () => {
  const useCustomQuery = createUseQuery({ expectsParams: false, serviceFn: mockServiceFnNoParams });
  const { result } = renderHook(() => useCustomQuery(), { wrapper });

  // Wait for the query to resolve
  await waitFor(() => result.current.isSuccess);

  // Check if the data returned by the query is as expected
  expect(result.current.data).toBe('data');
  // Ensure the service function was called
  expect(mockServiceFnNoParams).toHaveBeenCalled();
});

const mockServiceFnWithParams = jest.fn((param: {name: string}) => Promise.resolve(`data-${param}`));

test('createUseQuery with parameters', async () => {
  const useCustomQuery = createUseQuery({
    expectsParams: true,
    serviceFn: mockServiceFnWithParams,
    queryKey: (param) => ['custom', param],
  });
  const param = {name: "veljkoza"};
  const { result } = renderHook(() => useCustomQuery({name: param.name}), { wrapper });

  // Wait for the query to resolve
  await waitFor(() => result.current.isSuccess);

  // Check if the data returned by the query is as expected
  expect(result.current.data).toBe(`data-${param}`);
  // Ensure the service function was called with the correct parameter
  expect(mockServiceFnWithParams).toHaveBeenCalledWith(param);
});


