import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './orders.component.html'
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  loading = false;
  total = 0;
  page = 1;
  pages = 1;
  limit = 20;

  // filters
  filterStatus = '';
  filterPayment = '';

  // detail modal
  showDetail = false;
  detailOrder: any = null;
  detailLoading = false;

  // status update
  updatingId = '';
  newStatus = '';

  // refund
  refundingId = '';

  readonly orderStatuses = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  readonly paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    const params: string[] = [`page=${this.page}`, `limit=${this.limit}`];
    if (this.filterStatus) params.push(`status=${this.filterStatus}`);
    if (this.filterPayment) params.push(`paymentStatus=${this.filterPayment}`);
    this.api.get<any>(`/orders?${params.join('&')}`).subscribe({
      next: r => {
        this.orders = r.orders;
        this.total = r.total;
        this.pages = r.pages;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilters() { this.page = 1; this.load(); }

  clearFilters() { this.filterStatus = ''; this.filterPayment = ''; this.page = 1; this.load(); }

  goPage(p: number) { if (p < 1 || p > this.pages) return; this.page = p; this.load(); }

  openDetail(id: string) {
    this.detailLoading = true;
    this.showDetail = true;
    this.detailOrder = null;
    document.body.style.overflow = 'hidden';
    this.api.get<any>(`/orders/${id}`).subscribe({
      next: r => { this.detailOrder = r.order ?? r; this.detailLoading = false; },
      error: () => this.detailLoading = false
    });
  }

  closeDetail() { this.showDetail = false; this.detailOrder = null; document.body.style.overflow = ''; }

  updateStatus(orderId: string, status: string) {
    if (!status) return;
    this.updatingId = orderId;
    this.api.put(`/orders/${orderId}/status`, { orderStatus: status }).subscribe({
      next: () => {
        this.updatingId = '';
        // update in list
        const o = this.orders.find(x => x._id === orderId);
        if (o) o.orderStatus = status;
        // update in detail modal if open
        if (this.detailOrder?._id === orderId) this.detailOrder.orderStatus = status;
      },
      error: () => this.updatingId = ''
    });
  }

  refund(orderId: string) {
    if (!confirm('Process refund for this order?')) return;
    this.refundingId = orderId;
    this.api.post(`/orders/${orderId}/refund`, {}).subscribe({
      next: () => {
        this.refundingId = '';
        const o = this.orders.find(x => x._id === orderId);
        if (o) o.paymentStatus = 'refunded';
        if (this.detailOrder?._id === orderId) this.detailOrder.paymentStatus = 'refunded';
      },
      error: () => this.refundingId = ''
    });
  }

  get pageNumbers(): number[] {
    const range: number[] = [];
    const start = Math.max(1, this.page - 2);
    const end = Math.min(this.pages, this.page + 2);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  orderStatusColor(s: string) {
    return { processing: 'badge-warning', confirmed: 'badge-info', shipped: 'badge-primary', delivered: 'badge-success', cancelled: 'badge-danger' }[s] ?? '';
  }

  paymentStatusColor(s: string) {
    return { pending: 'badge-warning', paid: 'badge-success', failed: 'badge-danger', refunded: 'badge-info' }[s] ?? '';
  }
}
