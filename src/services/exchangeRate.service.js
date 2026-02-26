/**
 * Este archivo define el servicio para obtener tasas de cambio, convertir monedas y obtener tasas históricas utilizando la API de Frankfurter.
 * Proporciona funciones para interactuar con la API y manejar errores de manera adecuada.
 */
const fetch = require('node-fetch');

const FRANKFURTER_API = process.env.FRANKFURTER_API_URL || 'https://api.frankfurter.app';

/**
 * 
 */
const getExchangeRates = async (baseCurrency = 'USD', symbols = ['MXN', 'EUR']) => {
    try {
        const symbolsParam = symbols.join(',');
        const response = await fetch(
            `${FRANKFURTER_API}/latest?from=${baseCurrency}&to=${symbolsParam}`
        );

        if (!response.ok) {
            throw new Error(`Error fetching exchange rates: ${response.statusText}`);
        }

        const data = await response.json();
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
        const response = await fetch(
            `${FRANKFURTER_API}/latest?amount=${amount}&from=${from}&to=${to}`
        );

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
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
        const response = await fetch(
            `${FRANKFURTER_API}/${startDate}..${endDate}?from=${baseCurrency}&to=${targetCurrency}`
        );

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
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