/**
 * Home Assistant Light Control via SSH
 * 
 * This script runs locally and controls Home Assistant lights
 * by executing code on the VPS via SSH
 */

import { SshRemoteCode } from '../dist';
import { ubuntuConfig } from './config';
import { LightState } from './homeassistant-client';


interface RemoteModule<T> {
  success: boolean;
  result: T;
}

interface TestModule {
  turnLightOn: (entityId: string, brightness?: number) => Promise<RemoteModule<boolean>>;
  turnLightOff: (entityId: string) => Promise<RemoteModule<boolean>>;
  toggleLight: (entityId: string) => Promise<RemoteModule<boolean>>;
  getLightState: (entityId: string) => Promise<RemoteModule<LightState>>;
  getAllLights: () => Promise<RemoteModule<string[]>>;
}

async function main() {
  console.log('🏠 Home Assistant Light Control via SSH\n');

  const ssh = new SshRemoteCode(ubuntuConfig);

  try {
    // Connect to VPS
    console.log('📡 Connecting to VPS...');
    await ssh.connect();
    console.log('✅ Connected to VPS\n');

    // Upload and compile sandbox files
    console.log('📤 Uploading Home Assistant code to VPS...');
    
    // The sandbox files will be uploaded and compiled on the remote machine
    // Make sure axios is installed on the remote machine
    
    // Execute the Home Assistant control code on the VPS
    console.log('🚀 Executing Home Assistant light control on VPS...\n');
    
    // Use runCommand to execute the compiled code
    const result = await ssh.import<TestModule>(`./index`);

    const allLights = await result.getAllLights();
    
    console.log('All Lights:');
    console.log(allLights.result);

    const lightState = await result.getLightState('light.bedroom');
    console.log(lightState.result);

    const turnedOn = await result.turnLightOn('light.bedroom');

    console.log(turnedOn.result);

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    console.log('🔌 Disconnecting from VPS...');
    try {
      await ssh.disconnect();
      console.log('✅ Disconnected');
    } catch (error) {
      console.error('⚠️  Error during disconnect:', error instanceof Error ? error.message : String(error));
    }
  }
}

// Run the main function
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
