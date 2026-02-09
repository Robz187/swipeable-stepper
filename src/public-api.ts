/**
 * Main touch-enabled stepper component with swipe navigation
 */
export { CxTouchStepperComponent } from './stepper';

/**
 * Stepper header with collapsible navigation and dialog
 * Note: Usually not needed directly - used internally by CxStepperComponent
 */
export { CxStepperHeadComponent } from './stepper-head';

/**
 * Stepper footer navigation
 * Note: Usually not needed directly - used internally by CxStepperComponent
 */
export { CxStepperNavigationComponent } from './stepper-navigation';

/**
 * Swipe gesture detection directive
 */
export { CxSwipeControl } from './swipe-controll.directive';

/**
 * Event emitted when navigation is blocked
 */
export type { NavigationAttemptEvent } from './evaluation.models';

/**
 * Step data structure for dialog display
 */
export type { StepData } from './evaluation.models';

/**
 * Step navigation item (for pagination)
 */
export type { StepNavItem } from './evaluation.models';

/**
 * Evaluation step structure
 */
export type { EvaluationStep } from './evaluation.models';

/**
 * Touch state for swipe detection
 */
export type { TouchState } from './evaluation.models';

/**
 * Re-export MatStepperModule for convenience
 * Users need to import this in their modules
 */
export { MatStepperModule } from '@angular/material/stepper';

/**
 * Re-export StepperSelectionEvent for typing
 */
export type { StepperSelectionEvent } from '@angular/cdk/stepper';
