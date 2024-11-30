import { chromium } from 'playwright';

async function scrapeMutualFund() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    const url = 'https://groww.in/mutual-funds/category/best-equity-mutual-funds';
    await page.goto(url);

    const mfsLists = await page.locator('#seoTopFundsList .cur-po').all();
    console.log(`Found ${mfsLists.length} mutual funds.`);

    const mutualFunds: MutualFundDTO[] = [];
    const stockOccurrences: Map<string, Set<string>> = new Map(); // Map to track stocks and the mutual funds they appear in


    for (const mf of mfsLists) {
        const mfName = await mf.innerText();
        const mfUrl = await mf.getAttribute('href') as string;

        console.log(`Scraping ${mfName} - ${mfUrl}`);

        if(mfName === 'View All'){
            continue;
        }
        await page.goto(`https://groww.in${mfUrl}`);

        await page.locator('.holdings101TableContainer').waitFor({ state: 'visible' });

        const stockElements = await page.locator('.holdings101TableContainer .cur-po  div').all();
        const stockHoldings: StockHolding[] = [];

        for (const stock of stockElements) {
            const name = await stock.innerText();
            stockHoldings.push({ name });
            console.log(`Stock: ${name}`);

            // Track stock occurrences across mutual funds
            if (!stockOccurrences.has(name)) {
                stockOccurrences.set(name, new Set());
            }
            stockOccurrences.get(name)?.add(mfName);

        }

        mutualFunds.push({
            mfName,
            mfUrl: `https://groww.in${mfUrl}`,
            stockHoldings,
        });

        console.log(`Completed ${mfName}`);
        console.log('-----------------------------------');
        await page.goBack();
    }

    const commonStocks = Array.from(stockOccurrences.entries())
        .filter(([, funds]) => funds.size > 3)
        .map(([stock, funds]) => ({
            stock,
            funds: Array.from(funds),
        }));

    // Sort by number of mutual funds the stock appears in

    commonStocks.sort((a, b) => b.funds.length - a.funds.length);

    //console.log('Final scraped data:', JSON.stringify(mutualFunds, null, 2));
    console.log('Stocks present in multiple mutual funds: ' +commonStocks.length);
    console.log(JSON.stringify(commonStocks, null, 2));

    await browser.close();
}


export interface StockHolding {
    name: string;
}

export interface MutualFundDTO {
    mfName: string;
    mfUrl: string;
    stockHoldings: StockHolding[];
}


scrapeMutualFund().catch((error) => {
    console.error('Error scraping mutual fund:', error);
});
