import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  loading = false;
  saving = false;
  showModal = false;
  submitted = false;
  form = { name: '', status: 'active' };
  imageFile: File | null = null;
  previewUrl: string | null = null;
  error = ''; success = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.get<any>('/categories/all').subscribe({
      next: r => { this.categories = r.categories; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openModal() {
    this.form = { name: '', status: 'active' };
    this.imageFile = null; this.previewUrl = null;
    this.error = ''; this.success = ''; this.submitted = false;
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.showModal = false;
    document.body.style.overflow = '';
  }

  onImage(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result as string;
    reader.readAsDataURL(file);
  }

  submit() {
    this.submitted = true;
    if (!this.form.name) return;
    this.saving = true; this.error = '';
    const fd = new FormData();
    fd.append('name', this.form.name);
    fd.append('status', this.form.status);
    if (this.imageFile) fd.append('image', this.imageFile);
    this.api.post('/categories', fd).subscribe({
      next: () => {
        this.success = 'Category added successfully!';
        this.saving = false;
        this.load();
        setTimeout(() => this.closeModal(), 1200);
      },
      error: (err) => { this.error = err?.error?.message || 'Failed to save.'; this.saving = false; }
    });
  }

  delete(id: string) {
    if (!confirm('Delete this category?')) return;
    this.api.delete(`/categories/${id}`).subscribe({ next: () => this.load() });
  }
}
