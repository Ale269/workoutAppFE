import { Injectable } from '@angular/core';

/**
 * Tipi di feedback aptico disponibili.
 * Ogni tipo corrisponde a un pattern di vibrazione diverso.
 */
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * INTERRUTTORE DIAGNOSTICO — feedback aptico disattivato in tutta l'app.
 *
 * Spento alla sorgente in tre punti soli (qui, HapticSwitchDirective,
 * AppComponent.ngOnInit) invece che nelle ~130 chiamate sparse nei
 * componenti: il risultato è identico e si torna indietro rimettendo
 * questa costante a `false`.
 *
 * Motivo: verificare se il blocco di ~650ms alla chiusura degli overlay
 * su Safari iOS sparisce senza gli overlay switch nativi che
 * HapticTapService inietta nel DOM (fino a 128 sulla pagina di edit).
 */
export const HAPTIC_DISABLED = true;

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

    /**
     * True se un trigger "semantico" (medium/error/success/...) è stato
     * chiamato da un handler durante il gesto corrente. Serve a far vincere
     * il feedback esplicito su quello generico del tap — vedi triggerTap().
     */
    private explicitDuringGesture = false;

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
        if (HAPTIC_DISABLED) {
            return;
        }
        this.explicitDuringGesture = true;
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

    /**
     * Feedback generico di "tap", usato dal listener delegato di
     * HapticTapService per coprire tutti i pulsanti e le card cliccabili.
     *
     * Viene rimandato di un tick perché il listener delegato gira in fase di
     * CAPTURE, quindi prima degli handler (click) di Angular: se l'handler
     * chiama a sua volta trigger() con un tipo semantico ('error', 'success',
     * ...), quello vince e il tap generico viene soppresso. Così non si
     * ottengono due vibrazioni in fila per una sola interazione.
     */
    triggerTap(): void {
        if (HAPTIC_DISABLED) {
            return;
        }
        this.explicitDuringGesture = false;
        setTimeout(() => {
            if (!this.explicitDuringGesture) {
                this.trigger('light');
            }
        }, 0);
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

            // NB: niente visibility:hidden / display:none — alcune versioni di
            // WebKit non emettono l'haptic se l'elemento non è "renderizzabile".
            // Basta tenerlo fuori schermo e trasparente.
            wrapper.setAttribute('style',
                'position:fixed;top:-9999px;left:-9999px;' +
                'opacity:0;pointer-events:none;'
            );
            wrapper.setAttribute('aria-hidden', 'true');

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
