import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, timer, of, throwError } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';


interface StrategyApiResponse {
  success: boolean;
  message?: string;
  TradingStrategies?: {
    [key: string]: {
      TradingStrategy: {
        Ticker: string;
        Quantity: number;
        TradeAction: number;
      };
      OriginalPrice: number;
      ActionPrice: number;
    };
  };
}

interface Order {
  id: string;
  ticker: string;
  quantity: number;
  tradeaction: string;
  threshold: string;
}

@Injectable({
  providedIn: 'root'
})
export class TradingStrategiesService {
  private readonly API_URL = 'https://localhost:7158/api/TradingStrategy';
  private readonly POLLING_INTERVAL = 5000;

  constructor(private http: HttpClient) { }

  getStrategies(): Observable<Order[]> {
    return timer(0, this.POLLING_INTERVAL).pipe(
      switchMap(() => this.http.get<StrategyApiResponse>(this.API_URL)),
      map(response => {
        // Handle cases where the API returns a response but the strategies are null, undefined, or an empty object
        if (!response.success || !response.TradingStrategies || Object.keys(response.TradingStrategies).length === 0) {
          return []; // Return an empty array if no strategies are found
        }

        return Object.entries(response.TradingStrategies).map(([id, strategyDetails]) => {
          const strategy = strategyDetails.TradingStrategy;
          const originalPrice = strategyDetails.OriginalPrice;
          const threshold = originalPrice > 0
            ? (((strategyDetails.ActionPrice - originalPrice) / originalPrice) * 100).toFixed(2) + '%'
            : 'N/A';

          return {
            id: id,
            ticker: strategy.Ticker,
            quantity: strategy.Quantity,
            tradeaction: strategy.TradeAction === 0 ? 'Buy' : 'Sell',
            threshold: threshold,
          };
        });
      }),
      // Use catchError to handle any HTTP errors or map-related errors
      catchError((error: HttpErrorResponse) => {
        console.error('An error occurred during API call:', error);
        return of([]); // Return an empty observable array to prevent the stream from breaking
      })
    );
  }
}
