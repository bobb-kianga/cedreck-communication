# Receipt Management System

A phone transaction receipt management system built as a fully static website that can run live on GitHub Pages without Firebase or Supabase.

## Features

- User login and registration using browser local storage
- Receipt creation and management
- Receipt tracking with the following information:
  - Phone IMEI
  - Customer ID
  - Customer Names
  - Next of Kin
  - Method of Payment (Cash, Credit Card, Debit Card, Mobile Money, Bank Transfer)
  - Transaction Date
- Searchable receipt catalog (by customer ID, name, or IMEI)
- View and delete receipt actions
- Easy GitHub Pages deployment

## Run locally

```bash
cd /workspaces/cedreck-communication
python3 -m http.server 8000
```

Then open http://localhost:8000

## Deploy to GitHub Pages

1. Push this repository to GitHub
2. Open the repository settings
3. Go to Pages
4. Set source to GitHub Actions
5. The included workflow will deploy automatically on every push to the main branch

## Notes

This is a lightweight receipt management system intended for transaction tracking and record keeping. It stores data in the browser, so it is ideal for static hosting and testing before adding a real backend.
