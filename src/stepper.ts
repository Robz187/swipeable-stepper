import {
  Component,
  ViewEncapsulation,
  input,
  output,
  ChangeDetectionStrategy,
  computed,
  signal,
  AfterViewInit,
  model,
  Directive,
  ContentChildren,
  QueryList,
  effect,
  ViewChild,
  ElementRef,
  inject,
  DestroyRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { CxStepperHeadComponent, StepData } from './stepper-head';
import { CxStepperNavigationComponent } from './stepper-navigation';
import { StepNavItem, NavigationAttemptEvent } from './evaluation.models';
import { CxSwipeControl } from './swipe-controll.directive';
import { CdkStepper, CdkStep, StepperSelectionEvent } from '@angular/cdk/stepper';

/**
 * Host directive that extends CdkStepper to provide token for mat-step children
 * This is necessary because mat-step elements need to inject CdkStepper at compile time
 */
@Directive({
  selector: '[cxTouchStepperHost]',
  standalone: true,
  providers: [{ provide: CdkStepper, useExisting: CxTouchStepperHostDirective }]
})
export class CxTouchStepperHostDirective extends CdkStepper {
  @ContentChildren(CdkStep, { descendants: true })
  override steps!: QueryList<CdkStep>;
}
/**
 * Touch-enabled Stepper Component with Swipe Navigation, Linear Mode & Validation
 *
 * Always includes swipe gesture support for mobile and touch-enabled devices.
 * Custom UI with collapsible header, progress indicators, and footer navigation.
 *
 * @example
 * ```html
 * <cx-touch-stepper
 *   [linear]="true"
 *   [(selectedIndex)]="currentStep"
 *   (selectionChange)="onStepChange($event)"
 *   (navigationAttempt)="onNavBlocked($event)">
 *
 *   <mat-step label="Step 1" [stepControl]="form1">
 *     ...content...
 *   </mat-step>
 * </cx-touch-stepper>
 * ```
 */
@Component({
  selector: 'cx-touch-stepper',
  standalone: true,
  hostDirectives: [CxTouchStepperHostDirective],
  imports: [
    CommonModule,
    MatStepperModule,
    CxStepperHeadComponent,
    CxStepperNavigationComponent,
    CxSwipeControl
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [cxSwipeControl]="true"
      (swipeNext)="next()"
      (swipePrev)="previous()"
      class="cx-stepper-container">

      <!-- mat-step children are injected here via ng-content -->
      <ng-content select="mat-step" />

      <!-- Custom UI Components -->
      <cx-stepper-head class="stepper-head"
        [currentStep]="selectedIndex() + 1"
        [totalSteps]="totalSteps()"
        [progressPercentage]="progressPercentage()"
        [visibleSteps]="visibleSteps()"
        [allSteps]="allStepsData()"
        [stepsVisible]="false"
        [linear]="linear()"
        [selectedIndex]="selectedIndex()"
        (stepClick)="navigateTo($event)"
      />

      <div class="cx-mat-stepper-content">
        @for (step of steps(); track step; let i = $index) {
          @if (selectedIndex() === i) {
            <div class="step-content-wrapper">
              <ng-container [ngTemplateOutlet]="step.content" />
            </div>
          }
        }
      </div>

      <cx-stepper-navigation
        [currentStepIndex]="selectedIndex()"
        [totalSteps]="totalSteps()"
        [progressPercentage]="progressPercentage()"
        [canGoPrevious]="canPrevious()"
        [canGoNext]="canNext()"
        (previous)="previous()"
        (next)="next()"
      />
    </div>
  `,
  styleUrl: './main.scss',
})
export class CxTouchStepperComponent implements AfterViewInit {
  @ViewChild(CxStepperHeadComponent, {read:ElementRef})
  private stepperHeadRef!: ElementRef;
  private destroyRef = inject(DestroyRef);
  private containerWidth = signal(0);
  readonly windowSize = computed(() => {
    const width = this.containerWidth();
    if(width === 0) return 7;

    const itemWidth = 36;
    const maxItems = Math.floor(width / itemWidth);
    const half = Math.floor(maxItems / 2);
    
    return Math.max(3, half);
  });
  /**
   * Enable linear mode - users must complete steps sequentially
   */
  readonly linear = input(false);

  /**
   * Currently selected step index (0-based, two-way binding)
   */
  readonly selectedIndex = model(0);

  /**
   * Show or hide the header component
   */
  readonly showHeader = input(true);

  /**
   * Show or hide the navigation component
   */
  readonly showNavigation = input(true);

  /**
   * Emitted when step selection changes
   */
  readonly selectionChange = output<StepperSelectionEvent>();

  /**
   * Emitted when navigation is attempted but blocked
   */
  readonly navigationAttempt = output<NavigationAttemptEvent>();

  // Access the host directive's steps
  @ContentChildren(CdkStep, { descendants: true })
  private _steps!: QueryList<CdkStep>;

  // Internal signal to track when stepper is initialized
  private _stepperInitialized = signal(false);

  //Internal signal to track validation
  private _validationMap = signal<Map<number, boolean>>(new Map());

  /**
   * Array of all steps (reactive)
   */
  readonly steps = computed(() => {
    // Trigger recomputation when stepper initializes
    if (!this._stepperInitialized()) {
      return [];
    }
    return this._steps?.toArray() ?? [];
  });

  /**
   * Total number of steps
   */
  readonly totalSteps = computed(() => this.steps().length);

  /**
   * Current step object
   */
  readonly currentStep = computed(() => this.steps()[this.selectedIndex()] ?? null);

  /**
   * Progress percentage (0-100)
   */
  readonly progressPercentage = computed(() => {
    const total = this.totalSteps();
    const current = this.selectedIndex() + 1;
    return total > 0 ? Math.round((current / total) * 100) : 0;
  });

  /**
   * Can navigate to previous step
   */
  readonly canPrevious = computed(() => this.selectedIndex() > 0);

  /**
   * Can navigate to next step (respects validation)
   */
  readonly canNext = computed(() => {
    const nextIndex = this.selectedIndex() + 1;
    if (nextIndex >= this.totalSteps()) {
      return false;
    }
    return this._canNavigateToStep(nextIndex);
  });
  /**
   * Visible steps for pagination (smart visibility)
   * Shows: current ± 2 steps, dots for gaps, always includes last step
   */
readonly visibleSteps = computed((): StepNavItem[] => {
  const current = this.selectedIndex();
  const total = this.totalSteps();
  const size = this.windowSize();
  
  if (total <= size * 2) {
    return Array.from({ length: total }, (_, i) => ({
      type: 'step',
      step: i
    } as StepNavItem));
  }
  
  const result: StepNavItem[] = [];
  
  // START: current < size (first 7)
  if (current < size) {
    for (let i = 0; i < size; i++) {
      result.push({ type: 'step', step: i });
    }
    result.push({ type: 'dots' });
    for (let i = total - size; i < total; i++) {
      result.push({ type: 'step', step: i });
    }
    return result;
  }
  
  // END: current in last size steps
  if (current >= total - size) {
    for (let i = 0; i < size; i++) {
      result.push({ type: 'step', step: i });
    }
    result.push({ type: 'dots' });
    for (let i = total - size; i < total; i++) {
      result.push({ type: 'step', step: i });
    }
    return result;
  }
  
  // MIDDLE: sliding window (current is last in left window)
  const leftStart = current - size + 1;
  const leftEnd = current;
  
  for (let i = leftStart; i <= leftEnd; i++) {
    result.push({ type: 'step', step: i });
  }
  result.push({ type: 'dots' });
  for (let i = total - size; i < total; i++) {
    result.push({ type: 'step', step: i });
  }
  
  return result;
});

  /**
   * All steps data for dialog
   */
  readonly allStepsData = computed((): StepData[] => {
    return this.steps().map((step: any, idx: number) => ({
      id: idx + 1,
      title: step.label || `Step ${idx + 1}`,
      subtitle: step.ariaLabel || '',
    }));
  });

  //Manage Subscription and validation for navigation component 
  constructor() {
    effect((onCleanup) => {
      const steps = this.steps();
      if (steps.length === 0) {
        return; // Empty Array guard 
      }
      const subscriptions: Subscription[] = [];

      // Clear old validation states
      this._validationMap.set(new Map());

      steps.forEach((step: any, index: number) => {
        if (step.stepControl) {
          const initialValid = step.stepControl.valid;
          this._validationMap.update(map => {
            map.set(index, initialValid);
            return new Map(map);
          });

          // Subscribe to changes
          const sub = step.stepControl.statusChanges
            // .pipe(takeUntilDestroyed())  ← REMOVE THIS!
            .subscribe((status: string) => {
              this._validationMap.update(map => {
                map.set(index, status === 'VALID');
                return new Map(map);
              });
            });

          subscriptions.push(sub);
        }
      });
      onCleanup(() => {
        subscriptions.forEach(sub => sub.unsubscribe());
      });
    });
  }
  ngAfterViewInit(): void {
      if (this.stepperHeadRef) {
        const navElement = this.stepperHeadRef.nativeElement.querySelector('.step-navigation');
        
        if (navElement) {
          const rect = navElement.getBoundingClientRect();
          this.containerWidth.set(rect.width);
          
          const observer = new ResizeObserver(() => {
            const newRect = navElement.getBoundingClientRect();
            this.containerWidth.set(newRect.width);
          });
          
          observer.observe(navElement);
          
          this.destroyRef.onDestroy(() => observer.disconnect());
        }
      }
      
      this._stepperInitialized.set(true);
  }

  /**
   * Navigate to the next step
   * @returns true if navigation succeeded, false if blocked
   */
  next(): boolean {
    if (!this.canNext()) {
      this._handleNavigationBlocked(this.selectedIndex(), this.selectedIndex() + 1, 'validation');
      return false;
    }

    this.selectedIndex.update(i => i + 1);
    return true;
  }

  /**
   * Navigate to the previous step
   * @returns true if navigation succeeded, false if blocked
   */
  previous(): boolean {
    if (!this.canPrevious()) {
      this._handleNavigationBlocked(this.selectedIndex(), this.selectedIndex() - 1, 'boundary');
      return false;
    }

    this.selectedIndex.update(i => i - 1);
    return true;
  }

  /**
   * Navigate to a specific step index
   * @param index Target step index (0-based)
   * @returns true if navigation succeeded, false if blocked
   */
  navigateTo(index: number): boolean {
    if (index < 0 || index >= this.totalSteps()) {
      this._handleNavigationBlocked(this.selectedIndex(), index, 'boundary');
      return false;
    }

    if (!this._canNavigateToStep(index)) {
      this._handleNavigationBlocked(this.selectedIndex(), index, 'validation');
      return false;
    }

    this.selectedIndex.set(index);
    return true;
  }

  /**
   * Reset stepper to first step
   */
  reset(): void {
    this.selectedIndex.set(0);
    // Reset all steps
    this._steps?.forEach(step => step.reset());
  }

  /**
   * Check if navigation to a specific step is allowed
   * @param targetIndex Target step index
   */
  canNavigateTo(targetIndex: number): boolean {
    return this._canNavigateToStep(targetIndex);
  }

  /**
   * Validate a specific step
   * @param index Step index to validate
   */
  validateStep(index: number): boolean {
    const step: any = this.steps()[index];
    return step?.stepControl?.valid ?? true;
  }

  /**
   * Validate all steps
   */
  validateAll(): boolean {
    return this.steps().every((step: any) => step.stepControl?.valid ?? true);
  }

  /**
   * Internal validation logic
   */
  private _canNavigateToStep(targetIndex: number): boolean {
    const currentIndex = this.selectedIndex();

    // Allow backward or non-linear
    if (targetIndex < currentIndex || !this.linear()) {
      return true;
    }
    // Check validation states
    const validations = this._validationMap();

    for (let i = currentIndex; i < targetIndex; i++) {
      const isValid = validations.get(i);

      if (isValid === false) {
        return false;
      }
    }

    return true;
  }

  /**
   * Handle blocked navigation
   */
  private _handleNavigationBlocked(
    from: number,
    to: number,
    reason: 'validation' | 'linear' | 'boundary'
  ): void {
    // Mark current step as touched to show validation errors
    if (reason === 'validation') {
      const currentStep: any = this.currentStep();
      currentStep?.stepControl?.markAllAsTouched();
    }

    // Emit event
    this.navigationAttempt.emit({ from, to, allowed: false, reason });
  }

}
