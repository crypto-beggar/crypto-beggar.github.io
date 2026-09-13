'use strict';

const EVM_ADDRESS  = '0x7b7860E60330b3363380fe33913F3eACc1737E56';
const BTC_ADDRESS  = 'bc1qkzlk3xwa6lxsakg0l028yl0aca76y0vl7a5jts';
const SOL_ADDRESS  = 'B9TRxqnagb6SoiLeJyr4XpvjjnKtZiUrFdZnDv8ycWzK';
const TRON_ADDRESS = 'TAVKuTfRhQafeLKS79x1jjGQBGrgwNtUz9';
const BASE_RPC     = 'https://mainnet.base.org';
const ETH_RPC      = 'https://ethereum-rpc.publicnode.com';
const SOL_RPC      = 'https://api.mainnet-beta.solana.com';

const TIERS = [
  { id: 1, name: 'The Crushed Paper Cup',      min: 0,    max: 50   },
  { id: 2, name: 'The Soggy Cardboard Box',    min: 50,   max: 250  },
  { id: 3, name: 'The Rusty Metal Bucket',     min: 250,  max: 1000 },
  { id: 4, name: 'The Industrial Wheelbarrow', min: 1000, max: 5000 },
  { id: 5, name: 'The Offshore Vault',         min: 5000, max: Infinity }
];

const TIER_COUNTDOWN_COPY = [
  '',
  (rem) => `$${rem} more and the cup becomes a box. Progress.`,
  (rem) => `$${rem} until a rust bucket replaces the soggy cardboard.`,
  (rem) => `$${rem} to upgrade to industrial-grade begging.`,
  (rem) => `$${rem} to launder this into an offshore vault.`,
  ()    => 'The vault is full. Congratulations, you are simply a beggar with a vault.'
];

const LEADERBOARD_TITLES = [
  'CHIEF PHILANTHROPIST',
  'ABSOLVED FOR MEMECOIN DUMPING',
  'EXPENSIVE PITY',
  'EXIT LIQUIDITY PROVIDER',
  'VOLUNTARILY REKT'
];

const VACANT_COPY = [
  '[VACANT — ARE YOU TOO BROKE TO CLAIM THIS?]',
  '[AWAITING GUILTY WHALE]',
  '[EMPTY — RETAIL WAILS DETECTED]',
  '[SLOT RESERVED FOR SOMEONE ASHAMED]',
  '[PROBABLY YOU, READING THIS RIGHT NOW]'
];

const BLOCKSCOUT_CHAINS = [
  { name: 'Base',     base: 'https://base.blockscout.com'     },
  { name: 'ETH',      base: 'https://eth.blockscout.com'      },
  { name: 'Arbitrum', base: 'https://arbitrum.blockscout.com' },
  { name: 'Optimism', base: 'https://optimism.blockscout.com' },
  { name: 'Polygon',  base: 'https://polygon.blockscout.com'  }
];

let cachedPrices      = { eth: 0, btc: 0, sol: 0, trx: 0 };
let cachedTotalUSD    = 0;
let currentTierIndex  = 0;
let prevFillPct       = 0;
let celebrationActive = false;

const savedTier = (() => { try { return parseInt(localStorage.getItem('beggar-tier') || '0', 10); } catch { return 0; } })();

const SLOGANS = [
  { line1: 'SKIP THE RUG PULL.',       line2: 'JUST SEND IT.',      sub: "At least I won't pretend I have a roadmap." },
  { line1: 'NO UTILITY.',              line2: 'JUST ASKING.',       sub: 'The most honest transaction in decentralized finance.' },
  { line1: 'TOO PROUD TO SCAM.',       line2: 'NOT TO BEG.',        sub: 'Digital cardboard. Real wallet.' },
  { line1: 'WHY LIE?',                 line2: 'I JUST WANT MONEY.', sub: 'No whitepaper. No artificial AI agents. Just an open hand.' },
  { line1: 'PROOF OF PITY.',           line2: 'ON-CHAIN.',          sub: 'A consensus mechanism based entirely on digital charity.' },
  { line1: 'ANYTHING HELPS.',          line2: 'GOD BLESS.',         sub: 'Spare some gas for an honest digital beggar.' },
  { line1: 'THE ONLY HONEST LOSS',     line2: 'IN WEB3.',           sub: 'Zero ROI guaranteed from day one.' }
];

let sloganIndex = 0;
const sloganHeading = document.getElementById('hero-slogan');
const sloganIntro   = document.getElementById('hero-sub');

function rotateSlogan() {
  if (!sloganHeading || !sloganIntro) return;
  sloganHeading.classList.add('is-changing');
  sloganIntro.classList.add('is-changing');
  setTimeout(() => {
    sloganIndex = (sloganIndex + 1) % SLOGANS.length;
    const { line1, line2, sub } = SLOGANS[sloganIndex];
    sloganHeading.innerHTML = `<span class="line-black">${line1}</span><span class="line-red">${line2}</span>`;
    sloganIntro.textContent = sub;
    sloganHeading.classList.remove('is-changing');
    sloganIntro.classList.remove('is-changing');
  }, 250);
}

setInterval(rotateSlogan, 10000);

function initTickerLoop() {
  const track = document.querySelector('.ticker-track');
  if (!track) return;
  Array.from(track.children).forEach(child => track.appendChild(child.cloneNode(true)));
}

const RAIN_DENOMINATIONS = [
  { value: '$0',     text: 'ONE WEI',      sub: 'BACKED BY NOTHING'      },
  { value: '0 WEI',  text: 'ZERO ETH',     sub: 'ZERO LEGAL TENDER'      },
  { value: '1 SAT',  text: 'DIGITAL DUST', sub: 'PROOF OF PITY'          },
  { value: '$0.00',  text: 'NO UTILITY',   sub: 'NOT FINANCIAL ADVICE'   },
  { value: 'DUST',   text: 'ONE LOSS',     sub: 'DOWN ONLY FOREVER'      },
  { value: '0x0',    text: 'NULL VALUE',   sub: 'UNAUDITED UNINSURED'    },
  { value: '1 WEI',  text: 'SPARE GAS',   sub: 'GOD BLESS YOU'          },
  { value: '$0.00',  text: 'STILL BROKE', sub: 'HONEST DISAPPOINTMENT'  }
];

function initMoneyRain() {
  const container = document.getElementById('money-rain');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 22; i++) {
    const bill     = document.createElement('div');
    bill.className = 'falling-bill';
    const d        = RAIN_DENOMINATIONS[i % RAIN_DENOMINATIONS.length];
    const serial   = `${Math.random().toString(16).slice(2,6).toUpperCase()}${Math.random().toString(16).slice(2,6).toUpperCase()} · BEGGAR · ${new Date().getFullYear()}`;
    bill.innerHTML = `
      <div class="bill-top">
        <span class="bill-denom">${d.value}</span>
        <span class="bill-title">BEGGAR FEDERAL RESERVE NOTE</span>
        <span class="bill-denom">${d.value}</span>
      </div>
      <div class="bill-mid">
        <div class="bill-portrait">B</div>
        <div class="bill-text">
          <span class="bill-value">${d.text}</span>
          <span class="bill-sub">${d.sub}</span>
        </div>
      </div>
      <div class="bill-bot">
        <span class="bill-serial">${serial}</span>
        <span class="bill-mandate">NOT A SECURITY</span>
      </div>`;
    const leftPos  = Math.random() * 88;
    const duration = 10 + Math.random() * 12;
    const delay    = Math.random() * 20;
    const rotStart = (Math.random() * 22 - 11).toFixed(1) + 'deg';
    const rotEnd   = (Math.random() * 30 - 15).toFixed(1) + 'deg';
    bill.style.left              = `${leftPos}vw`;
    bill.style.animationDuration = `${duration}s`;
    bill.style.animationDelay   = `-${delay}s`;
    bill.style.setProperty('--rot-start', rotStart);
    bill.style.setProperty('--rot-end',   rotEnd);
    container.appendChild(bill);
  }
}

async function fetchPrices() {
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,solana,tron&vs_currencies=usd');
    const d = await r.json();
    cachedPrices.eth = d?.ethereum?.usd || 0;
    cachedPrices.btc = d?.bitcoin?.usd  || 0;
    cachedPrices.sol = d?.solana?.usd   || 0;
    cachedPrices.trx = d?.tron?.usd     || 0;
  } catch (e) {
    console.warn('[BEGGAR] Price fetch failed:', e);
  }
}

async function rpcGetBalance(rpcUrl, address) {
  try {
    const r = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getBalance', params: [address, 'latest'], id: 1 })
    });
    const { result } = await r.json();
    return BigInt(result);
  } catch { return 0n; }
}

async function fetchBtcBalance() {
  try {
    const r = await fetch(`https://blockstream.info/api/address/${BTC_ADDRESS}`);
    const d = await r.json();
    const sats = BigInt((d?.chain_stats?.funded_txo_sum || 0) - (d?.chain_stats?.spent_txo_sum || 0));
    return Number(sats) / 1e8;
  } catch { return 0; }
}

async function fetchSolBalance() {
  try {
    const r = await fetch(SOL_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'getBalance', params: [SOL_ADDRESS], id: 1 })
    });
    const { result } = await r.json();
    return (result?.value || 0) / 1e9;
  } catch { return 0; }
}

async function fetchTronBalance() {
  try {
    const r = await fetch(`https://api.trongrid.io/v1/accounts/${TRON_ADDRESS}`);
    const d = await r.json();
    const sun = d?.data?.[0]?.balance || 0;
    return sun / 1e6;
  } catch { return 0; }
}

async function fetchAllBalancesUSD() {
  const [baseWei, ethWei, btcBal, solBal, trxBal] = await Promise.all([
    rpcGetBalance(BASE_RPC, EVM_ADDRESS),
    rpcGetBalance(ETH_RPC,  EVM_ADDRESS),
    fetchBtcBalance(),
    fetchSolBalance(),
    fetchTronBalance()
  ]);

  const divisor = 1_000_000_000_000_000_000n;
  const baseEth = Number(baseWei) / 1e18;
  const mainEth = Number(ethWei)  / 1e18;
  const totalEth = baseEth + mainEth;

  const usd =
    totalEth * cachedPrices.eth +
    btcBal   * cachedPrices.btc +
    solBal   * cachedPrices.sol +
    trxBal   * cachedPrices.trx;

  const statBalEl    = document.getElementById('stat-balance');
  const statWeiEl    = document.getElementById('stat-wei');
  const statUpdateEl = document.getElementById('stat-last-update');
  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (statBalEl)    statBalEl.textContent    = `${baseEth.toFixed(6)} ETH`;
  if (statWeiEl)    statWeiEl.textContent    = `${baseWei.toLocaleString('en-US')} WEI`;
  if (statUpdateEl) statUpdateEl.textContent = timeStr;

  return usd;
}

function getTier(usd) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (usd >= TIERS[i].min) return i;
  }
  return 0;
}

function setFillRect(tierIdx, pct) {
  const rect = document.getElementById(`fill-rect-${tierIdx + 1}`);
  if (!rect) return;
  const y = 200 * (1 - pct);
  const h = 200 * pct;
  rect.setAttribute('y', y.toFixed(2));
  rect.setAttribute('height', h.toFixed(2));
}

function showContainerSvg(tierIdx) {
  for (let i = 0; i < TIERS.length; i++) {
    const el = document.getElementById(`tier-svg-${i + 1}`);
    if (!el) continue;
    el.classList.toggle('is-hidden', i !== tierIdx);
  }
}

function triggerCelebration(fromTierIdx, toTierIdx) {
  if (celebrationActive) return;
  celebrationActive = true;

  const svg = document.getElementById(`tier-svg-${fromTierIdx + 1}`);

  if (svg) {
    svg.classList.add('is-shaking');
    svg.addEventListener('animationend', () => svg.classList.remove('is-shaking'), { once: true });
  }

  spawnConfetti();

  setTimeout(() => {
    const overlay = document.getElementById('celebration-overlay');
    if (overlay) {
      overlay.setAttribute('aria-hidden', 'false');
      overlay.classList.add('is-active');
    }
  }, 400);

  setTimeout(() => {
    const overlay = document.getElementById('celebration-overlay');
    if (overlay) {
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden', 'true');
    }

    currentTierIndex = toTierIdx;
    showContainerSvg(toTierIdx);

    const carryPct = toTierIdx < TIERS.length - 1
      ? (cachedTotalUSD - TIERS[toTierIdx].min) / (TIERS[toTierIdx].max - TIERS[toTierIdx].min)
      : 1;

    setFillRect(toTierIdx, Math.max(0, Math.min(1, carryPct)));
    renderTierUI(toTierIdx, cachedTotalUSD);

    try { localStorage.setItem('beggar-tier', String(toTierIdx)); } catch {}
    celebrationActive = false;
  }, 2900);
}

function spawnConfetti() {
  const stage = document.getElementById('container-stage');
  if (!stage) return;
  const rect = stage.getBoundingClientRect();
  const cx   = rect.left + rect.width  / 2;
  const cy   = rect.top  + rect.height / 2;

  for (let i = 0; i < 36; i++) {
    const el    = document.createElement('div');
    el.className = 'confetti-particle';
    el.textContent = '$0';
    const angle  = (Math.random() * Math.PI * 2);
    const dist   = 120 + Math.random() * 280;
    const flyX   = (Math.cos(angle) * dist).toFixed(0) + 'px';
    const flyY   = (Math.sin(angle) * dist - 60).toFixed(0) + 'px';
    const flyR   = (Math.random() * 720 - 360).toFixed(0) + 'deg';
    const flyDur = (0.8 + Math.random() * 0.8).toFixed(2) + 's';
    el.style.left    = (cx - 45) + 'px';
    el.style.top     = (cy - 19) + 'px';
    el.style.setProperty('--fly-x', flyX);
    el.style.setProperty('--fly-y', flyY);
    el.style.setProperty('--fly-r', flyR);
    el.style.setProperty('--fly-dur', flyDur);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
}

function renderTierUI(tierIdx, usd) {
  const tier      = TIERS[tierIdx];
  const badgeEl   = document.getElementById('tier-badge');
  const nameEl    = document.getElementById('tier-name');
  const fillEl    = document.getElementById('progress-fill');
  const pctEl     = document.getElementById('progress-pct');
  const trackEl   = document.getElementById('progress-track');
  const copyEl    = document.getElementById('countdown-copy');
  const jarUsdEl  = document.getElementById('jar-usd');

  if (jarUsdEl) jarUsdEl.textContent = '$' + usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const isLast = tier.max === Infinity;
  const pct    = isLast ? 1 : Math.max(0, Math.min(1, (usd - tier.min) / (tier.max - tier.min)));
  const pctStr = (pct * 100).toFixed(1) + '%';

  if (badgeEl)  badgeEl.textContent  = `TIER ${tier.id}`;
  if (nameEl)   nameEl.textContent   = tier.name;
  if (fillEl)   fillEl.style.width   = pctStr;
  if (pctEl)    pctEl.textContent    = pctStr;
  if (trackEl) {
    trackEl.setAttribute('aria-valuenow', (pct * 100).toFixed(0));
  }

  if (copyEl) {
    if (isLast) {
      copyEl.textContent = TIER_COUNTDOWN_COPY[5]();
    } else {
      const remaining = (tier.max - usd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      copyEl.textContent = TIER_COUNTDOWN_COPY[tier.id](remaining);
    }
  }
}

async function updateTipJar() {
  const usd = await fetchAllBalancesUSD();
  cachedTotalUSD = usd;

  const newTierIdx  = getTier(usd);

  if (!celebrationActive) {
    if (newTierIdx > currentTierIndex) {
      const currentTier = TIERS[currentTierIndex];
      const isLast      = currentTier.max === Infinity;
      const fillPct     = isLast ? 1 : Math.max(0, Math.min(1, (usd - currentTier.min) / (currentTier.max - currentTier.min)));
      setFillRect(currentTierIndex, 1);
      renderTierUI(currentTierIndex, usd);
      setTimeout(() => triggerCelebration(currentTierIndex, newTierIdx), 600);
      prevFillPct = fillPct;
    } else {
      if (newTierIdx !== currentTierIndex) {
        currentTierIndex = newTierIdx;
        showContainerSvg(currentTierIndex);
        try { localStorage.setItem('beggar-tier', String(currentTierIndex)); } catch {}
      }
      const currentTier = TIERS[currentTierIndex];
      const isLast      = currentTier.max === Infinity;
      const fillPct     = isLast ? 1 : Math.max(0, Math.min(1, (usd - currentTier.min) / (currentTier.max - currentTier.min)));
      setFillRect(currentTierIndex, fillPct);
      renderTierUI(currentTierIndex, usd);
      prevFillPct = fillPct;
    }
  }
}

async function fetchLeaderboard() {
  const results = await Promise.allSettled(
    BLOCKSCOUT_CHAINS.map(async ({ base }) => {
      const url = `${base}/api/v2/addresses/${EVM_ADDRESS}/transactions?filter=to&limit=50`;
      const r   = await fetch(url);
      const d   = await r.json();
      return (d.items || []).filter(tx => tx.status === 'ok' && BigInt(tx.value || '0') > 0n);
    })
  );

  const donors = new Map();

  results.forEach(result => {
    if (result.status !== 'fulfilled') return;
    result.value.forEach(tx => {
      const from  = tx.from?.hash?.toLowerCase();
      const value = BigInt(tx.value || '0');
      if (!from) return;
      donors.set(from, (donors.get(from) || 0n) + value);
    });
  });

  const sorted = [...donors.entries()]
    .sort((a, b) => (b[1] > a[1] ? 1 : -1))
    .slice(0, 5);

  renderLeaderboard(sorted);
}

function abbrev(addr) {
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

function renderLeaderboard(sorted) {
  const body = document.getElementById('leaderboard-body');
  if (!body) return;

  const rows = [];

  for (let i = 0; i < 5; i++) {
    const entry = sorted[i];
    if (!entry) {
      rows.push(`
        <tr class="vacant-row">
          <td class="rank-cell${i === 0 ? ' rank-1' : ''}">#${i + 1}</td>
          <td colspan="3" class="vacant-slot">${VACANT_COPY[i]}</td>
        </tr>`);
    } else {
      const [addr, weiTotal] = entry;
      const eth  = Number(weiTotal) / 1e18;
      const usd  = eth * cachedPrices.eth;
      const ethStr = eth.toFixed(6) + ' ETH';
      const usdStr = '$' + usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      rows.push(`
        <tr>
          <td class="rank-cell${i === 0 ? ' rank-1' : ''}">#${i + 1}</td>
          <td class="donor-cell"><span class="donor-hex">${abbrev(addr)}</span></td>
          <td class="total-cell">
            <span class="total-eth">${ethStr}</span>
            <span class="total-usd">${usdStr}</span>
          </td>
          <td><span class="status-badge badge-${i + 1}">${LEADERBOARD_TITLES[i]}</span></td>
        </tr>`);
    }
  }

  body.innerHTML = rows.join('');
}

async function fetchBaseBalance() {
  const balEl    = document.getElementById('stat-balance');
  const weiEl    = document.getElementById('stat-wei');
  const updateEl = document.getElementById('stat-last-update');
  try {
    const res = await fetch(BASE_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getBalance', params: [EVM_ADDRESS, 'latest'], id: 1 })
    });
    const { result } = await res.json();
    const weiBig  = BigInt(result);
    const divisor = 1_000_000_000_000_000_000n;
    const ethInt  = weiBig / divisor;
    const ethFrac = (weiBig % divisor).toString().padStart(18, '0').slice(0, 6);
    const ethStr  = `${ethInt}.${ethFrac} ETH`;
    const weiStr  = weiBig.toLocaleString('en-US') + ' WEI';
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (balEl)    balEl.textContent    = ethStr;
    if (weiEl)    weiEl.textContent    = weiStr;
    if (updateEl) updateEl.textContent = timeStr;
  } catch (err) {
    console.warn('[BEGGAR] RPC fetch failed:', err);
    const b = document.getElementById('stat-balance');
    if (b && b.textContent === '—') b.textContent = 'RPC error';
  }
}

const copyText = async (value, button, defaultLabel = 'Copy address') => {
  if (!value || value === 'WALLET_NOT_DEPLOYED') return;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
    } else {
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;pointer-events:none;';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    button.textContent = 'Copied!';
    setTimeout(() => { button.textContent = defaultLabel; }, 1600);
  } catch (err) {
    console.error('[BEGGAR] Copy failed:', err);
  }
};

document.querySelector('#copy-wallet')?.addEventListener('click', function () {
  copyText(document.querySelector('#wallet-address')?.textContent?.trim(), this, 'Copy address');
});

document.querySelectorAll('.chain-card').forEach(card => {
  const codeEl = card.querySelector('code');
  const btn    = card.querySelector('.chain-copy');
  btn?.addEventListener('click', () => {
    copyText(codeEl?.dataset.address || codeEl?.textContent?.trim(), btn, 'Copy');
  });
});

const CHAIN_DATA = {
  evm: {
    name: 'EVM FAMILY', address: EVM_ADDRESS, qrValue: EVM_ADDRESS,
    links: [
      { label: 'MetaMask · Base',      url: `https://metamask.app.link/send/${EVM_ADDRESS}@8453` },
      { label: 'MetaMask · Ethereum',  url: `https://metamask.app.link/send/${EVM_ADDRESS}@1`    },
      { label: 'Coinbase Wallet',      url: `https://go.cb-wallet.com/send?chain=base&address=${EVM_ADDRESS}` },
      { label: 'Rainbow',              url: `https://rainbow.me/send?address=${EVM_ADDRESS}`      },
      { label: 'EVM URI (any wallet)', url: `ethereum:${EVM_ADDRESS}`                            }
    ]
  },
  btc: {
    name: 'BITCOIN', address: BTC_ADDRESS, qrValue: `bitcoin:${BTC_ADDRESS}`,
    links: [
      { label: 'Bitcoin URI (any wallet)', url: `bitcoin:${BTC_ADDRESS}`                      },
      { label: 'BlueWallet',              url: `bluewallet:bitcoin:${BTC_ADDRESS}`             },
      { label: 'Mempool.space',           url: `https://mempool.space/address/${BTC_ADDRESS}`  }
    ]
  },
  sol: {
    name: 'SOLANA', address: SOL_ADDRESS, qrValue: `solana:${SOL_ADDRESS}`,
    links: [
      { label: 'Phantom',                  url: `https://phantom.app/ul/v1/transfer?destination=${SOL_ADDRESS}` },
      { label: 'Solflare',                 url: `https://solflare.com/send?to=${SOL_ADDRESS}`                   },
      { label: 'Solana URI (any wallet)',  url: `solana:${SOL_ADDRESS}`                                         }
    ]
  },
  tron: {
    name: 'TRON', address: TRON_ADDRESS, qrValue: `tron:${TRON_ADDRESS}`,
    links: [
      { label: 'TronLink',              url: `tronlink://send?to=${TRON_ADDRESS}` },
      { label: 'Tron URI (any wallet)', url: `tron:${TRON_ADDRESS}`               }
    ]
  }
};

const qrModal       = document.getElementById('qr-modal');
const modalCloseBtn = document.getElementById('modal-close');
const modalNameEl   = document.getElementById('modal-chain-name');
const modalAddrEl   = document.getElementById('modal-address');
const modalCopyBtn  = document.getElementById('modal-copy');
const qrCanvasEl    = document.getElementById('qr-canvas');
const sendGridEl    = document.getElementById('quick-send-grid');

function renderQR(value) {
  if (!qrCanvasEl) return;
  qrCanvasEl.innerHTML = '';
  if (typeof QRCode !== 'undefined') {
    new QRCode(qrCanvasEl, { text: value, width: 200, height: 200, colorDark: '#171717', colorLight: '#f2efe8', correctLevel: QRCode.CorrectLevel.M });
  } else {
    qrCanvasEl.innerHTML = '<p class="modal-note" style="padding:40px 0;">QR library unavailable.<br>Copy the address above.</p>';
  }
}

function renderSendGrid(links) {
  if (!sendGridEl) return;
  sendGridEl.innerHTML = links.map(({ label, url }) =>
    `<a class="send-btn" href="${url}" target="_blank" rel="noopener noreferrer"><span class="send-btn-label">${label}</span><span class="send-btn-arrow" aria-hidden="true">↗</span></a>`
  ).join('');
}

function switchTab(tabName) {
  document.querySelectorAll('.modal-tab').forEach(tab => {
    const active = tab.dataset.tab === tabName;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('tab-hidden', panel.id !== `tab-${tabName}`);
  });
}

function openModal(chainKey) {
  const chain = CHAIN_DATA[chainKey];
  if (!chain || !qrModal) return;
  if (modalNameEl) modalNameEl.textContent = chain.name;
  if (modalAddrEl) modalAddrEl.textContent = chain.address;
  switchTab('qr');
  renderQR(chain.qrValue);
  renderSendGrid(chain.links);
  qrModal.showModal();
}

document.querySelectorAll('.modal-tab').forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));
document.querySelectorAll('[data-qr-chain]').forEach(btn => btn.addEventListener('click', () => openModal(btn.dataset.qrChain)));
modalCloseBtn?.addEventListener('click', () => qrModal?.close());
qrModal?.addEventListener('click', e => { if (e.target === qrModal) qrModal.close(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') qrModal?.close(); });
modalCopyBtn?.addEventListener('click', function () { copyText(modalAddrEl?.textContent?.trim(), this, 'Copy'); });

const rainToggleBtn   = document.getElementById('toggle-rain');
const rainToggleLabel = rainToggleBtn?.querySelector('.rain-toggle-label');

function applyRainState(isOff) {
  document.body.classList.toggle('rain-off', isOff);
  if (rainToggleLabel) rainToggleLabel.textContent = isOff ? 'RAIN: OFF' : 'RAIN: ON';
  try { localStorage.setItem('beggar-rain-off', isOff ? '1' : '0'); } catch (_) {}
}

(function () {
  try { if (localStorage.getItem('beggar-rain-off') === '1') applyRainState(true); } catch (_) {}
})();

function dismissRainHint() {
  const hint = document.getElementById('rain-hint');
  if (!hint || hint.classList.contains('is-fading') || hint.classList.contains('is-gone')) return;
  hint.classList.add('is-fading');
  setTimeout(() => hint.classList.add('is-gone'), 2000);
  try { localStorage.setItem('beggar-hint-seen', '1'); } catch {}
}

function initRainHint() {
  const hint = document.getElementById('rain-hint');
  if (!hint) return;
  try {
    if (localStorage.getItem('beggar-hint-seen') === '1' || localStorage.getItem('beggar-rain-off') === '1') {
      hint.classList.add('is-gone');
      return;
    }
  } catch {}
  setTimeout(dismissRainHint, 10_000);
}

rainToggleBtn?.addEventListener('click', () => {
  applyRainState(!document.body.classList.contains('rain-off'));
  dismissRainHint();
});

async function init() {
  initTickerLoop();
  initMoneyRain();
  initRainHint();

  currentTierIndex = Math.min(savedTier, TIERS.length - 1);
  showContainerSvg(currentTierIndex);

  await fetchPrices();
  await updateTipJar();
  fetchBaseBalance();
  fetchLeaderboard();

  setInterval(updateTipJar, 5_000);
  setInterval(fetchBaseBalance, 5_000);
  setInterval(fetchPrices, 60_000);
  setInterval(fetchLeaderboard, 120_000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
