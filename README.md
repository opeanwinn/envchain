# envchain

Lightweight library for chaining and validating environment variable schemas at runtime.

---

## Installation

```bash
npm install envchain
# or
yarn add envchain
```

## Usage

```typescript
import { envchain } from 'envchain';

const env = envchain()
  .string('DATABASE_URL')
  .number('PORT', { default: 3000 })
  .boolean('DEBUG', { default: false })
  .string('API_KEY', { required: true })
  .parse();

// env.DATABASE_URL => string
// env.PORT         => number
// env.DEBUG        => boolean
// env.API_KEY      => string

console.log(`Server running on port ${env.PORT}`);
```

If a required variable is missing or fails validation, `envchain` throws a descriptive error at startup — before your app has a chance to misbehave.

```
EnvchainError: Missing required environment variable: "API_KEY"
```

## API

| Method | Description |
|---|---|
| `.string(key, opts?)` | Validates value as a string |
| `.number(key, opts?)` | Parses and validates as a number |
| `.boolean(key, opts?)` | Parses `"true"` / `"false"` as boolean |
| `.parse()` | Finalizes the chain and returns the validated env object |

Each method accepts an optional options object with `required` (boolean) and `default` (value) fields.

## License

[MIT](./LICENSE)