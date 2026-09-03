/** Serializable service view used by the services management UI. */
export type ServiceListItem = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  isActive: boolean;
};

export type ServiceActionResult =
  | { success: true; service: ServiceListItem }
  | { success: false; message: string };
