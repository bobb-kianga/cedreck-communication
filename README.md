# Cellex Market

A phone-selling storefront built as a fully static website that can run live on GitHub Pages without Firebase or Supabase.

## Features

- User login and registration using browser local storage
- Phone listings stored in local storage
- Searchable catalog
- Add a phone listing form
- Buy and delete actions
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

This is a lightweight live version intended for quick deployment and demo use. It stores data in the browser, so it is ideal for static hosting and testing before adding a real backend.
