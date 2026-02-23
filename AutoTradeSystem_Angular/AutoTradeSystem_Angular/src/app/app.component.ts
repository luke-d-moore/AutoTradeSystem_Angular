import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderFormComponent } from './components/order-form/order-form.component';
import { OrdersTableComponent } from './components/orders-table/orders-table.component';
import { MarketPricesComponent } from './components/market-prices/market-prices.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, OrderFormComponent, OrdersTableComponent, MarketPricesComponent],
  template: `
  <div class="app-container">
    <div class="content-wrapper">
        <div class="left-section">
            <div class="content-wrapper main-form">
                <div class="left-section">
                  <app-order-form/>
                </div>
                <div class="right-section">
                  <app-market-prices/>
                </div>
            </div>
        </div>
        <div class="right-section">
          <app-orders-table/>
        </div>
    </div>
  </div>`
})
export class AppComponent {
  title = 'AutoTradeSystem';
}
