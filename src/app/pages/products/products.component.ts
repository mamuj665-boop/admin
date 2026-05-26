import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

const EMPTY = () => ({ title: '', description: '', categoryId: '', price: null as number | null, taxPercentage: 17, stock: 0, SKU: '', isActive: true });

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './products.component.html'
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  loading = false;
  saving = false;
  showModal = false;
  editMode = false;
  editId = '';
  submitted = false;
  form = EMPTY();
  imageFiles: File[] = [];
  previewUrls: string[] = [];
  error = ''; success = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.loadProducts(); this.loadCategories(); }

  loadProducts() {
    this.loading = true;
    this.api.get<any>('/products').subscribe({
      next: r => { this.products = r.products ?? r; this.loading = false; },
      error: () => this.loading = false
    });
  }

  loadCategories() {
    this.api.get<any>('/categories/all').subscribe({ next: r => this.categories = r.categories });
  }

  openModal() {
    this.form = EMPTY(); this.imageFiles = []; this.previewUrls = [];
    this.editMode = false; this.editId = '';
    this.error = ''; this.success = ''; this.submitted = false;
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  openEdit(p: any) {
    this.form = { ...p, categoryId: p.categoryId?._id ?? p.categoryId };
    this.editId = p._id; this.editMode = true;
    this.imageFiles = []; this.previewUrls = p.images ?? [];
    this.error = ''; this.success = ''; this.submitted = false;
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.showModal = false;
    document.body.style.overflow = '';
  }

  onImages(e: Event) {
    const files = Array.from((e.target as HTMLInputElement).files ?? []);
    this.imageFiles = files;
    this.previewUrls = [];
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = () => this.previewUrls.push(reader.result as string);
      reader.readAsDataURL(f);
    });
  }

  submit() {
    this.submitted = true;
    if (!this.form.title || !this.form.categoryId || this.form.price === null) return;
    this.saving = true; this.error = '';
    const fd = new FormData();
    Object.entries(this.form).forEach(([k, v]) => fd.append(k, String(v)));
    this.imageFiles.forEach(f => fd.append('images', f));
    const req = this.editMode
      ? this.api.put(`/products/${this.editId}`, fd)
      : this.api.post('/products', fd);
    req.subscribe({
      next: () => {
        this.success = this.editMode ? 'Product updated!' : 'Product added!';
        this.saving = false;
        this.loadProducts();
        setTimeout(() => this.closeModal(), 1200);
      },
      error: (err) => { this.error = err?.error?.message || 'Failed to save.'; this.saving = false; }
    });
  }

  delete(id: string) {
    if (!confirm('Delete this product?')) return;
    this.api.delete(`/products/${id}`).subscribe({ next: () => this.loadProducts() });
  }
}
