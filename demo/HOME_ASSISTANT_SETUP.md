# Home Assistant Setup Guide

## Getting Your Access Token

1. **Open Home Assistant** in your browser (usually `http://your-vps-ip:8123`)

2. **Go to your profile:**
   - Click on your profile icon (bottom left)
   - Scroll down to find "Long-lived access tokens"

3. **Create a new token:**
   - Click "Create Token"
   - Give it a name (e.g., "VPS Light Control")
   - Copy the token immediately (you won't be able to see it again!)

4. **Update config.ts:**
   ```typescript
   export const homeAssistantConfig: HomeAssistantConfig = {
     baseUrl: 'http://localhost:8123', // or 'http://192.168.1.65:8123' if accessing remotely
     accessToken: 'YOUR_TOKEN_HERE', // Paste your token here
   };
   ```

## Configuration Options

### baseUrl
- **localhost**: Use `http://localhost:8123` if the code runs on the same machine as Home Assistant
- **Remote access**: Use `http://YOUR_VPS_IP:8123` if accessing from another machine
- **Docker**: If Home Assistant is in Docker, `localhost` should work from inside the container network

### Finding Your Light Entity IDs

Light entities in Home Assistant typically follow the pattern:
- `light.living_room`
- `light.bedroom_lamp`
- `light.kitchen_ceiling`

You can find all your lights by:
1. Going to Home Assistant -> Developer Tools -> States
2. Filter for `light.` entities

## Usage Examples

### Turn a light on:
```typescript
await ha.turnLightOn('light.living_room');
```

### Turn a light off:
```typescript
await ha.turnLightOff('light.living_room');
```

### Set brightness (0-255):
```typescript
await ha.setLightBrightness('light.living_room', 128); // 50% brightness
```

### Toggle a light:
```typescript
await ha.toggleLight('light.living_room');
```

### Get light state:
```typescript
const state = await ha.getLightState('light.living_room');
console.log(state.state); // 'on' or 'off'
console.log(state.brightness); // 0-255
```

## Running the Code

### On the VPS (where Home Assistant is):
```bash
npm run dev
# or
npm run build && npm start
```

### Testing locally first:
Make sure to update `baseUrl` in `config.ts` to point to your Home Assistant instance.

