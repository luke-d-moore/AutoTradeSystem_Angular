import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriceService } from '../../services/price.service';
import { Observable, Subscription, timer, switchMap, catchError, of } from 'rxjs';

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
      } @else {
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
    </section>
  `,
  styleUrl: './market-prices.component.css'
})
export class MarketPricesComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;
  priceData$!: Observable<PriceData>;
  loading = signal(true);
  error = signal<string | null>(null);
  priceEntries = signal<[string, number][]>([]);

  constructor(private priceService: PriceService) { }

  ngOnInit(): void {
    this.priceData$ = timer(0, 5000).pipe(
      switchMap(() => this.priceService.getPrices()),
      catchError(err => {
        this.error.set(err.message);
        return of({});
      })
    );

    this.subscription = this.priceData$.subscribe(data => {
      this.priceEntries.set(Object.entries(data));
      this.loading.set(false);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
