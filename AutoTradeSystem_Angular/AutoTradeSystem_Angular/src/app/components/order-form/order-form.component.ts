import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Order } from '../../app.component';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="form-section">
      <h2>Place a New Order</h2>
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
    </section>
  `,
  styleUrl: './order-form.component.css'
})
export class OrderFormComponent {
  @Output() orderSubmitted = new EventEmitter<Omit<Order, 'id' | 'date'>>();
  orderForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.orderForm = this.fb.group({
      ticker: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      type: ['buy'],
      threshold: [null, [Validators.required, Validators.min(0)]],
    });
  }

  handleSubmit(): void {
    if (this.orderForm.valid) {
      this.orderSubmitted.emit(this.orderForm.value);
      this.orderForm.reset({ type: 'buy' }); // Reset the form with default 'buy' value
    }
  }
}
