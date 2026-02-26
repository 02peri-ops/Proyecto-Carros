const express = require('express');
const router = express.Router();
const {
    getExchangeRates,
    convertCurrency,
    getHistoricalRates,
} = require('../services/exchangeRate.service');
