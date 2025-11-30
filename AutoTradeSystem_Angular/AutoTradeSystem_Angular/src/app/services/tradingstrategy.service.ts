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

export interface Strategy {
  Ticker: string;
  Quantity: number;
  TradeAction: number;
  PriceChange: number;
}

export interface PostStrategyResponse {
  success: boolean;
  message: string;
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
        if (!response.success || !response.TradingStrategies || Object.keys(response.TradingStrategies).length === 0) {
          return [];
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
      catchError((error: HttpErrorResponse) => {
        console.error('An error occurred during API call:', error);
        return of([]);
      })
    );
  }

  deleteStrategy(id: string): Observable<any> {
    const deleteUrl = `${this.API_URL}/${id}`;
    return this.http.delete(deleteUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Error deleting strategy with ID ${id}:`, error);
        return of(null);
      })
    );
  }

  postStrategy(strategy: Strategy): Observable<PostStrategyResponse> {
    return this.http.post<PostStrategyResponse>(this.API_URL, strategy).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Strategy submission failed on server.');
        }
        return response;
      }),
      catchError((error: HttpErrorResponse | Error) => {
        console.error('An error occurred during API POST call:', error);
        const userMessage = (error instanceof HttpErrorResponse)
          ? 'Network error occurred.'
          : error.message;
        return throwError(() => new Error(userMessage));
      })
    );
  }
}
