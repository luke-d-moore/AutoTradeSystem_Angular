import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketPricesComponent } from '../market-prices/market-prices.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, MarketPricesComponent],
  template: `
    <div class="container">
      <ng-content></ng-content>
    </div>
    <div class="container">
      <app-market-prices></app-market-prices>
    </div>
  `,
  styleUrl: './layout.component.css'
})
export class LayoutComponent { }
