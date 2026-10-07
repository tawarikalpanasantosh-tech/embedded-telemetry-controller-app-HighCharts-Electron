export type ParameterType = 'velocity' | 'pressure' | 'temperature';

export interface HistoryPoint {
  time: string;
  value: number;
}

export interface TelemetryParameter {
  value: number;
  unit: string;
  history: HistoryPoint[];
}

export interface DashboardResponse {
  timestamp: string;
  velocity: TelemetryParameter;
  pressure: TelemetryParameter;
  temperature: TelemetryParameter;
}