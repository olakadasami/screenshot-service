import puppeteer, { Browser, Page } from "puppeteer";

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

    this.browser = await puppeteer.launch({
      executablePath: "/usr/bin/microsoft-edge",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
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
