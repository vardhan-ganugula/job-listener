import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import telegramController from "./telegram.lib.js";

class Scrapper {
  constructor() {
    this.domains = [""];
    this.linkedinURL = "https://www.linkedin.com/jobs/search/";
  }

  async searchJobs(
    keyword = "reactjs",
    location = "india",
    experienceLevel = "",
    remote = "",
    jobType = "",
    easyApply = true,
    time = 4400
  ) {
    const linkedinURL = this.__makeLinkedinURL(
      keyword,
      location,
      experienceLevel,
      remote,
      jobType,
      easyApply,
      time
    );

    const { browser, page } = await this.__initBrowser();
    try {
      const linkedinHTML = await this.__gotoAndGetHTML(page, linkedinURL);
      let jobLinks = this.__getJobLinks(linkedinHTML);
      if(jobLinks.length > 20) jobLinks.slice(0, 20);
      const results = [];
      for (const link of jobLinks) {
        const normalized = this.__normalizeLinkedinLink(link);
        const html = await this.__gotoAndGetHTML(page, normalized);
        const details = await this.__extractJobDetails(html);
        results.push(details);
        const {description, jobTitle} = details;
        if(description === '' || jobTitle === '') continue;
        telegramController.sendJobDetailsToUsers({...details, link});
      }

      return JSON.stringify(results);
    } finally {
      await browser.close();
    }
  }

  __makeLinkedinURL(
    keyword = "reactjs",
    location = "india",
    experienceLevel = "",
    remote = "",
    jobType = "",
    easyApply = true,
    time = 4400
  ) {
    let linkedinURL = this.linkedinURL + "?f_TPR=r" + time;

    if (keyword) linkedinURL += `&keywords=${keyword}`;
    if (location) linkedinURL += `&location=${location}`;

    if (experienceLevel !== "") {
      const transformExperience = experienceLevel
        .split(",")
        .map((exp) => {
          switch (exp.trim().toLowerCase()) {
            case "internship":
              return 1;
            case "entry level":
              return 2;
            case "associate":
              return 3;
            case "mid-senior level":
              return 4;
            case "director":
              return 5;
            case "executive":
              return 6;
            default:
              return "";
          }
        })
        .filter(Boolean);

      linkedinURL += `&f_E=${transformExperience.join(",")}`;
    }

    if (remote.length !== 0) {
      const transformedRemote = remote
        .split(",")
        .map((e) => {
          switch (e.trim().toLowerCase()) {
            case "remote":
              return "2";
            case "hybrid":
              return "3";
            case "on-site":
              return "1";
            default:
              return "";
          }
        })
        .filter(Boolean);

      linkedinURL += `&f_WT=${transformedRemote.join(",")}`;
    }

    if (jobType !== "") {
      const transformedJobType = jobType
        .split(",")
        .map((type) => type.trim().charAt(0).toUpperCase());

      linkedinURL += `&f_JT=${transformedJobType.join(",")}`;
    }

    if (easyApply) linkedinURL += `&f_EA=true`;

    return linkedinURL;
  }

  async __makeLinkedinRequest(link) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
      );

      console.log("🌐 Navigating to LinkedIn page...");
      await page.goto(link, { waitUntil: "networkidle2", timeout: 60000 });
      await this.__autoScroll(page);

      const html = await page.content();
      await browser.close();
      return html;
    } catch (error) {
      console.error("❌ Error loading LinkedIn page:", error);
      await browser.close();
      throw error;
    }
  }

  async __initBrowser() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
    );
    return { browser, page };
  }

  async __gotoAndGetHTML(page, url) {
    console.log("🌐 Navigating to LinkedIn page...");
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    // Give the page a brief moment to stabilize after navigation/redirects
    await this.__delay(500);

    // Best-effort wait for main containers (don't fail if not found)
    try {
      if (/\/jobs\/search\//.test(url)) {
        await page.waitForSelector('ul.jobs-search__results-list', { timeout: 5000 });
      } else if (/\/jobs\/view\//.test(url)) {
        await page.waitForSelector('.show-more-less-html, .description__text', { timeout: 5000 });
      }
    } catch {}

    // Only scroll on search results page to load more cards
    if (/\/jobs\/search\//.test(url)) {
      try {
        await this.__autoScroll(page);
      } catch {}
    }
    return await page.content();
  }

  async __autoScroll(page) {
    const maxIterations = 40; // ~6s with 150ms pauses
    let lastHeight = await page.evaluate(() => document.body.scrollHeight);
    for (let i = 0; i < maxIterations; i++) {
      // Scroll step
      await page.evaluate(() => window.scrollBy(0, 600));
      await this.__delay(150);
      // Check height growth
      const newHeight = await page.evaluate(() => document.body.scrollHeight);
      if (newHeight <= lastHeight) {
        break;
      }
      lastHeight = newHeight;
    }
  }

  __delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  __cleanText(text = ""){
    if (!text) return "";
    return String(text).replace(/\s+/g, " ").trim();
  }
  __getJobLinks(htmlData) {
    const $ = cheerio.load(htmlData.toString());
    const jobSet = new Set();

    const jobLinks = [];
    $('ul.jobs-search__results-list a.base-card__full-link').each((_, el) => {
      const link = $(el).attr("href") || "";
      if (link.length === 0) return;
      if (jobSet.has(link)) return;
      // Only keep job detail links
      if (!/linkedin\.com\/jobs\/view\//.test(link)) return;
      jobSet.add(link);
      jobLinks.push(link);
    });

    return jobLinks;
  }

  __normalizeLinkedinLink(link = ""){
    if (!link) return link;
    try {
      const url = new URL(link.startsWith("http") ? link : `https://${link}`);
      url.hostname = "www.linkedin.com";
      return url.toString();
    } catch {
      return link;
    }
  }

  async __getInfoFromJobLink(link){
    const normalized = this.__normalizeLinkedinLink(link);
    const newHTML = await this.__makeLinkedinRequest(normalized);
    return await this.__extractJobDetails(newHTML);
  }

  async __extractJobDetails(html){
    const $ = cheerio.load(html);
    const companyDetailsDiv = $('.topcard__flavor-row');
    const jobTitle = this.__cleanText($('.top-card-layout__title, h1.topcard__title').first().text());
    const companyName = this.__cleanText(
      companyDetailsDiv.eq(0).find('.topcard__org-name-link, a.topcard__org-name-link').first().text()
    );
    const location = this.__cleanText(
      companyDetailsDiv.eq(0).find('.topcard__flavor--bullet, .topcard__flavor').first().text()
    );
    const description = this.__cleanText($('.show-more-less-html, .description__text').first().text());
    const applicants = this.__cleanText(
      companyDetailsDiv.eq(1).find('.num-applicants__caption, .num-applicants__text').first().text()
    );
    const postedTime = this.__cleanText(
      companyDetailsDiv.eq(1).find('.posted-time-ago__text, .posted-time-ago').first().text()
    );

    return {
      jobTitle, companyName, location, description, applicants, postedTime
    }
  }
}

export default Scrapper;
