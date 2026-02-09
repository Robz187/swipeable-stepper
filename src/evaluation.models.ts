export interface EvaluationStep {
  id: number;
  title: string;
  subtitle: string;
}

export interface StepNavItem {
  type: 'step' | 'dots';
  step?: number;
}
export interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
}

export interface NavigationAttemptEvent {
  from: number;
  to: number;
  allowed: boolean;
  reason?: 'validation' | 'linear' | 'boundary';
}
export interface StepData {
  id: number;
  title: string;
  subtitle: string;
}