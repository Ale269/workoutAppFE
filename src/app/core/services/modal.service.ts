// modal.service.ts
import { Injectable, TemplateRef, signal } from '@angular/core';

export interface ModalConfig {
  title?: string;
  warning?: boolean;
  headerTemplate?: TemplateRef<any>;
  bodyTemplate?: TemplateRef<any>;
  footerCloseTemplate?: TemplateRef<any>;
  footerConfirmTemplate?: TemplateRef<any>;
  confirmText?: string;
  cancelText?: string;
  showConfirmButton?: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  modals = signal<ModalConfig[]>([]);

  open(config: ModalConfig) {
    const current = this.modals();
    this.modals.set([...current, config]);
    return config;
  }

  close(config: ModalConfig) {
    const current = this.modals();
    this.modals.set(current.filter(m => m !== config));
    if (config.onClose) config.onClose();
  }

  confirm(config: ModalConfig) {
    if (config.onConfirm) config.onConfirm();
    this.close(config);
  }
}