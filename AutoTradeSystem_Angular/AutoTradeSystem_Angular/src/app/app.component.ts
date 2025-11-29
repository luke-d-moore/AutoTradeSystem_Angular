import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './components/layout/layout.component';
import { OrderFormComponent } from './components/order-form/order-form.component';
import { OrdersTableComponent } from './components/orders-table/orders-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LayoutComponent, OrderFormComponent, OrdersTableComponent],
  template: `
    <app-layout>
      <h1>AutoTradeSystem</h1>
      <app-order-form/>
      <app-orders-table/>
    </app-layout>`
})
export class AppComponent {
  title = 'AutoTradeSystem';
}
