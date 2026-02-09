import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CxTouchStepperComponent } from './stepper';
import { MatStepperModule } from '@angular/material/stepper';
import { EvaluationStep } from './evaluation.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CxTouchStepperComponent,
    MatStepperModule
  ],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class App {
  private fb = new FormBuilder();

  // Mock data - 10 steps
  readonly steps: EvaluationStep[] = this.generateMockSteps();

  // Forms for each step
  readonly stepForms = this.steps.map(() =>
    this.fb.group({
      evaluation: ['', Validators.required],
    })
  );

  private generateMockSteps(): EvaluationStep[] {
    const categories = [
      { title: 'WEGE ZUM UND IM HAUS', subtitle: 'Beleuchtung' },
      { title: 'ZUR UND IN DER WOHNUNG', subtitle: 'Zugang' },
      { title: 'ELEKTRIZITÄT', subtitle: 'Schadhafte oder defekte elektrische Geräte' },
      { title: 'TREPPEN', subtitle: 'Handlauf und Geländer' },
      { title: 'FUSSBODEN', subtitle: 'Rutschgefahr' },
      { title: 'MÖBEL', subtitle: 'Standfestigkeit' },
      { title: 'SANITÄR', subtitle: 'Badewanne/Dusche' },
      { title: 'KÜCHE', subtitle: 'Herdabsicherung' },
      { title: 'FENSTER', subtitle: 'Absturzsicherung' },
      { title: 'HEIZUNG', subtitle: 'Verbrennungsgefahr' },
      { title: 'WEGE ZUM UND IM HAUS', subtitle: 'Beleuchtung' },
      { title: 'ZUR UND IN DER WOHNUNG', subtitle: 'Zugang' },
      { title: 'ELEKTRIZITÄT', subtitle: 'Schadhafte oder defekte elektrische Geräte' },
      { title: 'TREPPEN', subtitle: 'Handlauf und Geländer' },
      { title: 'FUSSBODEN', subtitle: 'Rutschgefahr' },
      { title: 'MÖBEL', subtitle: 'Standfestigkeit' },
      { title: 'SANITÄR', subtitle: 'Badewanne/Dusche' },
      { title: 'KÜCHE', subtitle: 'Herdabsicherung' },
      { title: 'FENSTER', subtitle: 'Absturzsicherung' },
      { title: 'HEIZUNG', subtitle: 'Verbrennungsgefahr' },
      { title: 'WEGE ZUM UND IM HAUS', subtitle: 'Beleuchtung' },
      { title: 'ZUR UND IN DER WOHNUNG', subtitle: 'Zugang' },
      { title: 'ELEKTRIZITÄT', subtitle: 'Schadhafte oder defekte elektrische Geräte' },
      { title: 'TREPPEN', subtitle: 'Handlauf und Geländer' },
      { title: 'FUSSBODEN', subtitle: 'Rutschgefahr' },
      { title: 'MÖBEL', subtitle: 'Standfestigkeit' },
      { title: 'SANITÄR', subtitle: 'Badewanne/Dusche' },
      { title: 'KÜCHE', subtitle: 'Herdabsicherung' },
      { title: 'FENSTER', subtitle: 'Absturzsicherung' },
      { title: 'HEIZUNG', subtitle: 'Verbrennungsgefahr' },
      { title: 'WEGE ZUM UND IM HAUS', subtitle: 'Beleuchtung' },
      { title: 'ZUR UND IN DER WOHNUNG', subtitle: 'Zugang' },
      { title: 'ELEKTRIZITÄT', subtitle: 'Schadhafte oder defekte elektrische Geräte' },
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
