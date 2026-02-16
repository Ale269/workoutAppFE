import { Injectable } from '@angular/core';

/**
 * Tipi di feedback aptico disponibili.
 * Ogni tipo corrisponde a un pattern di vibrazione diverso.
 */
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Servizio centralizzato per il feedback aptico.
 *
 * - Android: usa la Vibration API nativa (`navigator.vibrate`)
 * - iOS: WebKit non supporta la Vibration API, ma un checkbox con
 *   attributo `switch` genera haptic feedback nativo quando viene
 *   togglato. Questo servizio crea un elemento invisibile, lo
 *   clicca programmaticamente, e poi lo rimuove.
 */
@Injectable({ providedIn: 'root' })
export class HapticService {

    /** Pattern di vibrazione per ogni tipo (in millisecondi) */
    private readonly patterns: Record<HapticType, number | number[]> = {
        light: 10,
        medium: 25,
        heavy: 50,
        success: [15, 80, 15],            // doppio tap
        warning: [10, 40, 10, 40, 10],    // triplo breve
        error: [50, 30, 80],            // vibrazione pesante
    };

    /**
     * Triggera feedback aptico del tipo specificato.
     * Sicuro da chiamare su qualsiasi piattaforma — se il dispositivo
     * non supporta né Vibration API né il fallback iOS, non fa nulla.
     */
    trigger(type: HapticType = 'light'): void {
        try {
            if (this.supportsVibration()) {
                navigator.vibrate(this.patterns[type]);
            } else {
                this.iosFallback();
            }
        } catch {
            // Silently ignore — haptic feedback is non-critical
        }
    }

    /** Controlla se il browser supporta la Vibration API */
    private supportsVibration(): boolean {
        return 'vibrate' in navigator && typeof navigator.vibrate === 'function';
    }

    /**
     * Fallback iOS: crea un checkbox con attributo `switch` invisibile
     * e clicca la label associata per triggerare haptic feedback nativo
     * di WebKit. L'elemento viene rimosso dopo un breve delay.
     */
    private iosFallback(): void {
        try {
            const wrapper = document.createElement('div');
            const id = 'haptic-' + Math.random().toString(36).slice(2);

            wrapper.innerHTML =
                `<input type="checkbox" id="${id}" switch />` +
                `<label for="${id}"></label>`;

            wrapper.setAttribute('style',
                'position:fixed;top:-9999px;left:-9999px;' +
                'opacity:0;pointer-events:none;visibility:hidden;'
            );

            document.body.appendChild(wrapper);

            const label = wrapper.querySelector('label');
            if (label) {
                label.click();
            }

            setTimeout(() => wrapper.remove(), 1000);
        } catch {
            // Silently ignore
        }
    }
}
