# @pavpen.dev/svg-bbox-puppeteer

A tiny NPM library that calculates an SVG's bounding box in SVG user
coordinates by rendering the document in a browser.

Example:

```TypeScript
import * as assert from 'node:assert';
import { calculateSvgBBoxInBrowser } from 'svg-bbox-puppeteer';

const svgDocument = `<svg xmlns="http://www.w3.org/2000/svg">
    <rect x="-7" y="-3" width="20" height="26"/>
</svg>`;

const result = await calculateSvgBBoxInBrowser(svgDocument);

assert.strictEqual(result.x, -7);
assert.strictEqual(result.y, -3);
assert.strictEqual(result.width, 20);
assert.strictEqual(result.height, 26);
```

You may need to calculate this bounding box, if you want to display the SVG as
a standalone illustration.  SVG can use user coordinates for specifying SVG
paths, such as curves.  Some SVG shape dimensions can also be specified in
viewport units (such as CSS pixels, `em`s, etc.).  SVG curves and text can
also be styled with CSS which uses viewport units, as well.

When specifying the SVG `viewBox` attribute, which determines what region of
the SVG canvas will be visible, you need to use user coordinates.
Unfortunately, in order to know the effect of CSS styling (e.g., line
thickness), and text (including size, font, etc.), as well as shapes using
absolute lengths on the bounding box, you need to do most of the work of
rendering the SVG, including loading (possibly downloading) fonts, applying
CSS, performing painted object transformations.

This library renders, and styles the SVG in a browser, then measures the
bounding box of the result.

## Install

```sh
npm install @pavpen.dev/svg-bbox-puppeteer
```

## Test

### Unit Tests

```sh
npm run test:units
```

### Integration Tests

```sh
npm run test:integration
```

## Publish to NPM

```sh
npm login
npm publish --access=public
```
