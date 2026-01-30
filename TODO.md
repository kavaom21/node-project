# TODO: Switch from Cookie-based to Header-based Authentication

## Changes Required:

### 1. Update auth middleware (`src/component/middelwares/index.js`)
   - [x] Extract token from `Authorization: Bearer <token>` header
   - [x] Remove cookie-based token reading

### 2. Update controller functions (`src/component/user/controller/controller.js`)
   - [x] `register()`: Return tokens in response body instead of setting cookies
   - [x] `login()`: Return tokens in response body instead of setting cookies
   - [x] `logout()`: Remove cookie clearing logic
   - [x] `refreshToken()`: Read refresh token from `x-refresh-token` header

### 3. Cleanup (`src/index.js`)
   - [x] Remove `cookie-parser` middleware (if not used elsewhere)

## Implementation Status:
- [x] All tasks completed

