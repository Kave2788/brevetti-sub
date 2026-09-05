# Brevetti Sub

PWA in stile Apple Wallet per tenere sul telefono i brevetti subacquei e
l'assicurazione DAN, e mostrarli al diving anche senza rete.

## Principio di base

**Non esiste un server.** Tessere e foto stanno solo su questo dispositivo, in
IndexedDB. Nessun account, nessun upload, nessuna sincronizzazione. In cambio:

- funziona completamente offline, che è quando serve davvero;
- i documenti personali non vanno da nessuna parte;
- il cambio telefono va gestito a mano, con **Impostazioni → Esporta backup**.

## Comandi

```bash
npm run dev      # sviluppo su http://localhost:5178
npm run build    # build di produzione in dist/
npm run preview  # serve dist/ (necessario per provare il service worker)
```

In VS Code il task `dev` parte da solo all'apertura della cartella; la
preview live si apre con `Cmd+Shift+P` → **Simple Browser: Show** →
`http://localhost:5178`.

## Installazione sul telefono

Serve **HTTPS** (o `localhost`): il service worker non parte su `http://`
verso un IP di rete locale. In pratica: `npm run build`, poi pubblica `dist/`
su un hosting statico (Netlify, Vercel, GitHub Pages).

- **iOS**: apri il sito in Safari → Condividi → *Aggiungi a Home*.
- **Android**: Chrome propone *Installa app*.

## Struttura

```
src/
├── types.ts              # modello dati (brevetto | assicurazione)
├── db.ts                 # IndexedDB, foto, export/import backup
├── utils.ts              # date, scadenze, hook per le foto
├── data/agencies.ts      # agenzie didattiche, colori, livelli suggeriti
├── App.tsx               # stato, navigazione fra le viste
└── components/
    ├── PassCard.tsx      # la tessera
    ├── CardDetail.tsx    # dettaglio + chiamata di emergenza
    ├── CardForm.tsx      # inserimento e modifica
    └── Settings.tsx      # backup e spazio occupato
```

## Note tecniche

- Le foto vengono ridimensionate a 1600px e ricompresse in JPEG prima del
  salvataggio: lo spazio del browser sul telefono è limitato.
- La scadenza viene segnalata a 60 giorni (`EXPIRY_WARNING_DAYS` in `utils.ts`).
- Il numero di emergenza DAN Europe è precompilato sulle nuove polizze
  (`DAN_EMERGENCY_PHONE` in `data/agencies.ts`) — **verificalo** prima di
  affidartici.
- iOS può cancellare i dati dei siti in caso di spazio esaurito. L'app chiede
  l'archiviazione persistente, ma non è garantita: tieni un backup.
