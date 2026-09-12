'use strict';

const EVM_ADDRESS  = '0x7b7860E60330b3363380fe33913F3eACc1737E56';
const BTC_ADDRESS  = 'bc1qkzlk3xwa6lxsakg0l028yl0aca76y0vl7a5jts';
const SOL_ADDRESS  = 'B9TRxqnagb6SoiLeJyr4XpvjjnKtZiUrFdZnDv8ycWzK';
const TRON_ADDRESS = 'TAVKuTfRhQafeLKS79x1jjGQBGrgwNtUz9';
const BASE_RPC     = 'https://mainnet.base.org';

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

rainToggleBtn?.addEventListener('click', () => applyRainState(!document.body.classList.contains('rain-off')));

function init() {
  initTickerLoop();
  initMoneyRain();
  fetchBaseBalance();
  setInterval(fetchBaseBalance, 30_000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
