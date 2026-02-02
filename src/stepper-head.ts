import {
  Component,
  input,
  output,
  computed,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
export interface StepNavItem {
  type: 'step' | 'dots';
  step?: number;
}

@Component({
  selector: 'cx-stepper-head',
  standalone: true,
  imports: [CommonModule],
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
  @ViewChild('stepOverviewDialog')
  stepOverviewDialog!: ElementRef<HTMLDialogElement>;

  // === INPUTS (Data from parent) ===
  readonly currentStep = input<number>();
  readonly totalSteps = input<number>();
  readonly progressPercentage = input.required<number>();
  readonly stepsVisible = input<boolean>(false);
  readonly visibleSteps = input<StepNavItem[]>([]);

  // NEW: Full steps array for dialog
  readonly allSteps = input.required<any[]>();

  // Current step index (0-based for internal logic)
  readonly currentStepIndex = computed(() => this.currentStep()! - 1);

  // === OUTPUTS (Events to parent) ===
  readonly stepsVisibleChange = output<boolean>();
  readonly stepClick = output<number>();

  // === DETAILS METHODS ===

  onDetailsToggle(event: Event): void {
    const details = event.target as HTMLDetailsElement;
    this.stepsVisibleChange.emit(details.open);
  }

  // === DIALOG METHODS ===

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

  // === SHARED HELPER METHODS ===

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

  getDialogStepAriaLabel(step: any, stepIndex: number): string {
    const stepNum = stepIndex + 1;
    const status = this.isStepCompleted(stepIndex)
      ? 'abgeschlossen'
      : this.isStepActive(stepIndex)
      ? 'aktuell'
      : 'ausstehend';

    return `Step ${stepNum}: ${step.title}, ${status}`;
  }
}
