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
  <div class="container">
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
                  <td>\${{ item[1] | number:'1.2-2' }}
                  @let diff = getPriceDiff(item[0], item[1]);
                  @if (diff !== null) {
                  (<span [ngClass]="{'price-up': diff > 0, 'price-down': diff < 0}">
                    {{ diff > 0 ? '+' : '' }}{{ diff | number:'1.2-2' }}
                  </span>)
                }
                  </td>
                </tr>
              }
            </tbody>
          </table>
    </section>
    </div>
  `,
  styleUrl: './market-prices.component.css'
})
export class MarketPricesComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;

  error = signal<string | null>(null);
  priceEntries = signal<[string, number][]>([]);
  previousPrices = signal<PriceData>({});
  lastUpdated: Date | null = null;

  constructor(private priceService: PriceService) { }

  ngOnInit(): void {
    const defaultPrices: PriceData = {};

    this.subscription = timer(0, 5000).pipe(
      switchMap(() => {
        this.error.set(null);

        return this.priceService.getPrices().pipe(
          catchError(err => {
            this.error.set(err.message || 'Failed to retrieve prices');
            console.log(err.message);
            return NEVER;
          })
        );
      })
    ).subscribe(data => {
      const currentEntriesObj = Object.fromEntries(this.priceEntries());
      const hasChanged = JSON.stringify(currentEntriesObj) !== JSON.stringify(data);
      if (hasChanged) {
        this.previousPrices.set(currentEntriesObj);
        this.priceEntries.set(Object.entries(data));
      }
      this.lastUpdated = new Date();
    });
  }

    getPriceDiff(ticker: string, currentPrice: number): number | null {
      const prev = this.previousPrices()[ticker];
      if (prev === undefined || prev === currentPrice) return null;
      return currentPrice - prev;
    }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
