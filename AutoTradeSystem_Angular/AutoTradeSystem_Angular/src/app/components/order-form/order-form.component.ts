import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TradingStrategiesService, Strategy, PostStrategyResponse } from '../../services/tradingstrategy.service';
import { PriceService } from '../../services/price.service';
import { interval, switchMap, Subscription, startWith } from 'rxjs';
 

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class= "container">
    <section class="form-section">
      <h2>Submit Trading Strategy</h2>

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
          <select id="ticker" formControlName="ticker" required>
            <option value="">Select a ticker</option>
            <option *ngFor="let ticker of tickers" [value]="ticker">{{ticker}}</option>
          </select>
        </div>
        <div class="form-field">
          <label for="type">Trade Action</label>
          <select id="type" formControlName="type">
            <option [ngValue]="0">Buy</option>
            <option [ngValue]="1">Sell</option>
          </select>
        </div>
        <div class="form-field" *ngIf="orderForm.get('useSpecificPrice')?.value">
          <label for="actionPrice">Action Price ($)</label>
          <input type="number" id="actionPrice" formControlName="actionPrice">
        </div>
        <div class="form-field" *ngIf="!orderForm.get('useSpecificPrice')?.value">
          <label for="threshold">Price Change (%)</label>
          <input type="number" id="threshold" formControlName="threshold">
        </div>
        <div class="form-field">
          <label for="amount">Quantity</label>
          <input type="number" id="amount" formControlName="amount" required>
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
    </div>
  `,
  styleUrl: './order-form.component.css'
})
export class OrderFormComponent implements OnInit, OnDestroy {
  orderForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  tickers: string[] = [];
  private tickerSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private strategiesService: TradingStrategiesService,
    private priceService: PriceService
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

  ngOnInit(): void {
    this.tickerSubscription = interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.priceService.getTickers())
      )
      .subscribe({
        next: (tickers) => {
          this.tickers = tickers;
        },
        error: (err) => {
          console.error('Failed to load tickers:', err);
        }
      });
  }

  ngOnDestroy(): void {
    this.tickerSubscription?.unsubscribe();
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
          this.errorMessage = null;

          this.orderForm.reset({ type: 0, useSpecificPrice: true });

          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        },
        error: (err) => {
          this.errorMessage = `Failed to submit Strategy`;
          this.successMessage = null;
          setTimeout(() => {
            this.errorMessage = null;
          }, 3000);
        }
      });
    }
  }
}

