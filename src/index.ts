import puppeteer, { Browser, type Viewport } from 'puppeteer-core';

class NodeDomRectReadonly implements DOMRectReadOnly {
    constructor(readonly x: number, readonly y: number, readonly width: number, readonly height: number) {
    }

    static fromRect(rect: { x: number, y: number, width: number, height: number }): NodeDomRectReadonly {
        const { x, y, width, height } = rect;

        return new NodeDomRectReadonly(x, y, width, height);
    }

    get left(): number {
        return this.x;
    }

    get right(): number {
        return this.x + this.width;
    }

    get top(): number {
        return this.y;
    }

    get bottom(): number {
        return this.y + this.height;
    }

    toJSON() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            left: this.left,
            right: this.right,
            top: this.top,
            bottom: this.bottom
        };
    }
}

/**
 * Calculates the bounding box of an SVG in user coordinates of by rendering
 * it in a browser.
 * 
 * You may need to calculate this bounding box, if you want to display the
 * scene SVG as a standalone illustration.  SVG uses user coordinates for
 * specifying SVG curves.  However, SVG curves and text can be styled with CSS
 * which uses viewport units (such as CSS pixels, `em`s, etc.).
 * 
 * When specifying the SVG `viewBox` attribute, which determines which region
 * of the SVG canvas will be visible, you need to use user coordinates.
 * Unfortunately, in order to know how much CSS styling (e.g., line
 * thickness), and text (including size, font, etc.) will add to the bounding
 * box, you need to do most of the work of rendering the SVG, including
 * loading (possibly downloading) fonts, applying CSS, performing
 * painted object transformations.
 * 
 * This function renders, and styles the SVG in a browser, then measures the
 * bounding box of the result, and returns it.
 * 
 * Note: Use this function outside of a Web page. It requires a browser
 * instance, such as a headless Chrome process.
 * 
 * @param svgDocumentSource - The source code of the SVG document for which to
 *     calculate a bounding box
 * @param browser - Browser instance to use for rendering the SVG. If `null`,
 *     a new headless browser instance will be launched.
 * @param initialViewport - SVG viewport boundaries to use when rendering the
 *     scene
 * @returns The bounding box of the rendered SVG in user coordinates, if the
 * SVG contains only paths with finite bounding boxes, otherwise null
 */
export async function calculateSvgBBoxInBrowser(
    svgDocumentSource: string,
    browser: Browser | null = null,
    initialViewport: Viewport = { width: 640, height: 320 }
): Promise<DOMRectReadOnly | null> {
    const _browser = browser ?
        browser : await puppeteer.launch({ channel: 'chrome', headless: true });
    const page = await _browser.newPage();

    await page.setViewport(initialViewport);

    let boundingRect: { x: number, y: number, width: number, height: number } | null;
    await page.setContent(svgDocumentSource);
    try {
        boundingRect = await page.evaluate(() => {
            let minX = Infinity;
            let minY = Infinity;
            let maxX = -Infinity;
            let maxY = -Infinity;

            const svgElement = document.getElementsByTagName('svg')[0];
            if (typeof svgElement !== 'object') {
                throw Error(
                    `No SVG element found in browser when trying to measure ` +
                    `its bounding box. Browser document: ` +
                    `${document.documentElement.outerHTML}`);
            }
            const nodes = svgElement.children;

            const endI = nodes.length;
            for (let i = 0; i < endI; ++i) {
                const node = nodes[i];

                if (node instanceof SVGGraphicsElement) {
                    const box = node.getBBox();
                    const x0 = box.x, x1 = box.x + box.width;
                    const y0 = box.y, y1 = box.y + box.height;

                    minX = Math.min(minX, x0, x1);
                    minY = Math.min(minY, y0, y1);
                    maxX = Math.max(maxX, x0, x1);
                    maxY = Math.max(maxY, y0, y1);
                }
            }

            if (Number.isFinite(minX) && Number.isFinite(minY) && Number.isFinite(maxX) && Number.isFinite(maxY)) {
                return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
            } else {
                return null;
            }
        });
    } finally {
        await page.close();
    }

    if (!browser) {
        await _browser.close();
    }

    return boundingRect == null ? null : NodeDomRectReadonly.fromRect(boundingRect);
}
