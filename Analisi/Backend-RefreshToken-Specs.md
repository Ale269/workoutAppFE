# Specifiche Backend - Implementazione Refresh Token

## Panoramica

Implementare un sistema di **refresh token** per migliorare sicurezza e UX dell'autenticazione.

### Parametri Configurati
- **Access Token Duration**: 30 minuti (1800 secondi)
- **Refresh Token Duration**: 14 giorni (1209600 secondi)
- **Token Rotation**: NO (il refresh token rimane lo stesso)
- **Storage**: localStorage (frontend)

---

## 1. Modifiche all'Endpoint di Login

### Endpoint Esistente
```
POST /auth/login
```

### Request Body (INVARIATO)
```json
{
  "username": "user123",
  "password": "password123"
}
```

### Response Body (DA MODIFICARE)

#### Attuale:
```json
{
  "userId": 1,
  "username": "user123",
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "role": "USER",
  "email": "user@example.com",
  "name": "Mario",
  "surname": "Rossi"
}
```

#### Nuova (AGGIUNGERE refreshToken):
```json
{
  "userId": 1,
  "username": "user123",
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",  // NUOVO
  "expiresIn": 1800,                                        // CAMBIARE: 30 min invece di 1 ora
  "role": "USER",
  "email": "user@example.com",
  "name": "Mario",
  "surname": "Rossi"
}
```

### Modifiche Necessarie Backend:

1. **Generare Refresh Token** al momento del login
   - Stringa sicura, lunga e random (UUID v4 o simile)
   - Esempio: `550e8400-e29b-41d4-a716-446655440000`

2. **Salvare Refresh Token in Database**
   - Tabella: `refresh_tokens` o aggiungere colonna a tabella esistente
   - Campi suggeriti:
     ```sql
     CREATE TABLE refresh_tokens (
         id BIGINT PRIMARY KEY AUTO_INCREMENT,
         token VARCHAR(255) UNIQUE NOT NULL,
         user_id BIGINT NOT NULL,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         expires_at TIMESTAMP NOT NULL,
         revoked BOOLEAN DEFAULT FALSE,
         FOREIGN KEY (user_id) REFERENCES users(id)
     );
     ```

3. **Modificare durata Access Token (JWT)**
   - Da 3600 secondi (1 ora) → **1800 secondi (30 minuti)**
   - Impostare `exp` claim nel JWT correttamente

4. **Restituire entrambi i token nella response**

---

## 2. Nuovo Endpoint: Refresh Token

### Endpoint da Creare
```
POST /auth/refresh
```

### Request Body
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Response Body - Successo (200 OK)
```json
{
  "userId": 1,
  "username": "user123",
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  // NUOVO ACCESS TOKEN
  "expiresIn": 1800,
  "role": "USER",
  "email": "user@example.com",
  "name": "Mario",
  "surname": "Rossi"
}
```

**NOTA:** Non restituire un nuovo refreshToken (rotation = NO), quindi il client continuerà ad usare lo stesso.

### Response Body - Errore (401 Unauthorized)
```json
{
  "error": "Invalid refresh token",
  "message": "Refresh token scaduto o non valido"
}
```

### Logica Backend dell'Endpoint

```
1. Ricevere refreshToken dal body
2. Cercare il token nella tabella refresh_tokens
3. Verifiche:
   a. Il token esiste?
   b. Il token NON è revocato? (revoked = false)
   c. Il token NON è scaduto? (expires_at > NOW())
4. Se tutte le verifiche OK:
   a. Recuperare user_id associato al refresh token
   b. Caricare i dati completi dell'utente dal database
   c. Generare un NUOVO access token (JWT) con durata 30 min
   d. Restituire la response con il nuovo JWT
5. Se qualche verifica FAIL:
   a. Restituire 401 Unauthorized
```

### Pseudocodice (Esempio Java/Spring Boot)

```java
@PostMapping("/auth/refresh")
public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
    String refreshToken = request.getRefreshToken();

    // 1. Cercare il token nel database
    Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByToken(refreshToken);

    if (tokenOpt.isEmpty()) {
        return ResponseEntity.status(401).body(new ErrorResponse("Invalid refresh token"));
    }

    RefreshToken token = tokenOpt.get();

    // 2. Verificare che non sia revocato
    if (token.isRevoked()) {
        return ResponseEntity.status(401).body(new ErrorResponse("Refresh token revoked"));
    }

    // 3. Verificare che non sia scaduto
    if (token.getExpiresAt().before(new Date())) {
        return ResponseEntity.status(401).body(new ErrorResponse("Refresh token expired"));
    }

    // 4. Caricare l'utente
    User user = userRepository.findById(token.getUserId())
        .orElseThrow(() -> new RuntimeException("User not found"));

    // 5. Generare nuovo access token
    String newJwtToken = jwtUtil.generateToken(user, 1800); // 30 min

    // 6. Restituire response
    return ResponseEntity.ok(new LoginResponse(
        user.getId(),
        user.getUsername(),
        newJwtToken,
        1800, // expiresIn
        user.getRole(),
        user.getEmail(),
        user.getName(),
        user.getSurname()
    ));
}
```

---

## 3. Modifiche all'Endpoint di Register (Opzionale)

### Endpoint
```
POST /auth/register
```

### Decisione da Prendere

**Opzione A: Registrazione + Login automatico**
- Dopo la registrazione, restituire anche `jwtToken` e `refreshToken`
- L'utente è subito loggato senza dover fare login

**Opzione B: Solo registrazione (attuale)**
- Dopo la registrazione, l'utente deve fare login manualmente
- Non restituire token

**CONSIGLIO**: Opzione A per migliore UX.

Se scegliete Opzione A, la response diventa uguale a quella di login:
```json
{
  "userId": 1,
  "username": "newuser",
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "expiresIn": 1800,
  "role": "USER",
  "email": "newuser@example.com",
  "name": "New",
  "surname": "User"
}
```

---

## 4. Endpoint di Logout (Opzionale ma Consigliato)

### Endpoint da Creare (se non esiste)
```
POST /auth/logout
```

### Request Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Response Body - Successo (200 OK)
```json
{
  "message": "Logout successful"
}
```

### Logica Backend

```
1. Ricevere refreshToken dal body
2. Trovare il token nel database
3. Impostare revoked = true
4. Opzionale: Aggiungere l'access token JWT a una blacklist temporanea
   (valida per i prossimi 30 minuti finché il JWT non scade naturalmente)
```

**NOTA**: Revocare il refresh token impedisce ulteriori rinnovi del token, ma l'access token JWT corrente rimane valido fino alla scadenza naturale (max 30 min).

---

## 5. Sicurezza e Best Practices

### 5.1 Validazione JWT
Assicurarsi che la validazione JWT verifichi:
- Firma valida (HMAC/RSA)
- Token non scaduto (claim `exp`)
- Issuer corretto (claim `iss`)
- Audience corretto (claim `aud`) - opzionale

### 5.2 Protezione Refresh Token
- Salvare hash del refresh token invece del token in chiaro (opzionale ma consigliato)
- Esempio: `SHA-256(refreshToken)` nel database
- Al momento della verifica, hashare il token ricevuto e confrontare

### 5.3 Rate Limiting
Implementare rate limiting sull'endpoint `/auth/refresh`:
- Max 10 richieste per refresh token all'ora
- Previene abuso in caso di token rubato

### 5.4 Pulizia Automatica
Implementare job schedulato per eliminare refresh token scaduti:
```sql
DELETE FROM refresh_tokens
WHERE expires_at < NOW() - INTERVAL 7 DAY;
```
Eseguire giornalmente.

### 5.5 Logging
Loggare eventi critici:
- Creazione refresh token (login)
- Utilizzo refresh token (refresh)
- Tentativi falliti di refresh
- Revoca refresh token (logout)

---

## 6. Configurazione Frontend

### API Catalog - Nuovo Endpoint

Aggiungere in `src/assets/recollect/env/dev/apicatalog/api.json` e `prod/apicatalog/api.json`:

```json
{
  "name": "refresh",
  "endpoint": "/auth/refresh",
  "method": "post",
  "isMocked": false
}
```

Posizione: sotto `"auth"` array, dopo `"checkUserAuthentication"`.

---

## 7. Testing

### Test Case 1: Login con Refresh Token
```
POST /auth/login
Body: { "username": "test", "password": "test123" }

Expected:
- Status: 200
- Response contiene: jwtToken, refreshToken, expiresIn=1800
- Refresh token salvato in database
```

### Test Case 2: Refresh Token Valido
```
1. Login (ottenere refreshToken)
2. Attendere 1 minuto
3. POST /auth/refresh
   Body: { "refreshToken": "<token_ottenuto>" }

Expected:
- Status: 200
- Response contiene nuovo jwtToken
- Nuovo jwtToken ha exp diverso dal precedente
```

### Test Case 3: Refresh Token Scaduto
```
1. Creare refresh token con expires_at nel passato
2. POST /auth/refresh
   Body: { "refreshToken": "<token_scaduto>" }

Expected:
- Status: 401
- Error: "Refresh token expired"
```

### Test Case 4: Refresh Token Invalido
```
POST /auth/refresh
Body: { "refreshToken": "token-inesistente-123" }

Expected:
- Status: 401
- Error: "Invalid refresh token"
```

### Test Case 5: Refresh Token Revocato (dopo logout)
```
1. Login (ottenere refreshToken)
2. POST /auth/logout
   Body: { "refreshToken": "<token>" }
3. POST /auth/refresh
   Body: { "refreshToken": "<stesso_token>" }

Expected:
- Status: 401
- Error: "Refresh token revoked"
```

### Test Case 6: Access Token Scaduto -> Auto-Refresh
```
1. Login (ottenere jwtToken)
2. Modificare manualmente exp del JWT per farlo scadere
3. Fare una qualsiasi API call autenticata (es: GET /user/:userId)

Expected:
- Prima richiesta: 401
- Frontend intercetta e chiama /auth/refresh automaticamente
- Richiesta riprovata automaticamente con nuovo token
- Success
```

---

## 8. Database Schema Completo

```sql
CREATE TABLE refresh_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(45),           -- Opzionale: tracciare IP
    user_agent VARCHAR(500),          -- Opzionale: tracciare browser
    last_used_at TIMESTAMP,           -- Opzionale: tracciare ultimo uso

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);
```

---

## 9. Checklist Implementazione Backend

- [ ] Modificare `/auth/login` per generare e restituire `refreshToken`
- [ ] Modificare durata JWT access token da 3600s a 1800s
- [ ] Creare tabella `refresh_tokens` nel database
- [ ] Creare endpoint `POST /auth/refresh`
- [ ] Implementare logica di validazione refresh token
- [ ] (Opzionale) Modificare `/auth/register` per login automatico
- [ ] (Opzionale) Creare endpoint `POST /auth/logout` con revoca token
- [ ] Implementare rate limiting su `/auth/refresh`
- [ ] Implementare job di pulizia token scaduti
- [ ] Scrivere test per tutti i casi d'uso
- [ ] Documentare nuovi endpoint in API docs
- [ ] Testare integrazione con frontend

---

## 10. Domande e Risposte

### Q: Cosa succede se un utente fa login da due dispositivi?
**R:** Ogni login genera un refresh token diverso. Entrambi i dispositivi funzioneranno indipendentemente. Se si vuole limitare a un solo dispositivo attivo, si deve revocare il refresh token precedente al nuovo login.

### Q: Cosa succede se qualcuno ruba il refresh token?
**R:** Può generare access token fino alla scadenza (14 giorni). Mitigazioni:
- Durata refresh token non troppo lunga (14 giorni è ok)
- Logout revoca il refresh token
- Rate limiting previene abuso massiccio
- Monitoraggio accessi sospetti (IP diverso, user agent diverso)

### Q: Perché non implementare token rotation?
**R:** Semplifica l'implementazione iniziale. Si può aggiungere in seguito se necessario. Token rotation significa che ogni refresh genera un nuovo refresh token, invalidando il precedente.

### Q: Il refresh token deve essere validato ad ogni richiesta API?
**R:** NO. Il refresh token si usa SOLO quando l'access token scade. Le normali richieste API usano solo l'access token JWT.

### Q: Cosa fare se il refresh fallisce nel frontend?
**R:** Il frontend farà automaticamente logout e reindirizzerà al login. L'utente dovrà autenticarsi nuovamente.

---

## Contatti

Per domande o chiarimenti durante l'implementazione, contattare il team frontend.

**Frontend Lead:** [Il tuo nome/contatto]
**Data Documento:** 2026-01-04
**Versione:** 1.0
