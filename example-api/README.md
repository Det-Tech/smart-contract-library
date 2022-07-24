## Getting Started

### Problem with Keccak256

> `node_modules\keccak256\dist\keccak256.d.ts`
>
> ```ts
> declare function keccak256(
>   value: Buffer | BN | string | number,
> ): buffer.Buffer;
> ```
>
> needs to be
>
> ```ts
> declare function keccak256(
>   value: Buffer | BN | string | number,
> ): typeof buffer.Buffer;
> ```
>
> Then it will build

- Install
  ```
  npm install
  ```
- Run the development server:

  ```
  npm run dev
  ```

Open [http://localhost:8080](http://localhost:8080) with your browser to see the result.
