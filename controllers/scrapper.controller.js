import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

class Scrapper {
  constructor() {
    this.domains = [''];
    this.linkedinURL = 'https://www.linkedin.com/jobs/search/';
  }

  async searchJobs() {
    const linkedinURL = this.__makeLinkedinURL();
    console.log("🔗 LinkedIn URL:", linkedinURL);

    const linkedinHTML = await this.__makeLinkedinRequest(linkedinURL);
    const jobDetails = this.__getJobDetails(linkedinHTML);
    return jobDetails;
  }

  __makeLinkedinURL(
    keyword = 'reactjs',
    location = 'india',
    experienceLevel = '',
    remote = '',
    jobType = '',
    easyApply = true,
    time = 4400
  ) {
    let linkedinURL = this.linkedinURL + '?f_TPR=r' + time;

    if (keyword) linkedinURL += `&keywords=${keyword}`;
    if (location) linkedinURL += `&location=${location}`;

    if (experienceLevel !== '') {
      const transformExperience = experienceLevel
        .split(',')
        .map((exp) => {
          switch (exp.trim().toLowerCase()) {
            case 'internship': return 1;
            case 'entry level': return 2;
            case 'associate': return 3;
            case 'mid-senior level': return 4;
            case 'director': return 5;
            case 'executive': return 6;
            default: return '';
          }
        })
        .filter(Boolean);

      linkedinURL += `&f_E=${transformExperience.join(',')}`;
    }

    if (remote.length !== 0) {
      const transformedRemote = remote
        .split(',')
        .map((e) => {
          switch (e.trim().toLowerCase()) {
            case 'remote': return '2';
            case 'hybrid': return '3';
            case 'on-site': return '1';
            default: return '';
          }
        })
        .filter(Boolean);

      linkedinURL += `&f_WT=${transformedRemote.join(',')}`;
    }

    if (jobType !== '') {
      const transformedJobType = jobType
        .split(',')
        .map((type) => type.trim().charAt(0).toUpperCase());

      linkedinURL += `&f_JT=${transformedJobType.join(',')}`;
    }

    if (easyApply) linkedinURL += `&f_EA=true`;

    return linkedinURL;
  }

  async __makeLinkedinRequest(link) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
      );

      console.log('🌐 Navigating to LinkedIn page...');
      await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });

      await page.waitForSelector(
        'a.job-card-container__link, a.job-card-list__title--link, ul.jobs-search__results-list',
        { timeout: 30000 }
      ).catch(() => console.log('⚠️ Job cards selector not found, continuing...'));

      await this.__autoScroll(page);

      const html = await page.content();
      await browser.close();
      return html;
    } catch (error) {
      console.error('❌ Error loading LinkedIn page:', error);
      await browser.close();
      throw error;
    }
  }

  async __autoScroll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 200;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 150);
      });
    });
  }

  __getJobDetails(htmlData) {
    const $ = cheerio.load(htmlData.toString());
    const jobSet = new Set();
  
    const cleanText = (text = '') => text.replace(/\s+/g, ' ').trim();
    const jobs = [] 
    $('div.base-search-card__info').each((_, el) => {
      const title = cleanText($(el).find('.base-search-card__title').text());
      const companyName = cleanText($(el).find('.base-search-card__subtitle').text());
      const link = $(el).find('.base-search-card__subtitle a').attr('href') || '';
      const metaDat = $(el).find('.base-search-card__metadata');
      const location = cleanText($(metaDat).find('.job-search-card__location').text());
      const time = cleanText($(metaDat).find('time').attr('datetime') || '');
  
      if (link && !jobSet.has(link)){
        jobSet.add(link);
        jobs.push({ title, companyName, link, time, location })
      }
    });
    
    return jobs;
  }
  
}

export default Scrapper;
