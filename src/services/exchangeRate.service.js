/**
 * Este archivo define el servicio para obtener tasas de cambio, convertir monedas y obtener tasas históricas utilizando la API de Frankfurter.
 * Proporciona funciones para interactuar con la API y manejar errores de manera adecuada.
 */
const https = require('https');
const { URL } = require('url');

const FRANKFURTER_API = process.env.FRANKFURTER_API_URL || 'https://api.frankfurter.app';

/**
 * Helper function to make HTTPS requests
 */
const httpsGet = (urlString) => {
    return new Promise((resolve, reject) => {
        const url = new URL(urlString);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        req.end();
    });
};

/**
 * 
 */
const getExchangeRates = async (baseCurrency = 'USD', symbols = ['MXN', 'EUR']) => {
    try {
        const symbolsParam = symbols.join(',');
        const urlString = `${FRANKFURTER_API}/latest?from=${baseCurrency}&to=${symbolsParam}`;
        console.log('Fetching:', urlString);
        const data = await httpsGet(urlString);

        return {
            success: true,
            base: data.base,
            date: data.date,
            rates: data.rates,
        };
    } catch (error) {
        console.error('Error fetching exchange rates:', error.message);
        return {
            success: false,
            error: error.message,
        };
    }
};

const convertCurrency = async (amount, from, to) => {
    try {
        const data = await httpsGet(
            `${FRANKFURTER_API}/latest?amount=${amount}&from=${from}&to=${to}`
        );
        
        return {
            success: true,
            amount: amount,
            from: from,
            to: to,
            result: data.rates[to],
        };
    } catch (error) {
        console.error('Error converting currency:', error.message);
        return {
            success: false,
            error: error.message,
        };
    }
};

const getHistoricalRates = async (baseCurrency, targetCurrency, startDate, endDate) => {
    try {
        const data = await httpsGet(
            `${FRANKFURTER_API}/${startDate}..${endDate}?from=${baseCurrency}&to=${targetCurrency}`
        );
        
        return {
            success: true,
            base: data.base,
            startDate: data.startDate,
            endDate: data.endDate,
            rates: data.rates,
        };
    } catch (error) {
        console.error('Error fetching historical rates:', error.message);
        return {
            success: false,
            error: error.message,
        };
    }
};

module.exports = {
    getExchangeRates,
    convertCurrency,
    getHistoricalRates,
};
