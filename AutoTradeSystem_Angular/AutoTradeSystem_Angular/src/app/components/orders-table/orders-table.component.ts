import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../app.component';

@Component({
  selector: 'app-orders-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="orders-section">
      <h2>Current Trading Strategies</h2>
      @if (orders.length === 0) {
        <p>No orders have been placed yet.</p>
      } @else {
        <table class="orders-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Ticker</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Threshold (%)</th>
            </tr>
          </thead>
          <tbody>
            @for (order of orders; track order.id) {
              <tr [class]="orders.indexOf(order) % 2 === 0 ? 'even-row' : 'odd-row'">
                <td>{{ order.date }}</td>
                <td>{{ order.ticker }}</td>
                <td>{{ order.amount }}</td>
                <td>{{ order.type }}</td>
                <td>{{ order.threshold }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </section>
  `,
  styleUrl: './orders-table.component.css'
})
export class OrdersTableComponent {
  @Input() orders: Order[] = [];
}
