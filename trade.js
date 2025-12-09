let currentSide = 'buy';
let orderType = 'limit';

let midPrice = 42150.00;

function generateOrderBook() {
    const spread = 0.5 + Math.random() * 2;
    const bidStart = midPrice - spread / 2;
    const askStart = midPrice + spread / 2;

    bids = [];
    asks = [];

    for (let i = 0; i < 15; i++) {
        bids.push({
            price: bidStart - i * (0.5 + Math.random() * 2),
            amount: 0.1 + Math.random() * 2.5
        });
    }

    for (let i = 0; i < 15; i++) {
        asks.push({
            price: askStart + i * (0.5 + Math.random() * 2),
            amount: 0.1 + Math.random() * 2.5
        });
    }
}

let bids = [];
let asks = [];
generateOrderBook();

let recentTrades = [];
let priceHistory = Array.from({ length: 20 }, (_, i) => midPrice + (Math.random() - 0.5) * 100);

let userPortfolio = {
    BTC: 0.5,
    ETH: 2.5,
    SOL: 15,
    USD: 10000
};

function setSide(side) {
    currentSide = side;
    const buttons = document.querySelectorAll('.tab-btn');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
    }

    if (side === 'buy') {
        document.getElementById('buyTab').classList.add('active');
        document.getElementById('submitBtn').textContent = 'BUY BTC';
        document.getElementById('submitBtn').className = 'submit-btn buy';
    } else {
        document.getElementById('sellTab').classList.add('active');
        document.getElementById('submitBtn').textContent = 'SELL BTC';
        document.getElementById('submitBtn').className = 'submit-btn sell';
    }
}

function handleTypeChange() {
    orderType = document.getElementById('orderType').value;
    const priceGroup = document.getElementById('priceGroup');

    if (orderType === 'market') {
        priceGroup.style.display = 'none';
    } else {
        priceGroup.style.display = 'block';
    }
}

function submitOrder() {
    const amount = parseFloat(document.getElementById('orderAmount').value);
    const price = orderType === 'market' ? null : parseFloat(document.getElementById('orderPrice').value);

    if (!amount || amount <= 0) {
        alert('Enter valid amount');
        return;
    }

    if (orderType === 'limit' && (!price || price <= 0)) {
        alert('Enter valid price');
        return;
    }

    const estimatedPrice = price || getBestPrice(currentSide);
    const totalCost = amount * estimatedPrice;

    if (currentSide === 'buy') {
        if (userPortfolio.USD < totalCost) {
            alert('Insufficient funds! You need $' + totalCost.toFixed(2) + ' but only have $' + userPortfolio.USD.toFixed(2));
            return;
        }
    } else {
        if (userPortfolio.BTC < amount) {
            alert('Insufficient BTC! You are trying to sell ' + amount.toFixed(4) + ' BTC but only have ' + userPortfolio.BTC.toFixed(4) + ' BTC');
            return;
        }
    }

    if (orderType === 'market') {
        executeMarketOrder(currentSide, amount);
    } else {
        executeLimitOrder(currentSide, price, amount);
    }

    document.getElementById('orderAmount').value = '';
    document.getElementById('orderPrice').value = '';

    renderOrderBook();
    renderTrades();
    updatePortfolio(currentSide, amount, estimatedPrice);
}

function executeMarketOrder(side, amt) {
    let remaining = amt;
    const bookMap = side === 'buy' ? asks : bids;

    bookMap.sort(function (a, b) {
        return side === 'buy' ? a.price - b.price : b.price - a.price;
    });

    let kx = 0;
    while (remaining > 0 && kx < bookMap.length) {
        const ord = bookMap[kx];
        const filled = Math.min(remaining, ord.amount);

        addTrade(side, ord.price, filled, false, true);

        ord.amount -= filled;
        remaining -= filled;

        if (ord.amount <= 0) {
            bookMap.splice(kx, 1);
        } else {
            kx++;
        }
    }

    if (remaining > 0) {
        console.log('Partial fill, remaining:', remaining);
    }
}

function executeLimitOrder(side, px, amt) {
    const oppositeBook = side === 'buy' ? asks : bids;
    let remaining = amt;

    oppositeBook.sort(function (a, b) {
        return side === 'buy' ? a.price - b.price : b.price - a.price;
    });

    let zz = 0;
    while (remaining > 0 && zz < oppositeBook.length) {
        const ord = oppositeBook[zz];

        const canMatch = side === 'buy' ? px >= ord.price : px <= ord.price;

        if (!canMatch) break;

        const filled = Math.min(remaining, ord.amount);
        addTrade(side, ord.price, filled, false, true);

        ord.amount -= filled;
        remaining -= filled;

        if (ord.amount <= 0) {
            oppositeBook.splice(zz, 1);
        } else {
            zz++;
        }
    }

    if (remaining > 0) {
        const targetBook = side === 'buy' ? bids : asks;
        targetBook.push({ price: px, amount: remaining });
    }
}

function getBestPrice(side) {
    const book = side === 'buy' ? asks : bids;
    if (book.length === 0) return 42150;
    const sorted = book.sort(function (a, b) {
        return side === 'buy' ? a.price - b.price : b.price - a.price;
    });
    return sorted[0].price;
}

function addTrade(side, px, amt, updatePriceChart, isUserTrade) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString() + '.' + String(now.getMilliseconds()).padStart(3, '0');

    const trade = {
        side: side,
        price: px,
        amount: amt,
        time: timeStr,
        isUserTrade: isUserTrade
    };

    recentTrades.unshift(trade);
    if (recentTrades.length > 30) {
        recentTrades.pop();
    }

    if (updatePriceChart) {
        priceHistory.push(px);
        if (priceHistory.length > 50) {
            priceHistory.shift();
        }
    }
}

function renderOrderBook() {
    const asksDiv = document.getElementById('asksTable');
    const bidsDiv = document.getElementById('bidsTable');

    const sortedAsks = asks.slice().sort(function (a, b) {
        return a.price - b.price;
    });
    const sortedBids = bids.slice().sort(function (a, b) {
        return b.price - a.price;
    });

    let asksHTML = '';
    const topAsks = sortedAsks.slice(0, 10).reverse();
    for (let i = 0; i < topAsks.length; i++) {
        const ord = topAsks[i];
        asksHTML += '<div class="order-row"><span>' + ord.price.toFixed(2) + '</span><span>' + ord.amount.toFixed(4) + '</span></div>';
    }
    asksDiv.innerHTML = asksHTML;

    let bidsHTML = '';
    const topBids = sortedBids.slice(0, 10);
    for (let i = 0; i < topBids.length; i++) {
        const ord = topBids[i];
        bidsHTML += '<div class="order-row"><span>' + ord.price.toFixed(2) + '</span><span>' + ord.amount.toFixed(4) + '</span></div>';
    }
    bidsDiv.innerHTML = bidsHTML;

    updateSpread(sortedAsks, sortedBids);
}

function updateSpread(sortedAsks, sortedBids) {
    const spreadEl = document.getElementById('spreadVal');
    if (sortedAsks.length > 0 && sortedBids.length > 0) {
        const spread = sortedAsks[0].price - sortedBids[0].price;
        spreadEl.textContent = '$' + spread.toFixed(2);
    }
}

function renderTrades() {
    const tradesDiv = document.getElementById('tradesList');

    let tradesHTML = '';
    for (let i = 0; i < recentTrades.length; i++) {
        const t = recentTrades[i];
        const badge = t.isUserTrade ? ' <span class="user-badge">YOU</span>' : '';
        tradesHTML += '<div class="trade-item ' + t.side + '-trade">';
        tradesHTML += '<span>' + t.time + '</span>';
        tradesHTML += '<span>$' + t.price.toFixed(2) + '</span>';
        tradesHTML += '<span>' + t.amount.toFixed(4) + badge + '</span>';
        tradesHTML += '</div>';
    }
    tradesDiv.innerHTML = tradesHTML;
}

function updateChart() {
    const canvas = document.getElementById('priceChart');
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (priceHistory.length < 2) return;

    let minPrice = priceHistory[0];
    let maxPrice = priceHistory[0];
    for (let i = 1; i < priceHistory.length; i++) {
        if (priceHistory[i] < minPrice) minPrice = priceHistory[i];
        if (priceHistory[i] > maxPrice) maxPrice = priceHistory[i];
    }

    const range = maxPrice - minPrice || 1;

    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let idx = 0; idx < priceHistory.length; idx++) {
        const p = priceHistory[idx];
        const x = (idx / (priceHistory.length - 1)) * w;
        const y = h - ((p - minPrice) / range) * (h - 20) - 10;

        if (idx === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();

    ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
}

function updatePortfolio(side, amt, px) {
    if (side === 'buy') {
        userPortfolio.BTC += amt;
        userPortfolio.USD -= amt * px;
    } else {
        userPortfolio.BTC -= amt;
        userPortfolio.USD += amt * px;
    }
}

setSide('buy');
renderOrderBook();
renderTrades();
updateChart();

setInterval(function () {
    const rnd = Math.random();
    if (rnd < 0.4) {
        const fakeSide = Math.random() > 0.5 ? 'buy' : 'sell';
        const book = fakeSide === 'buy' ? asks : bids;

        if (book.length > 0) {
            book.sort(function (a, b) {
                return fakeSide === 'buy' ? a.price - b.price : b.price - a.price;
            });
            const fakePrice = book[0].price;
            const fakeAmt = 0.01 + Math.random() * 0.3;

            addTrade(fakeSide, fakePrice, fakeAmt, true, false);

            midPrice = fakePrice;

            renderTrades();
            updateChart();
        }
    }
}, 2500);

setInterval(function () {
    if (Math.random() > 0.6) {
        const addToAsks = Math.random() > 0.5;

        if (addToAsks && asks.length > 0) {
            asks.sort(function (a, b) {
                return b.price - a.price;
            });
            const topAsk = asks[0].price;
            const newOrder = {
                price: topAsk + 0.5 + Math.random() * 5,
                amount: 0.1 + Math.random() * 1.5
            };
            asks.push(newOrder);
        } else if (!addToAsks && bids.length > 0) {
            bids.sort(function (a, b) {
                return a.price - b.price;
            });
            const topBid = bids[0].price;
            const newOrder = {
                price: topBid - 0.5 - Math.random() * 5,
                amount: 0.1 + Math.random() * 1.5
            };
            bids.push(newOrder);
        }

        if (asks.length > 20) asks = asks.slice(0, 20);
        if (bids.length > 20) bids = bids.slice(0, 20);

        renderOrderBook();
    }
}, 4000);
