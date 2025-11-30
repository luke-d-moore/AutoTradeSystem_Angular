import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriceService } from '../../services/price.service';
import { Subscription, timer, switchMap, catchError, of, NEVER } from 'rxjs';

export interface PriceData {
  [ticker: string]: number;
}

@Component({
  selector: 'app-market-prices',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="prices-section">
      <h2>Live Market Prices</h2>
      @if (error()) {
        <p class="error-message">Error getting latest prices</p>
        <p class="no-data-message">Automatic retry in 5 seconds</p>
      }
          <p *ngIf="lastUpdated" > Last updated: {{ lastUpdated | date: 'mediumTime' }}</p>
          <table class="prices-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              @for (item of priceEntries(); track item[0]; let i = $index) {
                <tr
                  [class.even-row]="i % 2 === 0"
                  [class.odd-row]="i % 2 !== 0">
                  <td>{{ item[0] }}</td>
                  <td>\${{ item[1] | number:'1.2-2' }}</td>
                </tr>
              }
            </tbody>
          </table>
    </section>
  `,
  styleUrl: './market-prices.component.css'
})
export class MarketPricesComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;

  error = signal<string | null>(null);
  priceEntries = signal<[string, number][]>([]);
  lastUpdated: Date | null = null;

  constructor(private priceService: PriceService) { }

  ngOnInit(): void {
    const defaultPrices: PriceData = {};

    // The outer timer drives the polling interval
    this.subscription = timer(0, 5000).pipe(
      switchMap(() => {
        // Clear any previous error and set loading state before each new attempt
        this.error.set(null);

        // This inner observable handles the API call and potential errors
        return this.priceService.getPrices().pipe(
          catchError(err => {
            // Set the error signal to display the error message
            this.error.set(err.message || 'Failed to retrieve prices');
            console.log(err.message);
            // Return the safe default value. The outer stream continues running.
            return NEVER;
          })
        );
      })
      // We subscribe here to process the emissions from the stream
    ).subscribe(data => {
      // This block executes for every successful response OR every default value returned after an error
      this.priceEntries.set(Object.entries(data));
      this.lastUpdated = new Date();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
