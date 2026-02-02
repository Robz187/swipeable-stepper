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
