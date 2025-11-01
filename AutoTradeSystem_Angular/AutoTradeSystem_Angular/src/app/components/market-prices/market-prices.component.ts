import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriceService } from '../../services/price.service';
import { Subscription, timer, switchMap, catchError, of } from 'rxjs';

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
      @if (loading()) {
        <p>Loading market prices...</p>
      } @else if (error()) {
        <p class="error-message">Error fetching prices: {{ error() }}</p>
        <p class="no-data-message">Automatic retry in 5 seconds...</p>
      } @else {
        <!-- Display table when we have data and no current error -->
        @if (priceEntries().length > 0) {
          <table class="prices-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              @for (item of priceEntries(); track item[0]) {
                <tr>
                  <td>{{ item[0] }}</td>
                  <td>\${{ item[1] | number:'1.2-2' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      }
    </section>
  `,
  styleUrl: './market-prices.component.css'
})
export class MarketPricesComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;

  loading = signal(true);
  error = signal<string | null>(null);
  priceEntries = signal<[string, number][]>([]);

  constructor(private priceService: PriceService) { }

  ngOnInit(): void {
    const defaultPrices: PriceData = {};

    // The outer timer drives the polling interval
    this.subscription = timer(0, 5000).pipe(
      switchMap(() => {
        // Clear any previous error and set loading state before each new attempt
        this.error.set(null);
        this.loading.set(true);

        // This inner observable handles the API call and potential errors
        return this.priceService.getPrices().pipe(
          catchError(err => {
            // Set the error signal to display the error message
            this.error.set(err.message || 'Failed to retrieve prices');
            // Return the safe default value. The outer stream continues running.
            return of(defaultPrices);
          })
        );
      })
      // We subscribe here to process the emissions from the stream
    ).subscribe(data => {
      // This block executes for every successful response OR every default value returned after an error
      this.priceEntries.set(Object.entries(data));
      this.loading.set(false);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
