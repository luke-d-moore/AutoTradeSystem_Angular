import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TradingStrategiesService, Strategy, PostStrategyResponse } from '../../services/tradingstrategy.service';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="form-section">
      <h2>Add New Trading Strategy</h2>
      <form [formGroup]="orderForm" (ngSubmit)="handleSubmit()" class="order-form">
        <div class="form-field">
          <label for="ticker">Ticker</label>
          <input type="text" id="ticker" formControlName="ticker" required>
        </div>
        <div class="form-field">
          <label for="amount">Amount</label>
          <input type="number" id="amount" formControlName="amount" required>
        </div>
        <div class="form-field">
          <label for="type">Type</label>
          <select id="type" formControlName="type">
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        <div class="form-field">
          <label for="threshold">Threshold (%)</label>
          <input type="number" id="threshold" formControlName="threshold" required>
        </div>
        <div class="form-actions">
          <button type="submit" [disabled]="orderForm.invalid">Submit Order</button>
        </div>
      </form>
      <div *ngIf="errorMessage" class="error-message">
        {{errorMessage}}
      </div>
    </section>
  `,
  styleUrl: './order-form.component.css'
})
export class OrderFormComponent {
  orderForm: FormGroup;
  errorMessage: string | null = null; 

  constructor(
    private fb: FormBuilder,
    private strategiesService: TradingStrategiesService
  ) {
    this.orderForm = this.fb.group({
      ticker: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      type: ['buy'],
      threshold: [null, [Validators.required, Validators.min(0)]],
    });
  }

  handleSubmit(): void {
    if (this.orderForm.valid) {
      this.errorMessage = null; 
      const formValues = this.orderForm.value;

      const newStrategy: Strategy = {
        Ticker: formValues.ticker,
        Quantity: formValues.amount, 
        TradeAction: formValues.type === 'buy' ? 0 : 1,
        PriceChange: formValues.threshold,
      };

      this.strategiesService.postStrategy(newStrategy).subscribe({
        next: (response) => {
          console.log('Post successful:', response)
          this.orderForm.reset({ type: 'buy' })
        },
        error: (err) => {
          console.error('Post failed:', err.message)
          this.errorMessage = `Failed to submit Strategy`;
        },
      });      
    }
  }
}
