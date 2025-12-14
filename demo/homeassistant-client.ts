/**
 * Home Assistant Client
 * 
 * Client for interacting with Home Assistant REST API
 * to control lights and other entities.
 */

import axios, { AxiosInstance } from 'axios';

export interface HomeAssistantConfig {
  baseUrl: string; // e.g., 'http://localhost:8123' or 'http://192.168.1.65:8123'
  accessToken: string; // Long-lived access token from Home Assistant
}

export interface LightState {
  entityId: string;
  state: 'on' | 'off';
  brightness?: number;
  color?: {
    r: number;
    g: number;
    b: number;
  };
}

export class HomeAssistantClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(config: HomeAssistantConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  /**
   * Check if Home Assistant is available
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/');
      return response.status === 200;
    } catch (error) {
      console.error('Home Assistant connection failed:', error);
      return false;
    }
  }

  /**
   * Get the state of a light entity
   */
  async getLightState(entityId: string): Promise<LightState | null> {
    try {
      const response = await this.client.get(`/api/states/${entityId}`);
      const state = response.data;
      
      return {
        entityId: state.entity_id,
        state: state.state === 'on' ? 'on' : 'off',
        brightness: state.attributes.brightness,
        color: state.attributes.rgb_color ? {
          r: state.attributes.rgb_color[0],
          g: state.attributes.rgb_color[1],
          b: state.attributes.rgb_color[2],
        } : undefined,
      };
    } catch (error) {
      console.error(`Failed to get state for ${entityId}:`, error);
      return null;
    }
  }

  /**
   * Turn a light on
   */
  async turnLightOn(entityId: string, brightness?: number, rgbColor?: { r: number; g: number; b: number }): Promise<boolean> {
    try {
      const serviceData: any = {
        entity_id: entityId,
      };

      if (brightness !== undefined) {
        serviceData.brightness = brightness; // 0-255
      }

      if (rgbColor) {
        serviceData.rgb_color = [rgbColor.r, rgbColor.g, rgbColor.b];
      }

      const response = await this.client.post('/api/services/light/turn_on', serviceData);
      return response.status === 200;
    } catch (error) {
      console.error(`Failed to turn on light ${entityId}:`, error);
      return false;
    }
  }

  /**
   * Turn a light off
   */
  async turnLightOff(entityId: string): Promise<boolean> {
    try {
      const response = await this.client.post('/api/services/light/turn_off', {
        entity_id: entityId,
      });
      return response.status === 200;
    } catch (error) {
      console.error(`Failed to turn off light ${entityId}:`, error);
      return false;
    }
  }

  /**
   * Toggle a light (on if off, off if on)
   */
  async toggleLight(entityId: string): Promise<boolean> {
    try {
      const currentState = await this.getLightState(entityId);
      if (!currentState) {
        return false;
      }

      if (currentState.state === 'on') {
        return await this.turnLightOff(entityId);
      } else {
        return await this.turnLightOn(entityId);
      }
    } catch (error) {
      console.error(`Failed to toggle light ${entityId}:`, error);
      return false;
    }
  }

  /**
   * Get all available light entities
   */
  async getAllLights(): Promise<string[]> {
    try {
      const response = await this.client.get('/api/states');
      const states = response.data;
      
      return states
        .filter((state: any) => state.entity_id.startsWith('light.'))
        .map((state: any) => state.entity_id);
    } catch (error) {
      console.error('Failed to get all lights:', error);
      return [];
    }
  }

  /**
   * Set light brightness (0-255)
   */
  async setLightBrightness(entityId: string, brightness: number): Promise<boolean> {
    if (brightness < 0 || brightness > 255) {
      console.error('Brightness must be between 0 and 255');
      return false;
    }
    return await this.turnLightOn(entityId, brightness);
  }
}

