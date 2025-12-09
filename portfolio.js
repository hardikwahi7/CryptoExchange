let portfolio = {
    BTC: 0.5,
    ETH: 2.5,
    SOL: 15,
    USD: 10000
};

let activity = [
    { type: 'DEPOSIT', asset: 'USD', amount: 40675, price: 1, timestamp: new Date(Date.now() - 86400000).toISOString() },
    { type: 'BUY', asset: 'BTC', amount: 0.5, price: 42000, timestamp: new Date(Date.now() - 43200000).toISOString() },
    { type: 'BUY', asset: 'ETH', amount: 2.5, price: 3200, timestamp: new Date(Date.now() - 21600000).toISOString() },
    { type: 'BUY', asset: 'SOL', amount: 15, price: 95, timestamp: new Date(Date.now() - 10800000).toISOString() }
];

function loadPortfolio() {
    renderPortfolio();
    renderActivity();
}

function renderPortfolio() {
    const assetsList = document.getElementById('assetsList');
    const totalBalanceEl = document.getElementById('totalBalance');

    const prices = {
        BTC: globalPrices && globalPrices.btc ? globalPrices.btc : 42150,
        ETH: globalPrices && globalPrices.eth ? globalPrices.eth : 3245.50,
        SOL: 98.75,
        USD: 1
    };

    let totalValue = 0;
    let htmlContent = '';

    const assets = Object.keys(portfolio).sort();
    for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        const amt = portfolio[asset];
        const price = prices[asset] || 0;
        const value = amt * price;
        totalValue += value;

        htmlContent += '<div class="asset-item">';
        htmlContent += '<div class="asset-name">' + asset + '</div>';
        htmlContent += '<div class="asset-amount">' + amt.toFixed(4) + '</div>';
        htmlContent += '<div class="asset-value">$' + value.toFixed(2) + '</div>';
        htmlContent += '</div>';
    }

    assetsList.innerHTML = htmlContent;
    totalBalanceEl.textContent = '$' + totalValue.toFixed(2);
}

function renderActivity() {
    const activityList = document.getElementById('activityList');

    let htmlContent = '';
    const maxItems = activity.length < 10 ? activity.length : 10;

    for (let i = 0; i < maxItems; i++) {
        const act = activity[i];
        const date = new Date(act.timestamp);

        htmlContent += '<div class="activity-item">';
        htmlContent += '<div class="activity-type">' + act.type + ' ' + act.asset + '</div>';
        htmlContent += '<div class="activity-details">';
        htmlContent += 'Amount: ' + act.amount.toFixed(4) + ' | ';
        htmlContent += 'Price: $' + act.price.toFixed(2) + ' | ';
        htmlContent += date.toLocaleString();
        htmlContent += '</div>';
        htmlContent += '</div>';
    }

    activityList.innerHTML = htmlContent;
}

function quickDeposit() {
    const amt = prompt('Enter USD amount to deposit:');
    if (amt && !isNaN(amt) && parseFloat(amt) > 0) {
        portfolio.USD = portfolio.USD + parseFloat(amt);

        activity.unshift({
            type: 'DEPOSIT',
            asset: 'USD',
            amount: parseFloat(amt),
            price: 1,
            timestamp: new Date().toISOString()
        });

        loadPortfolio();
    }
}

function quickWithdraw() {
    const amt = prompt('Enter USD amount to withdraw:');
    if (amt && !isNaN(amt) && parseFloat(amt) > 0) {
        if (portfolio.USD >= parseFloat(amt)) {
            portfolio.USD -= parseFloat(amt);

            activity.unshift({
                type: 'WITHDRAW',
                asset: 'USD',
                amount: parseFloat(amt),
                price: 1,
                timestamp: new Date().toISOString()
            });

            loadPortfolio();
        } else {
            alert('Insufficient balance');
        }
    }
}

function quickRefresh() {
    loadPortfolio();
    console.log('Portfolio refreshed');
}

loadPortfolio();

setInterval(function () {
    renderPortfolio();
}, 3000);
