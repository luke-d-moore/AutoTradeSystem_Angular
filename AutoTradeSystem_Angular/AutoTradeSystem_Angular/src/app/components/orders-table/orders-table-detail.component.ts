import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trading-strategy-edit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      @if (order) {
        <div>IMPORTANT NOTE PAGE STILL UNDER CONSTRUCTION, BUT HERE ARE SOME DETAILS ABOUT THE STRATEGY YOU CLICKED ON</div>
        <div>
          <h3>Strategy Details</h3>
        </div>
        <div>
          <h3>Ticker : {{ order.ticker }}</h3>
        </div>
        <div>
          <h3>Action Price ($) : {{ order.actionPrice }}</h3>
        </div>
        <div>
          <h3>Quantity : {{ order.quantity }}</h3>
        </div>
        <div>
          <h3>Trade Action : {{ order.tradeaction }}</h3>
        </div>
        <div>
          <h3>Threshold (%) : {{ order.threshold }}</h3>
        </div>
      } @else {
        <div>No order data found</div>
      }
    </section>
  `,
  styleUrls: ['./orders-table-detail.component.css']
})
export class TradingStrategyEditView implements OnInit {
  order: any;

  ngOnInit() {
    this.order = history.state?.order;

    if (!this.order) {
      console.warn('No order data found in state');
    }
  }
}
