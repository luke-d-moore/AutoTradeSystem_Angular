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

      <div [formGroup]="orderForm">
        <label class="switch">
          <input type="checkbox" formControlName="useSpecificPrice">
          <span class="slider"></span>
        </label>
        <label>Use Specific Action Price</label>
      </div>

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
            <option [ngValue]="0">Buy</option>
            <option [ngValue]="1">Sell</option>
          </select>
        </div>
        <div class="form-field" *ngIf="!orderForm.get('useSpecificPrice')?.value">
          <label for="threshold">Threshold (%)</label>
          <input type="number" id="threshold" formControlName="threshold">
        </div>

        <div class="form-field" *ngIf="orderForm.get('useSpecificPrice')?.value">
          <label for="actionPrice">Action Price ($)</label>
          <input type="number" id="actionPrice" formControlName="actionPrice">
        </div>
        <div class="form-actions">
          <button type="submit" [disabled]="orderForm.invalid">Submit Order</button>
        </div>
      </form>
      <div *ngIf="errorMessage" class="error-message">
        {{errorMessage}}
      </div>
      <div *ngIf="successMessage" class="success-message">
        {{successMessage}}
      </div>
    </section>
  `,
  styleUrl: './order-form.component.css'
})
export class OrderFormComponent {
  orderForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private strategiesService: TradingStrategiesService
  ) {
    this.orderForm = this.fb.group({
      useSpecificPrice: [true],
      ticker: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      type: [0],
      threshold: [null, [Validators.required, Validators.min(0)]], 
      actionPrice: [null, [Validators.required, Validators.min(0)]],
    });

    this.orderForm.get('useSpecificPrice')?.valueChanges.subscribe(usePrice => {
      this.toggleFields(usePrice);
    });

    this.toggleFields(true);
  }

  private toggleFields(usePrice: boolean) {
    const priceCtrl = this.orderForm.get('actionPrice');
    const thresholdCtrl = this.orderForm.get('threshold');

    if (usePrice) {
      priceCtrl?.enable();
      thresholdCtrl?.disable();
      thresholdCtrl?.setValue(null);
    } else {
      thresholdCtrl?.enable();
      priceCtrl?.disable();
      priceCtrl?.setValue(null);
    }
  }

  handleSubmit(): void {
    if (this.orderForm.valid) {
      const formValues = this.orderForm.value;
      const newStrategy: Strategy = {
        Ticker: formValues.ticker,
        Quantity: formValues.amount,
        TradeAction: formValues.type,
        PriceChange: formValues.threshold ?? 0,
        ActionPrice: formValues.actionPrice ?? 0,
      };

      this.strategiesService.postStrategy(newStrategy).subscribe({
        next: (res) => {
          this.successMessage = `Strategy Submitted Successfully`;
          this.orderForm.reset({ type: 0, useSpecificPrice: true });
        },
        error: (err) => {
          this.errorMessage = `Failed to submit Strategy`;
        }
      });
    }
  }
}

