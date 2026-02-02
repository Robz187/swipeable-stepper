import { Component, input, output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cx-stepper-navigation',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="nav-controls">
      <button
        class="nav-arrow"
        [class.visually-disabled]="currentStepIndex() === 0"
        [attr.aria-label]="getPreviousAriaLabel()"
        [disabled]="currentStepIndex() === 0"
        (click)="previous.emit()"
      >
        ‹
      </button>

      <progress
        class="nav-progress"
        [value]="progressPercentage()"
        max="100"
        [attr.aria-label]="'Fortschritt ' + progressPercentage() + ' Prozent'"
      >
        {{ progressPercentage() }}%
      </progress>

      <button
        class="nav-arrow"
        [class.visually-disabled]="currentStepIndex() === (totalSteps() ?? 0) - 1"
        [attr.aria-label]="getNextAriaLabel()"
        [attr.aria-disabled]="currentStepIndex() === (totalSteps() ?? 0) - 1"
        (click)="next.emit()"
      >
        ›
      </button>
    </div>
  `,
  styleUrl: './main.scss',
})
export class CxStepperNavigationComponent {
  readonly currentStepIndex = input<number>();
  readonly totalSteps = input<number>();
  readonly progressPercentage = input.required<number>();

  readonly previous = output<void>();
  readonly next = output<void>();

  getPreviousAriaLabel(): string {
    return this.currentStepIndex() === 0
      ? 'Vorheriger Step (nicht verfügbar)'
      : 'Vorheriger Step';
  }

  getNextAriaLabel(): string {
    return this.currentStepIndex() === this.totalSteps()! - 1
      ? 'Nächster Step (nicht verfügbar)'
      : 'Nächster Step';
  }
}
