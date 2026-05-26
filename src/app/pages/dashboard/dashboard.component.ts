import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Dashboard</h2>
    <div class="stats-grid">
      <div class="stat-card">📦 Products<span>{{ stats.products }}</span></div>
      <div class="stat-card">📂 Categories<span>{{ stats.categories }}</span></div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats = { products: 0, categories: 0 };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any>('/products').subscribe(r => this.stats.products = (r.products ?? r).length);
    this.api.get<any>('/categories/all').subscribe(r => this.stats.categories = r.categories?.length ?? 0);
  }
}
