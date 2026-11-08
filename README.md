# Tony Dang — Photography Portfolio

Minimalist one-page portfolio for GitHub Pages.

## Add your photographs

1. Upload your JPG files into the `images/` folder.
2. Open `photos.js`.
3. Add one entry per image to `window.PORTFOLIO_PHOTOS`, for example:

```js
window.PORTFOLIO_PHOTOS = [
  { src: "images/editorial-01.jpg", title: "Editorial", year: "2026" },
  { src: "images/backstage-01.jpg", title: "Backstage", year: "2025" }
];
```

4. Save/commit the changes. GitHub Pages will publish the update automatically.

The filename in `photos.js` must match the uploaded filename exactly. Use JPG or WebP, ideally resized to around 2000–2500 px on the long edge and compressed for web. Keep original scans backed up elsewhere; GitHub is not an archive for large master files.

## Publish with GitHub Pages

1. Create a public repository named `tony-dang-portfolio` (or any name you prefer).
2. Upload the contents of this folder to the repository root. Do not upload the outer folder as an extra nested directory.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then save.
6. Wait for the published URL to appear in the Pages section.

## Customize before publishing

- Replace `hello@tonydang.com` in `index.html` with your real contact email.
- Update the short biography in the About section.
- Change the Instagram URL if needed.
- Add your images using the instructions above.

This is a static website: no account or server is needed for visitors to browse it.
