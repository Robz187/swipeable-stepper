import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  forwardRef,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { CxStepperHeadComponent } from './stepper-head';
import { CxStepperNavigationComponent } from './stepper-navigation';
import { CdkStepper } from '@angular/cdk/stepper';
import { StepNavItem } from './evaluation.models';
import { CxSwipeControl } from './swipe-controll.directive';
@Component({
  selector: 'cx-stepper',
  standalone: true,
  providers: [{
    provide: CdkStepper,
    useExisting: forwardRef(() => CxStepperComponent)
  }],
  imports: [
    CommonModule,
    MatStepperModule,
    CxStepperHeadComponent,
    CxStepperNavigationComponent,
    CxSwipeControl
  ],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div 
        [cxSwipeControl]="isMobile()" 
        (swipeNext)="onSwipeNext()"
        (swipePrev)="onSwipePrev()" 
    class="cx-stepper-container">
      <cx-stepper-head 
        [currentStep]="selectedIndex + 1"
        [totalSteps]="steps.length"
        [progressPercentage]="getProgressPercentage()"
        [visibleSteps]="getVisibleSteps()"
        [allSteps]="getAllStepsData()"
        [stepsVisible]="false"
        (stepClick)="onStepClick($event)"
      />   
      
      <div class="cx-mat-stepper-content">
        <ng-content />
      </div>
      
      <cx-stepper-navigation 
        [currentStepIndex]="selectedIndex"
        [totalSteps]="steps.length"
        [progressPercentage]="getProgressPercentage()"
        (previous)="onPrevious()"
        (next)="onNext()"
      />
    </div>
  `,
  styleUrl: './main.scss',
})
export class CxStepperComponent extends CdkStepper {
  isMobile = input<boolean>(false);

  getVisibleSteps(): StepNavItem[] {
    const current = this.selectedIndex;
    const total = this.steps.length;
    const result: StepNavItem[] = [];

    if (current > 2) {
      result.push({ type: 'dots' });
    }
    const showCompleted = Math.max(0, current - 2);
    for (let i = showCompleted; i < current; i++) {
      result.push({ type: 'step', step: i });
    }
    result.push({ type: 'step', step: current });
    const upcomingEnd = Math.min(total - 1, current + 2);
    for (let i = current + 1; i <= upcomingEnd; i++) {
      result.push({ type: 'step', step: i });
    }
    if (upcomingEnd < total - 2) {
      result.push({ type: 'dots' });
    }
    if (upcomingEnd < total - 1) {
      result.push({ type: 'step', step: total - 1 });
    }

    return result;
  }


  getProgressPercentage(): number {
    const total = this.steps.length;
    const current = this.selectedIndex + 1;
    return total > 0 ? Math.round((current / total) * 100) : 0;
  }

  getAllStepsData(): any[] {
    return this.steps.toArray().map((step, idx) => ({
      id: idx + 1,
      title: step.label || `Step ${idx + 1}`,
      subtitle: step.ariaLabel || '',
    }));
  }
  onPrevious() {
    this.previous();
  }

  onNext() {
    /*     const currentStep = this.selected;
        const stepControl = currentStep?.stepControl;
        if (stepControl && !stepControl.valid) {
          stepControl.markAllAsTouched;
          return;
        } */
    this.next();
  }

  onStepClick(stepIndex: number) {
    const currentStep = this.selected;
    const stepControl = currentStep?.stepControl;
    if (stepControl && !stepControl.valid) {
      stepControl.markAllAsTouched;
      return;
    }
    this.selectedIndex = stepIndex;
  }

  onSwipeNext() {
    console.log('swipe next detected');
    this.onNext();
  }

  onSwipePrev() {
    console.log('swipe next detected');
    this.onPrevious();
  }
}
