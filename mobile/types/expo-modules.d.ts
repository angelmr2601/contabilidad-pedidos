declare module "expo-device" {
  export const isDevice: boolean;
  export const deviceName: string | null;
}
declare module "expo-notifications" {
  export enum AndroidImportance { HIGH = 4 }
  export function setNotificationChannelAsync(id: string, channel: { name: string; importance: AndroidImportance; sound?: string }): Promise<unknown>;
  export function getPermissionsAsync(): Promise<{ granted: boolean; status: string }>;
  export function requestPermissionsAsync(): Promise<{ granted: boolean; status: string }>;
  export function getExpoPushTokenAsync(options?: { projectId?: string }): Promise<{ data: string }>;
  export function addNotificationResponseReceivedListener(listener: (response: { notification: { request: { content: { data: Record<string, unknown> } } } }) => void): { remove(): void };
}
