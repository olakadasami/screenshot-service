import puppeteer, { Browser, Page } from "puppeteer";
import chromium from "@sparticuz/chromium-min";

export const dynamic = `force-dynamic`;

const remoteExecutablePath = `https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar`;

class BrowserPool {
  private browser: Browser | undefined;
  private releasedPages: Page[] = [];
  private requiredPages: Page[] = [];

  public constructor() {}

  //TODO Implement Queue and max page allocation

  private async getBrowser(): Promise<Browser> {
    if (this.browser !== undefined) {
      return this.browser;
    }

    if (process.env.NEXT_PUBLIC_VERCEL_ENVIRONMENT === "production") {
      this.browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(remoteExecutablePath),
        headless: true,
      });
    } else {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }
    return this.browser;
  }

  public async requirePage(): Promise<Page> {
    if (this.releasedPages.length > 0) {
      const page = this.releasedPages.pop()!;
      this.requiredPages.push(page);
    }

    const browser = await this.getBrowser();
    const page = await browser.newPage();
    this.requiredPages.push(page);
    return page;
  }

  public async releasePage(page: Page): Promise<void> {
    const requiredIndex = this.requiredPages.indexOf(page);
    if (requiredIndex === -1) {
      throw new Error("Unknown Page was given for release");
    }
    this.requiredPages.splice(requiredIndex, 1);
    this.releasedPages.push(page);
  }
}

export const browserPool = new BrowserPool();
