let globalPrices = {
    btc: 42150.00,
    eth: 3245.50
};

let priceDirection = {
    btc: 1,
    eth: 1
};

let volatilityMult = {
    btc: 15,
    eth: 8
};

function rndPrice(base, variance, direction) {
    const trend = direction * variance * 0.3;
    const noise = (Math.random() - 0.5) * variance;
    return base + trend + noise;
}

function updateGlobalTicker() {
    if (Math.random() < 0.15) priceDirection.btc *= -1;
    if (Math.random() < 0.15) priceDirection.eth *= -1;

    globalPrices.btc = rndPrice(globalPrices.btc, volatilityMult.btc, priceDirection.btc);
    globalPrices.eth = rndPrice(globalPrices.eth, volatilityMult.eth, priceDirection.eth);

    globalPrices.btc = Math.max(35000, Math.min(50000, globalPrices.btc));
    globalPrices.eth = Math.max(2500, Math.min(4500, globalPrices.eth));

    const btcTicker = document.getElementById('tickerBTC');
    const ethTicker = document.getElementById('tickerETH');

    if (btcTicker) {
        btcTicker.textContent = `$${globalPrices.btc.toFixed(2)}`;
        btcTicker.style.color = priceDirection.btc > 0 ? '#00ff88' : '#ff4757';
    }
    if (ethTicker) {
        ethTicker.textContent = `$${globalPrices.eth.toFixed(2)}`;
        ethTicker.style.color = priceDirection.eth > 0 ? '#00ff88' : '#ff4757';
    }
}

function updateHomeTicker() {
    const stat1 = document.getElementById('stat1');
    const stat2 = document.getElementById('stat2');
    const stat3 = document.getElementById('stat3');

    if (stat1) {
        stat1.textContent = `$${globalPrices.btc.toFixed(0)}`;
        stat1.style.color = priceDirection.btc > 0 ? '#00ff88' : '#ff4757';
    }
    if (stat2) {
        stat2.textContent = `$${globalPrices.eth.toFixed(0)}`;
        stat2.style.color = priceDirection.eth > 0 ? '#00ff88' : '#ff4757';
    }
    if (stat3) {
        const traders = 1200 + Math.floor(Math.random() * 100);
        stat3.textContent = traders.toLocaleString();
    }
}

if (document.getElementById('tickerBTC') || document.getElementById('stat1')) {
    setInterval(() => {
        updateGlobalTicker();
        updateHomeTicker();
    }, 1500);
}

console.log('CryptoX initialized');
