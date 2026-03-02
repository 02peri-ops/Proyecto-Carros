const express = require('express');
const router = express.Router();
const {
    getExchangeRates,
    convertCurrency,
    getHistoricalRates,
} = require('../services/exchangeRate.service');

router.get('/rates', async (req, res) => {
  const { base = 'USD', symbols = 'MXN' } = req.query;
  
  const symbolsArray = symbols.split(',').map(s => s.trim().toUpperCase());
  const result = await getExchangeRates(base.toUpperCase(), symbolsArray);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ error: result.error });
  }
});

router.post('/convert', async (req, res) => {
  const { amount, from, to } = req.body;
  
  if (!amount || !from || !to) {
    return res.status(400).json({ 
      error: 'Faltan parámetros: amount, from, to son requeridos' 
    });
  }
  
  const result = await convertCurrency(amount, from.toUpperCase(), to.toUpperCase());
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ error: result.error });
  }
});

router.get('/history', async (req, res) => {
  const { base, target, startDate, endDate } = req.query;
  
  if (!base || !target || !startDate || !endDate) {
    return res.status(400).json({ 
      error: 'Faltan parámetros: base, target, startDate, endDate son requeridos' 
    });
  }
  
  const result = await getHistoricalRates(
    base.toUpperCase(), 
    target.toUpperCase(), 
    startDate, 
    endDate
  );
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ error: result.error });
  }
});

module.exports = router;
