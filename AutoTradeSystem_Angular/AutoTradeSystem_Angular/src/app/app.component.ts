import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './components/layout/layout.component';
import { OrderFormComponent } from './components/order-form/order-form.component';
import { OrdersTableComponent } from './components/orders-table/orders-table.component';

export interface Order {
  id: number;
  date: string;
  ticker: string;
  amount: number;
  type: 'buy' | 'sell';
  threshold: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LayoutComponent, OrderFormComponent, OrdersTableComponent],
  template: `
    <app-layout>
      <h1>AutoTradeSystem</h1>
      <app-order-form (orderSubmitted)="handleNewOrder($event)"></app-order-form>
      <app-orders-table></app-orders-table>
    </app-layout>`,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'AutoTradeSystem';
  orders: Order[] = [];

  handleNewOrder(newOrder: Omit<Order, 'id' | 'date'>): void {
    const orderWithDetails = {
      ...newOrder,
      id: Date.now(),
      date: new Date().toLocaleString(),
    };
    this.orders = [...this.orders, orderWithDetails];
  }
}
