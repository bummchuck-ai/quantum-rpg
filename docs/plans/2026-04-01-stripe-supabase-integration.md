# Quantum Verse — Stripe + Supabase Integration

## Datum: 2026-04-01

## Übersicht
Monetarisierung von Quantum Verse über Supabase Auth + Stripe Checkout.
Free Tier (5/Tag), Standard (4,99€/Mo, 30/Tag), Premium (9,99€/Mo, 100/Tag), Credit-Packs (10/50/150).

## Architektur
- Supabase Auth (Email + Google OAuth)
- Supabase PostgreSQL (profiles, transactions)
- Stripe Checkout (Abos + Einmalkäufe)
- Stripe Webhooks (Zahlungsbestätigung)

## Datenbank

### profiles
- user_id (FK → auth.users, PK)
- stripe_customer_id (text, nullable)
- subscription_tier (text: free | standard | premium, default: free)
- daily_requests_used (int, default: 0)
- daily_reset_at (timestamptz)
- credits (int, default: 0)
- created_at, updated_at

### transactions
- id (uuid, PK)
- user_id (FK → auth.users)
- type (text: subscription | credit_purchase)
- amount_cents (int)
- credits_added (int, nullable)
- stripe_session_id (text)
- created_at

## API-Routes
- POST /api/auth/profile — Profil anlegen/abrufen
- POST /api/checkout — Stripe Session erstellen
- POST /api/webhook/stripe — Stripe Events
- GET /api/usage — Quota + Credits

## Tiers
| Tier | Preis | Anfragen/Tag | Stripe Price ID |
|------|-------|-------------|-----------------|
| Free | 0 € | 5 | — |
| Standard | 4,99 €/Mo | 30 | price_1THN7XJHJP8oL7R34UUTsQ73 |
| Premium | 9,99 €/Mo | 100 | price_1THN7YJHJP8oL7R3lvCngsFV |

## Credit-Packs
| Pack | Preis | Stripe Price ID |
|------|-------|-----------------|
| 10 Credits | 0,99 € | price_1THN79JHJP8oL7R3wdyukevp |
| 50 Credits | 3,99 € | price_1THN7AJHJP8oL7R38zVN1wnf |
| 150 Credits | 9,99 € | price_1THN7BJHJP8oL7R3piiiNgMu |

## Flow
1. Spieler erstellt Character (anonym, wie bisher)
2. Erste GM-Anfrage → Auth Modal (Email/Google)
3. Character aus localStorage → Supabase migrieren
4. Quota-Check: daily_requests < limit → GM, sonst Credits, sonst Upgrade-Prompt
5. Mitternacht-Reset: daily_requests_used = 0
