/**
 * @license
 * MIT License
 *
 * Copyright (c) 2025 CWOIDA
 *
 * This directive is part of CNGX (Composable Angular Extension), an open-source
 * framework for Angular extensions.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

import {
  Component,
  computed,
  signal,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EvaluationStep } from './evaluation.models';
import { fromEvent } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs/operators';
import { CxStepperComponent } from './stepper';
import { MatStepperModule } from '@angular/material/stepper';
// Main Component
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CxStepperComponent, MatStepperModule],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class App {
  @ViewChild('contentArea', { read: ElementRef }) contentArea!: ElementRef;
  private fb = new FormBuilder();

  // Signals
  readonly selectedFileName = signal<string>('');
  readonly isMobile = toSignal(
    fromEvent(window, 'resize').pipe(
      startWith(null),
      map(() => {
        const mobile = window.innerWidth <= 990;
        console.log('📱 Window width:', window.innerWidth, 'isMobile:', mobile);
        return mobile;
      })
    ),
    { initialValue: window.innerWidth <= 990 }
  );
  // Mock data - 30 steps
  readonly steps: EvaluationStep[] = this.generateMockSteps();

  // Forms for each step
  readonly stepForms = this.steps.map(() =>
    this.fb.group({
      evaluation: ['', Validators.required],
    })
  );

  // Global form
  readonly globalForm = this.fb.group({
    comment: ['', [Validators.required, Validators.maxLength(250)]],
    file: [null as File | null],
  });

  readonly commentLength = computed(
    () => this.globalForm.get('comment')?.value?.length || 0
  );

  // File handling
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.globalForm.patchValue({ file });
      this.selectedFileName.set(file.name);
    }
  }

  // Actions
  onSave(): void {
    const allValid =
      this.stepForms.every((form) => form.valid) && this.globalForm.valid;

    if (allValid) {
      const result = {
        steps: this.stepForms.map((form) => form.value),
        global: this.globalForm.value,
      };
      console.log('Evaluation saved:', result);
      alert('Evaluierung gespeichert!');
    } else {
      this.stepForms.forEach((form) => form.markAllAsTouched());
      this.globalForm.markAllAsTouched();
      alert('Bitte füllen Sie alle Pflichtfelder aus.');
    }
  }

  onCancel(): void {
    if (
      confirm('Möchten Sie wirklich abbrechen? Alle Änderungen gehen verloren.')
    ) {
      console.log('Evaluation cancelled');
    }
  }

  // Mock data generator
  private generateMockSteps(): EvaluationStep[] {
    const categories = [
      { title: 'WEGE ZUM UND IM HAUS', subtitle: 'Beleuchtung' },
      { title: 'ZUR UND IN DER WOHNUNG', subtitle: 'Zugang' },
      {
        title: 'ELEKTRIZITÄT',
        subtitle: 'Schadhafte oder defekte elektrische Geräte',
      },
      { title: 'TREPPEN', subtitle: 'Handlauf und Geländer' },
      { title: 'FUSSBODEN', subtitle: 'Rutschgefahr' },
      { title: 'MÖBEL', subtitle: 'Standfestigkeit' },
      { title: 'SANITÄR', subtitle: 'Badewanne/Dusche' },
      { title: 'KÜCHE', subtitle: 'Herdabsicherung' },
      { title: 'FENSTER', subtitle: 'Absturzsicherung' },
      { title: 'HEIZUNG', subtitle: 'Verbrennungsgefahr' },
    ];

    return Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      title: categories[i % categories.length].title,
      subtitle: categories[i % categories.length].subtitle,
    }));
  }
}

bootstrapApplication(App);
