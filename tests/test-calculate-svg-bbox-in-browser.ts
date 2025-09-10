import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { calculateSvgBBoxInBrowser } from '../src/index';

describe("calculateSvgBBoxInBrowser", async () => {
    it("Returns a bounding box", async () => {
        // Setup:
        const svgDocument = `<svg xmlns="http://www.w3.org/2000/svg">
            <rect x="-7" y="-3" width="20" height="26"/>
        </svg>`;

        // Act:
        const result = await calculateSvgBBoxInBrowser(svgDocument);

        // Verify:
        assert.notStrictEqual(result, null);
        if (result == null) {
            throw Error();
        }
        assert.strictEqual(result.x, -7);
        assert.strictEqual(result.y, -3);
        assert.strictEqual(result.width, 20);
        assert.strictEqual(result.height, 26);
        assert.strictEqual(result.left, -7);
        assert.strictEqual(result.right, 13);
        assert.strictEqual(result.top, -3);
        assert.strictEqual(result.bottom, 23);
    });

    it("Accepts an empty graphic", async () => {
        // Setup:
        const svgDocument = `<svg xmlns="http://www.w3.org/2000/svg">
        </svg>`;

        // Act:
        const result = await calculateSvgBBoxInBrowser(svgDocument);

        // Verify:
        assert.strictEqual(result, null);
    });

    it("Accepts only text", async () => {
        // Setup:
        const svgDocument = `<svg xmlns="http://www.w3.org/2000/svg">
            <style>
                .test-span {
                    font: 16px serif;
                }
            </style>
            <text x="3" y="-5" clas="test-span">Texty</text>
        </svg>`;

        // Act:
        const result = await calculateSvgBBoxInBrowser(svgDocument);

        // Verify:
        assert.notStrictEqual(result, null);
        if (result == null) {
            throw Error();
        }
        assert.strictEqual(result.left, 3);
        assert.ok(result.bottom >= -5);
    });
});
