import { Directive, output, input } from '@angular/core';
import { TouchState } from './evaluation.models';

@Directive({
  selector: '[cxSwipeControl]',
  standalone: true,
  host: {
    '(touchstart)': 'onTouchStart($event)',
    '(touchend)': 'onTouchEnd($event)',
  },
})
export class CxSwipeControl {
  readonly swipeNext = output<void>();
  readonly swipePrev = output<void>();

  readonly cxSwipeControl = input<boolean>(true);
  readonly threshold = input<number>(50);
  readonly maxTime = input<number>(300);
  readonly excludeInteractive = input<boolean>(true);

  private touchState: TouchState | null = null;

  onTouchStart(event: TouchEvent): void {
    if (!this.cxSwipeControl()) return;
    if (
      this.excludeInteractive() &&
      this.isInteractiveElement(event.target as HTMLElement)
    ) {
      return;
    }

    const touch = event.touches[0];
    this.touchState = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    };
  }

  onTouchEnd(event: TouchEvent): void {
    if (!this.cxSwipeControl() || !this.touchState) return;

    const touch = event.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();

    const diffX = this.touchState.startX - endX;
    const diffY = this.touchState.startY - endY;
    const diffTime = endTime - this.touchState.startTime;

    this.touchState = null;

    const isHorizontal = Math.abs(diffX) > Math.abs(diffY);
    const isFastEnough = diffTime <= this.maxTime();
    const isLongEnough = Math.abs(diffX) > this.threshold();

    if (isHorizontal && isFastEnough && isLongEnough) {
      if (diffX > 0) {
        this.swipeNext.emit();
      } else {
        this.swipePrev.emit();
      }
    }
  }

  private isInteractiveElement(target: HTMLElement): boolean {
    const interactiveTags = ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT', 'A'];
    return interactiveTags.includes(target.tagName);
  }
}
