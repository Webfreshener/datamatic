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
  private tx: any;
  private subscription: { unsubscribe?: () => void } | null = null;

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
  }

  runSample() {
    this.errorMessage = '';
    this.tx.write(['alpha', 'beta', 'gamma']);
  }
}
