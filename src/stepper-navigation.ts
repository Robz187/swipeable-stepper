import { Component, input, output, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cx-stepper-navigation',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="nav-controls">
      <button
        class="nav-arrow"
        [class.visually-disabled]="!canGoPrevious()"
        [attr.aria-label]="getPreviousAriaLabel()"
        [disabled]="!canGoPrevious()"
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
        [class.visually-disabled]="!canGoNext()"
        [attr.aria-label]="getNextAriaLabel()"
        [disabled]="!canGoNext()"
        (click)="next.emit()"
      >
        ›
      </button>
    </div>
  `,
  styleUrl: './main.scss',
})
export class CxStepperNavigationComponent {
  readonly currentStepIndex = input<number>(0);
  readonly totalSteps = input<number>(0);
  readonly progressPercentage = input.required<number>();
  readonly canGoPrevious = input<boolean>(false);
  readonly canGoNext = input<boolean>(false);
  readonly previous = output<void>();
  readonly next = output<void>();

  getPreviousAriaLabel(): string {
    return this.canGoPrevious()
      ? 'Vorheriger Step'
      : 'Vorheriger Step (nicht verfügbar)';
  }

  getNextAriaLabel(): string {
    return this.canGoNext()
      ? 'Nächster Step'
      : 'Nächster Step (nicht verfügbar)';
  }
}
