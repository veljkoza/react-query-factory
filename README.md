# React Query Factory Documentation

## Introduction

The `react-query-factory` library provides a streamlined and type-safe approach to organizing your API layer in React applications when using TanStack's React Query. By simply providing a "service" object to the `createQueriesFromService` function, developers can generate a fully typesafe queries object, reducing boilerplate and enhancing code clarity and maintainability.

## Getting Started

### Installation

To begin using `react-query-factory`, you must first ensure that `@tanstack/react-query` is installed and set up in your project as it is a peer dependency. If not, you can install it using npm or yarn:

```sh
npm install @tanstack/react-query
```

or

```sh
yarn add @tanstack/react-query
```

Once React Query is installed, you can proceed to install `react-query-factory`:

```sh
npm install react-query-factory
```

or

```sh
yarn add react-query-factory
```

### Basic Usage

1. **Define a Service Object**: Start by defining a service object that includes methods for your API calls. Each method should return a promise resolving to the data you wish to fetch or mutate.

   ```typescript
   // Example service object
   const productService = {
     async getProducts(): Promise<Product[]> {
       // Implementation for fetching products
     },
     async getProductById(id: string): Promise<Product> {
       // Implementation for fetching a single product by ID
     },
     async createProduct(productData: Omit<Partial<Product>, 'id'>): Promise<Product> {
       // Implementation for creating a new product
     },
   };
   ```

2. **Generate Queries and Mutations**: Use `createQueriesFromService` to generate query and mutation hooks from your service object.

   ```typescript
   import { createQueriesFromService } from 'react-query-factory';

   const queries = createQueriesFromService(productService, 'products');
   ```

   Besides a service object `createQueriesFromService`, accepts `queryKeyPrefix` as a second argument. This is required so we can automatically generate `queryKey` for every query.

3. **Use Generated Hooks in Components**: You can now use the generated query and mutation hooks in your components.

   ```typescript
   import React from 'react';

   const ProductList = () => {
     const { data, isLoading, error } = queries.getProducts.useQuery();
     const { mutate } = queries.createProduct.useMutation();

     if (isLoading) return <div>Loading...</div>;
     if (error) return <div>An error occurred: {error.message}</div>;

     return (
       <ul>
         {data?.map(product => (
           <li key={product.id}>{product.name}</li>
         ))}
       </ul>
     );
   };
   ```

## Generating Query Keys with `react-query-factory`

With `react-query-factory`, query keys are generated automatically based on the service method names and parameters. Keys are coupled to queries itself so you don't have to manage them at all.

#### Default Query Keys

By default, `createQueriesFromService` generates query keys using the following pattern:

```javascript
[queryKeyPrefix, methodName, ...methodParams];
```

- `queryKeyPrefix`: A string you provide when generating queries and mutations, acting as a namespace for your keys.
- `methodName`: The name of the service method used for the query or mutation.
- `methodParams`: Parameters passed to the query or mutation, ensuring uniqueness for different parameter values.

### Example: Using Query Keys

Consider a scenario where you have a query to fetch a product by its ID. The query key might be generated as follows:

```javascript
const productQueryKey = queries.products.getById.queryKey({ id: '2' });
```

This generates a query key like `['products', 'getById', { id: '2' }]`, uniquely identifying the query within the React Query cache.

### Utilizing Query Keys in Components

Query keys can be used directly in your components for various purposes, such as manually invalidating or refetching queries. Here's an example of how you might use a query key in a component:

```javascript
function Index() {
  const queryClient = useQueryClient();

  const product = queryClient.getQueryData(queries.products.getById.queryKey({ id: '2' }));

  return <div>{/* Render your product details */}</div>;
}
```

In this example, `queries.products.getById.queryKey({ id: '2' })` generates the query key used to fetch the product details. This key can also be used for cache management tasks, such as invalidating the query to force a refetch if the product data changes.

Understanding and using query keys effectively allows you to manage and optimize the caching behavior of your queries and mutations, ensuring your application remains fast, responsive, and efficient.

## Advanced Usage

### Handling Parameters

For service methods that require parameters, `react-query-factory` automatically generates hooks that accept these parameters and include them in the query key to ensure correct caching and invalidation. All cases are covered.

#### useQuery without params

If your service function doesn't accept params, you are able to pass `options` to the `useQuery` like normal. With the exception of `queryKey` and `queryFn` params.

```tsx
const { data } = queries.products.getAll.useQuery();
//or
const { data } = queries.products.getAll.useQuery({
    enabled: true,
    refetchInterval: 6000,
    ...
  });
```

#### useQuery with params

If your service function accepts params, you are able to pass `params` and `options` arguments to the `useQuery` hook.

```tsx
const { data } = queries.products.getById.useQuery({id: "123"});
//or
const { data } = queries.products.getById.useQuery({id: "123"}, {
    enabled: true,
    refetchInterval: 6000,
    ...
  });
//or if params are optional but you still want to pass options
const { data } = queries.products.getById.useQuery(undefined, {
    enabled: true,
    refetchInterval: 6000,
    ...
  });
```

#### useMutation without params

If your service function doesn't accept params, you are still able to pass `options` argument:

```tsx
const { mutate } = queries.products.createProduct.useMutation();
//or
const { mutate } = queries.products.createProduct.useMutation({ onSuccess: () => alert('on mutation success') });

mutate(); // doesn't require any params, no TS error
```

#### useMutation with params

If your service function accepts params, you are able to pass `params` to `mutate` function and `options` arguments to the `useMutation` hook.

```tsx
const { mutate } = queries.products.createProduct.useMutation();
mutate({name: "iPhone pro", image: "xyz.com/img.jpg", ... })
mutate() // Will throw TS error
//or
const { mutate } = queries.products.createProduct.useMutation({ enabled: false, ... });
```

### Centralized API layer

It's suggested that you have one object which encapsulates all of the queries. For example:

```tsx
const postsService = { getPosts, createPosts, getPostById };
const productService = { getProducts, addProductToCard, getProductById };
const postsQueries = createQueriesFromService(postsService, "posts");
const productsQueries = createQueriesFromService(productService, "products");

const queries = { posts: postsQueries, products: productsQueries };

const Foo = () => {
	const { data } = queries.products.getProducts.useQuery()
	...
}
```

This way your API layer is centralized in `queries` object, so next developer doesn’t have to second guess names like `productService`, since they can rely on autocomplete to offer them suggestions by typing `queries.`.


### Type Safety

`react-query-factory` leverages TypeScript for full type safety, ensuring that your service methods, parameters, and return types are correctly typed. This reduces runtime errors and improves the developer experience.

## Contributing

Contributions to `react-query-factory` are welcome. Whether it's feature requests, bug reports, or pull requests, your input helps make this library better for everyone.

## License

`react-query-factory` is open-source software licensed under the MIT license.
