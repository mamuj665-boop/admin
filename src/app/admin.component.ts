import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  isLoggedIn = false;
  activeTab = 'dashboard';
  apiProducts: any[] = [];
  categories: any[] = [];

  email = ''; password = ''; error = ''; loading = false;

  showAddProduct = false; addLoading = false; addError = ''; addSuccess = '';
  newProduct = { title: '', description: '', categoryId: '', price: null as number | null, taxPercentage: 17, stock: 0, SKU: '', isActive: true };
  productImageFiles: File[] = [];

  showEditProduct = false; editLoading = false; editError = ''; editSuccess = '';
  editProduct: any = {}; editImageFiles: File[] = [];

  showAddCategory = false; catLoading = false; catError = ''; catSuccess = '';
  newCategory = { name: '', status: 'active' }; catImageFile: File | null = null;

  private readonly API = 'https://shopverse-ef695ae54309.herokuapp.com/api';
  private get h() { return { Authorization: `Bearer ${localStorage.getItem('token')}` }; }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    if (localStorage.getItem('token')) { this.isLoggedIn = true; this.loadAll(); }
  }

  loadAll() { this.loadProducts(); this.loadCategories(); }

  login() {
    this.error = '';
    if (!this.email || !this.password) { this.error = 'Fill all fields.'; return; }
    this.loading = true;
    this.http.post<{ token: string }>(`${this.API}/auth/login`, { email: this.email, password: this.password }).subscribe({
      next: (res) => { localStorage.setItem('token', res.token); this.isLoggedIn = true; this.loading = false; this.loadAll(); },
      error: (err) => { this.error = err?.error?.message || 'Invalid credentials.'; this.loading = false; }
    });
  }

  logout() { localStorage.removeItem('token'); this.isLoggedIn = false; this.email = ''; this.password = ''; }

  loadProducts() {
    this.http.get<any>(`${this.API}/products`, { headers: this.h }).subscribe({
      next: (res) => this.apiProducts = res.products ?? res, error: () => {}
    });
  }

  loadCategories() {
    this.http.get<any>(`${this.API}/categories/all`, { headers: this.h }).subscribe({
      next: (res) => this.categories = res.categories, error: () => {}
    });
  }

  onProductImages(e: Event) { const f = (e.target as HTMLInputElement).files; if (f) this.productImageFiles = Array.from(f); }
  onEditImages(e: Event) { const f = (e.target as HTMLInputElement).files; if (f) this.editImageFiles = Array.from(f); }
  onCatImage(e: Event) { const f = (e.target as HTMLInputElement).files?.[0]; if (f) this.catImageFile = f; }

  submitProduct() {
    this.addError = ''; this.addSuccess = '';
    if (!this.newProduct.title || !this.newProduct.categoryId || this.newProduct.price === null) { this.addError = 'Title, Category and Price required.'; return; }
    this.addLoading = true;
    const fd = new FormData();
    fd.append('title', this.newProduct.title); fd.append('description', this.newProduct.description);
    fd.append('categoryId', this.newProduct.categoryId); fd.append('price', String(this.newProduct.price));
    fd.append('taxPercentage', String(this.newProduct.taxPercentage)); fd.append('stock', String(this.newProduct.stock));
    if (this.newProduct.SKU) fd.append('SKU', this.newProduct.SKU);
    fd.append('isActive', String(this.newProduct.isActive));
    this.productImageFiles.forEach(f => fd.append('images', f));
    this.http.post(`${this.API}/products`, fd, { headers: this.h }).subscribe({
      next: () => { this.addSuccess = 'Product added!'; this.addLoading = false; this.newProduct = { title: '', description: '', categoryId: '', price: null, taxPercentage: 17, stock: 0, SKU: '', isActive: true }; this.productImageFiles = []; this.loadProducts(); setTimeout(() => { this.showAddProduct = false; this.addSuccess = ''; }, 1500); },
      error: (err) => { this.addError = err?.error?.message || 'Failed.'; this.addLoading = false; }
    });
  }

  openEditProduct(p: any) { this.editProduct = { ...p, categoryId: p.categoryId?._id ?? p.categoryId }; this.editImageFiles = []; this.editError = ''; this.editSuccess = ''; this.showEditProduct = true; }

  submitEditProduct() {
    this.editError = ''; this.editSuccess = ''; this.editLoading = true;
    const fd = new FormData();
    fd.append('title', this.editProduct.title); fd.append('description', this.editProduct.description ?? '');
    fd.append('categoryId', this.editProduct.categoryId); fd.append('price', String(this.editProduct.price));
    fd.append('taxPercentage', String(this.editProduct.taxPercentage)); fd.append('stock', String(this.editProduct.stock));
    if (this.editProduct.SKU) fd.append('SKU', this.editProduct.SKU);
    fd.append('isActive', String(this.editProduct.isActive));
    this.editImageFiles.forEach(f => fd.append('images', f));
    this.http.put(`${this.API}/products/${this.editProduct._id}`, fd, { headers: this.h }).subscribe({
      next: () => { this.editSuccess = 'Updated!'; this.editLoading = false; this.loadProducts(); setTimeout(() => { this.showEditProduct = false; this.editSuccess = ''; }, 1500); },
      error: (err) => { this.editError = err?.error?.message || 'Failed.'; this.editLoading = false; }
    });
  }

  deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return;
    this.http.delete(`${this.API}/products/${id}`, { headers: this.h }).subscribe({ next: () => this.loadProducts(), error: () => alert('Failed.') });
  }

  submitCategory() {
    this.catError = ''; this.catSuccess = '';
    if (!this.newCategory.name) { this.catError = 'Name required.'; return; }
    this.catLoading = true;
    const fd = new FormData();
    fd.append('name', this.newCategory.name); fd.append('status', this.newCategory.status);
    if (this.catImageFile) fd.append('image', this.catImageFile);
    this.http.post(`${this.API}/categories`, fd, { headers: this.h }).subscribe({
      next: () => { this.catSuccess = 'Category added!'; this.catLoading = false; this.newCategory = { name: '', status: 'active' }; this.catImageFile = null; this.loadCategories(); setTimeout(() => { this.showAddCategory = false; this.catSuccess = ''; }, 1500); },
      error: (err) => { this.catError = err?.error?.message || 'Failed.'; this.catLoading = false; }
    });
  }

  deleteCategory(id: string) {
    if (!confirm('Delete?')) return;
    this.http.delete(`${this.API}/categories/${id}`, { headers: this.h }).subscribe({ next: () => this.loadCategories(), error: () => alert('Failed.') });
  }
}
