import { TradingStrategiesService } from '../../services/tradingstrategy.service';
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, timer, switchMap, catchError, of, NEVER } from 'rxjs';

interface Order {
  id: string;
  ticker: string;
  quantity: number;
  tradeaction: string;
  threshold: string;
}

@Component({
  selector: 'app-orders-table',
  standalone: true,
  imports:[CommonModule],
  template:
  `<div class= "container">
      <section class="orders-section">
        <h2>Current Trading Strategies</h2>
        <p *ngIf="lastUpdated" > Last updated: {{ lastUpdated | date: 'mediumTime' }}</p>
        <p *ngIf="error" style = "color: red;"> Error: {{ error }}</p>

        <ng-container *ngIf="!loading" >
          <table class="orders-table" >
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Quantity</th>
                <th>TradeAction</th>
                <th>Threshold(%)</th>
              </tr>
            </thead>
            <tbody>
            <tr
              *ngFor="let order of orders; let i = index"
              [class.even-row]="i % 2 === 0"
              [class.odd-row]="i % 2 !== 0">
                <td>{{order.ticker}}</td>
                <td>{{order.quantity}}</td>
                <td>{{order.tradeaction}}</td>
                <td>{{order.threshold}}</td>
              </tr>
            </tbody>
          </table>
        </ng-container>
        <div *ngIf="loading" >
          <p>Loading strategies...</p>
        </div>
      </section>
    </div>`,
  styleUrls: ['./orders-table.component.css']
})
export class OrdersTableComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  loading = true;
  error: string | null = null;
  lastUpdated: Date | null = null;
  private strategiesSubscription: Subscription | undefined;

  constructor(private strategiesService: TradingStrategiesService) { }

  ngOnInit(): void {
    this.strategiesSubscription = this.strategiesService.getStrategies().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
        this.lastUpdated = new Date();
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
        console.error(err);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.strategiesSubscription) {
      this.strategiesSubscription.unsubscribe();
    }
  }
}
