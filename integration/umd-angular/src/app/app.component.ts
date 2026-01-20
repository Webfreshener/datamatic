import { Component, OnDestroy, OnInit } from '@angular/core';
import * as datamatic from 'datamatic';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Datamatic Angular Integration';
  data: string[] = [];
  errorMessage = '';
  items: string[] = ['alpha', 'beta', 'gamma'];
  newItem = '';
  private tx: any;
  private subscription: { unsubscribe?: () => void } | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.tx = new datamatic.Pipeline({
      type: 'array',
      items: {
        type: 'string'
      }
    });

    this.subscription = this.tx.subscribe({
      next: (data: string[]) => {
        this.data = Array.isArray(data) ? data : [];
      },
      error: (error: unknown) => {
        this.errorMessage = `${error ?? 'Unknown error'}`;
      }
    });

    this.runSample();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe?.();
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  addItem() {
    const value = this.newItem.trim();
    if (!value) {
      return;
    }
    this.items = [...this.items, value];
    this.newItem = '';
    this.runSample();
  }

  removeItem(index: number) {
    this.items = this.items.filter((_, i) => i !== index);
    this.runSample();
  }

  runSample() {
    this.errorMessage = '';
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.data = [];
    let index = 0;
    let current: string[] = [];
    this.intervalId = setInterval(() => {
      if (index >= this.items.length) {
        if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }
        return;
      }
      current = current.concat(this.items[index]);
      this.tx.write(current);
      index += 1;
    }, 600);
  }
}
