import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createQueriesFromService } from '../lib/create-queries-from-service';
import React, { PropsWithChildren } from 'react';

// Mock service functions
const mockGetData = jest.fn(() => Promise.resolve('data'));
const mockPostData = jest.fn((data: {name: string}) => Promise.resolve(`posted ${data.name}`));

// Mock service object
const mockService = {
  getData: mockGetData,
  postData: mockPostData,
};

// Setup a QueryClient to wrap our hooks within a provider
const queryClient = new QueryClient();

// Wrapper component that provides the necessary context for useQuery and useMutation to work
const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('createQueriesFromService', () => {
  it('generates useQuery and useMutation hooks for functions without parameters', async () => {
    const { getData } = createQueriesFromService(mockService, 'testPrefix');

    // Test useQuery hook
    const { result: queryResult } = renderHook(() => getData.useQuery(), { wrapper });
    await waitFor(() => queryResult.current.isSuccess);
    expect(queryResult.current.data).toBe('data');

    // Test queryKey
    expect(getData.queryKey()).toEqual(['testPrefix', 'getData', undefined]);

    // Test useMutation hook
    const { result: mutationResult } = renderHook(() => getData.useMutation(), { wrapper });
    await act(async () => {
      mutationResult.current.mutate();
    });
    await waitFor(() => mutationResult.current.isSuccess);
    expect(mutationResult.current.data).toBe('data');
  });

  it('generates useQuery and useMutation hooks for functions with parameters', async () => {
    const { postData } = createQueriesFromService(mockService, 'testPrefix');

    // Test useQuery hook with parameter
    const param = {name: 'veljkoza'};
    const { result: queryResult } = renderHook(() => postData.useQuery({name: 'veljkoza'}), { wrapper });
    await waitFor(() => queryResult.current.data);
    expect(queryResult.current.data).toBe(`posted ${param.name}`);

    // Test queryKey with parameter
    expect(postData.queryKey(param)).toEqual(['testPrefix', 'postData', {...param}]);

    // Test useMutation hook with parameter
    const { result: mutationResult } = renderHook(() => postData.useMutation(), { wrapper });
    await act(async () => {
      mutationResult.current.mutate(param);
    });
    await waitFor(() => mutationResult.current.data);
    expect(mutationResult.current.data).toBe(`posted ${param.name}`);
  });
});
