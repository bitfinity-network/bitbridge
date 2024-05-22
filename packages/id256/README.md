## The Javascript Bitfinity EVM bridge SDK

EVM Bridge JS Client package for interacting with the bridge related canisters and performing bridging operations.

### Setup

Clone the repository

```sh
yarn install
yarn dev # during development
yarn build # production build
```

### Tests

All the tests is written with vitest. Before running the test you need to ensure that you have to the bridging environment running.

```sh
cp .env.sample .env
IS_TEST=true # in the .env
```


