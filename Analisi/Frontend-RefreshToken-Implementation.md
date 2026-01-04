# Implementazione Frontend - Sistema Refresh Token

## Data Implementazione
2026-01-04

## Stato
✅ **COMPLETATO** - Implementazione frontend pronta per il testing con il backend

---

## Modifiche Effettuate

### 1. Modelli TypeScript

#### File Modificati:
- `src/app/models/auth/login-model.ts`
  - Aggiunto campo `refreshToken: string` a `LoginResponseModel`

#### File Creati:
- `src/app/models/auth/refresh-token-model.ts`
  - `RefreshTokenRequestModel` - Request per refresh token
  - `RefreshTokenResponseModel` - Response da refresh token

### 2. AuthService (`src/app/core/services/auth.service.ts`)

#### Modifiche:
- **Nuovo parametro** in `setAuthState()`: ora accetta `refreshToken` come terzo parametro
- **Nuovo metodo** `getRefreshToken()`: restituisce il refresh token da localStorage
- **Nuovo metodo** `refreshAccessToken()`: chiama l'endpoint `/auth/refresh` per ottenere un nuovo access token
- **Nuovo metodo privato** `scheduleTokenRefresh()`: schedula automaticamente il refresh del token 5 minuti prima della scadenza
- **Gestione localStorage**: salva e rimuove il refresh token insieme al token e user
- **Auto-refresh**: schedulato sia al login che al caricamento dell'app (se token valido presente)

#### Comportamento Auto-Refresh:
```typescript
// Funziona così:
1. Al login: salva refresh token e schedula auto-refresh
2. Al caricamento app: se token presente, schedula auto-refresh
3. 5 minuti prima della scadenza: chiama automaticamente /auth/refresh
4. Se refresh OK: aggiorna token e re-schedula
5. Se refresh FAIL: esegue logout automatico
```

### 3. AuthInterceptor (`src/app/core/interceptors/auth.interceptor.ts`)

#### Modifiche:
- **Logica 401 migliorata**: quando riceve errore 401 su endpoint NON di autenticazione:
  1. Chiama `authService.refreshAccessToken()`
  2. Se refresh OK: riprova automaticamente la richiesta originale con il nuovo token
  3. Se refresh FAIL: esegue logout

#### Endpoint esclusi da retry:
- `/login`
- `/register`
- `/signup`
- `/refresh` (per evitare loop infiniti)

### 4. LoginComponent (`src/app/components/login/login.component.ts`)

#### Modifiche:
- `setAuthState()` ora riceve 3 parametri: `user`, `jwtToken`, `refreshToken`
- Passa il `response.refreshToken` dal backend al service

### 5. Configurazione API Catalog

#### File Modificati:
- `src/assets/recollect/env/dev/apicatalog/api.json`
- `src/assets/recollect/env/prod/apicatalog/api.json`

#### Nuovo Endpoint:
```json
{
  "name": "refresh",
  "endpoint": "/auth/refresh",
  "method": "post",
  "description": "Rinnova l'access token usando il refresh token"
}
```

---

## Flusso Completo

### Scenario 1: Login Utente
```
1. User fa login
2. Backend restituisce { jwtToken, refreshToken, ... }
3. Frontend salva entrambi in localStorage
4. Frontend schedula auto-refresh per tra 25 minuti (5 min prima della scadenza 30 min)
5. User naviga a /home
```

### Scenario 2: Richiesta API con Token Valido
```
1. User fa richiesta API (es: GET /workout/user/123)
2. AuthInterceptor aggiunge header Authorization: Bearer <jwtToken>
3. Backend valida token → 200 OK
4. Richiesta completata con successo
```

### Scenario 3: Token Scaduto - Auto-Refresh dall'Interceptor
```
1. User fa richiesta API (es: GET /workout/user/123)
2. AuthInterceptor aggiunge header Authorization: Bearer <jwtToken_scaduto>
3. Backend valida token → 401 Unauthorized
4. AuthInterceptor intercetta 401
5. AuthInterceptor chiama POST /auth/refresh { refreshToken }
6. Backend valida refreshToken → 200 OK { nuovo jwtToken }
7. AuthService aggiorna token in memoria e localStorage
8. AuthInterceptor riprova richiesta originale con nuovo token
9. Backend valida nuovo token → 200 OK
10. Richiesta completata con successo (trasparente per l'utente)
```

### Scenario 4: Auto-Refresh Proattivo
```
1. User ha token che scade tra 6 minuti
2. Timeout schedulato si attiva (5 min prima scadenza)
3. AuthService chiama automaticamente POST /auth/refresh
4. Backend valida refreshToken → 200 OK { nuovo jwtToken }
5. AuthService aggiorna token
6. AuthService schedula nuovo auto-refresh tra 25 minuti
7. User continua a usare app senza interruzioni
```

### Scenario 5: Refresh Token Scaduto
```
1. User fa richiesta API dopo 15 giorni di inattività
2. Backend → 401 Unauthorized
3. AuthInterceptor chiama POST /auth/refresh
4. Backend valida refreshToken → 401 Unauthorized (refresh scaduto)
5. AuthService esegue logout automatico
6. User reindirizzato a /login
```

---

## Cosa Aspettarsi dal Backend

### Endpoint `/auth/login` - Modificato

#### Response Attuale (DA AGGIORNARE):
```json
{
  "userId": 1,
  "username": "testuser",
  "jwtToken": "eyJhbGc...",
  "expiresIn": 3600,  // ⚠️ DA CAMBIARE a 1800 (30 min)
  "role": "USER"
}
```

#### Response Richiesta (NUOVA):
```json
{
  "userId": 1,
  "username": "testuser",
  "jwtToken": "eyJhbGc...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",  // ✅ NUOVO
  "expiresIn": 1800,  // ✅ 30 minuti
  "role": "USER",
  "email": "test@example.com",
  "name": "Test",
  "surname": "User"
}
```

### Endpoint `/auth/refresh` - Nuovo

#### Request:
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Response - Success (200):
```json
{
  "userId": 1,
  "username": "testuser",
  "jwtToken": "eyJhbGc...",  // NUOVO ACCESS TOKEN
  "expiresIn": 1800,
  "role": "USER",
  "email": "test@example.com",
  "name": "Test",
  "surname": "User"
}
```

#### Response - Error (401):
```json
{
  "error": "Invalid refresh token",
  "message": "Refresh token scaduto o non valido"
}
```

---

## Testing

### Test 1: Login e Salvataggio Token

**Passi:**
1. Esegui login dall'app
2. Apri DevTools → Application → Local Storage
3. Verifica presenza di:
   - `token` (JWT)
   - `refreshToken` (stringa UUID)
   - `user` (JSON dell'utente)

**Risultato Atteso:**
- ✅ Tutti e tre i valori presenti
- ✅ `refreshToken` è una stringa lunga (UUID o simile)

### Test 2: Auto-Refresh Proattivo

**Passi:**
1. Esegui login
2. Apri DevTools → Console
3. Aspetta 25 minuti (o modifica temporaneamente il timeout a 1 minuto per test)
4. Osserva la console

**Risultato Atteso:**
- ✅ Dopo 25 minuti (5 min prima scadenza), vedi chiamata POST /auth/refresh
- ✅ Nuovi token salvati in localStorage
- ✅ Nessun logout
- ✅ App continua a funzionare normalmente

### Test 3: Token Scaduto con Retry

**Passi:**
1. Esegui login
2. In DevTools → Application → Local Storage, copia il valore di `token`
3. Vai su https://jwt.io e incolla il token
4. Modifica il campo `exp` per farlo scadere (es: timestamp passato)
5. Copia il nuovo token JWT generato
6. Sostituisci il `token` in localStorage con quello scaduto
7. Naviga a una pagina che fa chiamate API (es: /le-mie-schede)

**Risultato Atteso:**
- ✅ Vedi errore 401 in Network tab
- ✅ Immediatamente dopo, vedi chiamata POST /auth/refresh
- ✅ Richiesta originale riprovata automaticamente
- ✅ Dati caricati con successo
- ✅ Nessun logout

### Test 4: Refresh Token Scaduto

**Passi:**
1. Esegui login
2. In localStorage, elimina o modifica il `refreshToken` per renderlo invalido
3. Modifica il `token` per farlo scadere (come Test 3)
4. Naviga a una pagina che fa chiamate API

**Risultato Atteso:**
- ✅ Vedi errore 401 per il token scaduto
- ✅ Vedi chiamata POST /auth/refresh
- ✅ Errore 401 su /auth/refresh (refresh token invalido)
- ✅ **Logout automatico**
- ✅ Reindirizzamento a /login

### Test 5: Logout Manuale

**Passi:**
1. Esegui login
2. Verifica presenza token e refreshToken in localStorage
3. Esegui logout dall'app

**Risultato Atteso:**
- ✅ `token` rimosso da localStorage
- ✅ `refreshToken` rimosso da localStorage
- ✅ `user` rimosso da localStorage
- ✅ Reindirizzamento a /login

---

## Verifica Compatibilità Backend

### ⚠️ Prima di Testare, Verificare:

1. **Endpoint `/auth/login` aggiornato?**
   - [ ] Restituisce campo `refreshToken`
   - [ ] `expiresIn` è 1800 (30 min) invece di 3600

2. **Endpoint `/auth/refresh` implementato?**
   - [ ] Accetta `{ refreshToken: string }` nel body
   - [ ] Restituisce nuovo `jwtToken` se refresh token valido
   - [ ] Restituisce 401 se refresh token invalido/scaduto

3. **Database refresh_tokens creato?**
   - [ ] Tabella esistente
   - [ ] Refresh token salvati al login
   - [ ] Validazione funzionante

---

## Possibili Problemi e Soluzioni

### Problema 1: "No refresh token available"
**Causa:** Backend non sta restituendo `refreshToken` al login
**Soluzione:** Verificare che il backend includa `refreshToken` nella response di `/auth/login`

### Problema 2: Loop infinito di refresh
**Causa:** Endpoint `/auth/refresh` restituisce 401 anche con token valido
**Soluzione:** Verificare logica backend, assicurarsi che refresh token sia salvato correttamente

### Problema 3: "Cannot read property 'refreshToken' of undefined"
**Causa:** Frontend cerca `response.refreshToken` ma backend non lo invia
**Soluzione:** Backend deve implementare il campo `refreshToken` nella response

### Problema 4: CORS error su `/auth/refresh`
**Causa:** Backend non ha configurato CORS per il nuovo endpoint
**Soluzione:** Aggiungere `/auth/refresh` alla whitelist CORS del backend

### Problema 5: Logout immediato dopo login
**Causa:** `refreshToken` è undefined o null, `scheduleTokenRefresh()` potrebbe fallire
**Soluzione:** Verificare console browser per errori, controllare che backend invii `refreshToken`

---

## File Modificati - Riepilogo

### Nuovi File:
1. `src/app/models/auth/refresh-token-model.ts`
2. `Analisi/Backend-RefreshToken-Specs.md`
3. `Analisi/Frontend-RefreshToken-Implementation.md` (questo file)

### File Modificati:
1. `src/app/models/auth/login-model.ts` - Aggiunto campo `refreshToken`
2. `src/app/core/services/auth.service.ts` - Implementato refresh logic
3. `src/app/core/interceptors/auth.interceptor.ts` - Implementato retry con refresh
4. `src/app/components/login/login.component.ts` - Passa refresh token a service
5. `src/assets/recollect/env/dev/apicatalog/api.json` - Aggiunto endpoint refresh
6. `src/assets/recollect/env/prod/apicatalog/api.json` - Aggiunto endpoint refresh

---

## Prossimi Passi

1. **Backend**: Implementare gli endpoint come descritto in `Backend-RefreshToken-Specs.md`
2. **Test Backend**: Testare endpoint `/auth/login` e `/auth/refresh` con Postman/Insomnia
3. **Test Integrazione**: Seguire i test descritti sopra per verificare il funzionamento end-to-end
4. **Produzione**: Dopo test OK in dev, deployare su produzione

---

## Note Importanti

- Il refresh token rimane lo stesso per tutta la durata (no rotation)
- Auto-refresh schedulato 5 minuti prima della scadenza del token
- In caso di problemi con il refresh, viene effettuato logout automatico
- Il sistema è trasparente per l'utente: non si accorge del refresh automatico
- Durata access token: 30 minuti
- Durata refresh token: 14 giorni (configurato nel backend)

---

## Contatti

Per domande o problemi durante il testing, contattare il team di sviluppo.

**Data Documento:** 2026-01-04
**Versione:** 1.0
**Autore:** Claude Code Assistant
