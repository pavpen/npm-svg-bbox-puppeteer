import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { calculateSvgBBoxInBrowser } from '@pavpen.dev/svg-bbox-puppeteer';

describe("imported calculateSvgBBoxInBrowser", async () => {
    it("Calculates a bounding box", async () => {
        // Setup:
        const svgDocument = `<svg xmlns="http://www.w3.org/2000/svg">
            <circle cx="-1" cy="5" r="19" />
        </svg>`;

        // Act:
        const result = await calculateSvgBBoxInBrowser(svgDocument);

        // Verify:
        assert.strictEqual(result.left, -20);
        assert.strictEqual(result.right, 18);
        assert.strictEqual(result.top, -14);
        assert.strictEqual(result.bottom, 24);
    });
});
