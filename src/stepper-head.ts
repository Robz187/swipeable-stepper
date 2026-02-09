import {
  Component,
  input,
  output,
  computed,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
export interface StepNavItem {
  type: 'step' | 'dots';
  step?: number;
}

export interface StepData {
  id: number;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'cx-stepper-head',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <details
      class="progress-details"
      [open]="stepsVisible()"
      (toggle)="onDetailsToggle($event)"
    >
      <summary class="progress-summary">
        <div class="progress-header">
          <span class="progress-text" aria-live="polite">
            Step {{ currentStep() }}/{{ totalSteps() }} ({{ progressPercentage() }}%)
          </span>
          <span class="summary-marker" aria-hidden="true">▼</span>
        </div>

        <!-- Native Progress Bar -->
        <progress
          class="progress-bar"
          [value]="progressPercentage()"
          max="100"
          [attr.aria-label]="'Fortschritt ' + progressPercentage() + ' Prozent'"
        >
          {{ progressPercentage() }}%
        </progress>

        <div class="tap-hint" aria-hidden="true">
          {{ stepsVisible() ? 'Steps ausblenden' : 'Steps anzeigen' }}
        </div>
      </summary>

      <!-- Step Navigation (collapsible via details) -->
      <nav
        class="step-navigation"
        role="navigation"
        aria-label="Schrittnavigation"
      >
        @for (item of visibleSteps(); track item.step ?? 'dots' + $index) {
          @if (item.type === 'step') {
            <button
              class="step-circle"
              [class.completed]="isStepCompleted(item.step!)"
              [class.active]="isStepActive(item.step!)"
              [class.pending]="!isStepCompleted(item.step!) && !isStepActive(item.step!)"
              [attr.aria-label]="getStepAriaLabel(item.step!)"
              [attr.aria-current]="isStepActive(item.step!) ? 'step' : null"
              (click)="stepClick.emit(item.step!)"
            >
              {{ getStepLabel(item.step!) }}
            </button>
          } @else {
            <button
              class="step-dots"
              (click)="openDialog()"
              aria-label="Alle Steps anzeigen"
            >
              ...
            </button>
          }
        }
      </nav>
    </details>

    <!-- Dialog for all steps overview -->
    <dialog
      #stepOverviewDialog
      class="step-overview-dialog"
      (click)="onDialogBackdropClick($event)"
      aria-labelledby="modal-title"
    >
      <div class="dialog-content-wrapper">
        <div class="modal-header">
          <h3 id="modal-title">Alle Steps</h3>
          <button
            class="close-btn"
            (click)="closeDialog()"
            aria-label="Modal schließen"
          >
            <!-- Material Icon or Input -->
            ✕
          </button>
        </div>
        
        <div class="step-grid" role="grid" aria-label="Step Übersicht">
          @for (step of allSteps(); track step.id; let idx = $index) {
            <button
              class="step-grid-item"
              [class.completed]="isStepCompleted(idx)"
              [class.active]="isStepActive(idx)"
              [class.pending]="!isStepCompleted(idx) && !isStepActive(idx)"
              [attr.aria-label]="getDialogStepAriaLabel(step, idx)"
              (click)="onDialogStepClick(idx)"
            >
            <!-- Material Icon or Input -->
              {{ isStepCompleted(idx) ? '✓' : (idx + 1) }}
            </button>
          }
        </div>
        
        <button
          class="modal-close-btn"
          (click)="closeDialog()"
          aria-label="Modal schließen"
        >
          Schließen
        </button>
      </div>
    </dialog>
  `,
  styleUrl: './main.scss',
})
export class CxStepperHeadComponent {
  @ViewChild('stepOverviewDialog') stepOverviewDialog!: ElementRef<HTMLDialogElement>;

  readonly currentStep = input<number>(1);
  readonly totalSteps = input<number>(0);
  readonly progressPercentage = input.required<number>();
  readonly stepsVisible = input<boolean>(false);
  readonly visibleSteps = input<StepNavItem[]>([]);
  readonly allSteps = input.required<StepData[]>();
  readonly linear = input<boolean>(false);
  readonly selectedIndex = input<number>(0);

  // Current step index (0-based for internal logic)
  readonly currentStepIndex = computed(() => {
    const step = this.currentStep();
    return step ? step - 1 : 0;
  });

  readonly stepsVisibleChange = output<boolean>();
  readonly stepClick = output<number>();

  onDetailsToggle(event: Event): void {
    const details = event.target as HTMLDetailsElement;
    this.stepsVisibleChange.emit(details.open);
  }

  openDialog(): void {
    this.stepOverviewDialog?.nativeElement.showModal();
  }

  closeDialog(): void {
    this.stepOverviewDialog?.nativeElement.close();
  }

  onDialogBackdropClick(event: MouseEvent): void {
    const dialog = event.target as HTMLDialogElement;
    const rect = dialog.getBoundingClientRect();
    const clickedInDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;

    if (!clickedInDialog) {
      this.closeDialog();
    }
  }

  onDialogStepClick(stepIndex: number): void {
    this.stepClick.emit(stepIndex);
    this.closeDialog();
  }

  isStepCompleted(stepIndex: number): boolean {
    return stepIndex < this.currentStepIndex();
  }

  isStepActive(stepIndex: number): boolean {
    return stepIndex === this.currentStepIndex();
  }

  getStepLabel(stepIndex: number): string {
    return this.isStepCompleted(stepIndex) ? '✓' : (stepIndex + 1).toString();
  }

  getStepAriaLabel(stepIndex: number): string {
    const stepNum = stepIndex + 1;
    const status = this.isStepCompleted(stepIndex)
      ? 'abgeschlossen'
      : this.isStepActive(stepIndex)
      ? 'aktuell'
      : 'ausstehend';

    return `Step ${stepNum} von ${this.totalSteps()}, ${status}`;
  }

  getDialogStepAriaLabel(step: StepData, stepIndex: number): string {
    const stepNum = stepIndex + 1;
    const status = this.isStepCompleted(stepIndex)
      ? 'abgeschlossen'
      : this.isStepActive(stepIndex)
      ? 'aktuell'
      : 'ausstehend';

    return `Step ${stepNum}: ${step.title}, ${status}`;
  }
}
