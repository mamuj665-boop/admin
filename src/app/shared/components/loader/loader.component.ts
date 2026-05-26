import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `<div *ngIf="loading" class="loader-overlay"><div class="spinner"></div></div>`,
  styles: [`
    .loader-overlay { position:fixed; inset:0; background:rgba(0,0,0,.3); display:grid; place-items:center; z-index:9999; }
    .spinner { width:40px; height:40px; border:4px solid #fff; border-top-color:#3b82f6; border-radius:50%; animation:spin .7s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
  `]
})
export class LoaderComponent {
  @Input() loading = false;
}
