import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detail-view',
  standalone: true,
  template: `
    <section>
        <div>IMPORTANT NOTE PAGE STILL UNDER CONSTRUCTION, BUT HERE ARE SOME DETAILS ABOUT THE LIVE MARKET PRICE YOU CLICKED ON</div>
        <div>
            <h3>Details for ticker</h3>
        </div>
    </section>
  `,
  styleUrls: ['./market-prices-detail.component.css']
})
export class DetailViewComponent {
  private route = inject(ActivatedRoute);

  ticker = this.route.snapshot.paramMap.get('ticker');
}
