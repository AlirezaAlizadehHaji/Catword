const ROWS = [
    ['`','1','2','3','4','5','6','7','8','9','0','-','='],
    ['Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],
    ['A','S','D','F','G','H','J','K','L',';',"'"],
    ['Z','X','C','V','B','N','M',',','.','/']
];

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
const LENGTH = 16;
const CAT_W = 88;
const CAT_H = 68;

let running = false;

function generatePassword() {
    const sets = [
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        'abcdefghijklmnopqrstuvwxyz',
        '0123456789',
        '!@#$%^&*()'
    ];
    const chars = [];
    const buf = new Uint32Array(LENGTH * 2 + 20);
    crypto.getRandomValues(buf);
    let i = 0;
    for (const s of sets) chars.push(s[buf[i++] % s.length]);
    while (chars.length < LENGTH) chars.push(CHARSET[buf[i++] % CHARSET.length]);
    for (let j = chars.length - 1; j > 0; j--) {
        const k = buf[i++] % (j + 1);
        [chars[j], chars[k]] = [chars[k], chars[j]];
    }
    return chars.join('');
}

function buildKeyboard() {
    const kb = document.getElementById('keyboard');
    kb.innerHTML = '';
    ROWS.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'key-row';
        row.forEach(label => {
            const key = document.createElement('div');
            key.className = 'key';
            key.textContent = label;
            rowEl.appendChild(key);
        });
        kb.appendChild(rowEl);
    });
}

function randomKeys(n) {
    const all = [...document.querySelectorAll('.key')];
    const buf = new Uint32Array(n);
    crypto.getRandomValues(buf);
    return Array.from(buf, v => all[v % all.length]);
}

function pressKey(el) {
    el.classList.add('pressed');
    setTimeout(() => el.classList.remove('pressed'), 300);
}

function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function run() {
    if (running) return;
    running = true;

    const btn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const toast = document.getElementById('copy-toast');
    const pwText = document.getElementById('password-text');
    const cursor = document.getElementById('cursor');
    const cat = document.getElementById('cat');
    const stage = document.getElementById('keyboard-stage');

    btn.disabled = true;
    copyBtn.classList.add('hidden');
    toast.classList.add('hidden');
    pwText.textContent = '';
    cursor.classList.remove('hidden');

    const password = generatePassword();
    const keys = randomKeys(LENGTH);

    cat.style.transition = 'none';
    cat.style.left = '-100px';
    cat.style.top = '5px';
    cat.classList.add('walking');

    await wait(30);

    const stageRect = stage.getBoundingClientRect();

    for (let i = 0; i < keys.length; i++) {
        const kr = keys[i].getBoundingClientRect();
        const targetLeft = kr.left - stageRect.left + kr.width / 2 - CAT_W / 2;
        const targetTop = kr.top - stageRect.top - CAT_H - 2;

        cat.style.transition = 'left 0.28s cubic-bezier(0.4,0,0.2,1), top 0.24s cubic-bezier(0.4,0,0.2,1)';
        cat.style.left = targetLeft + 'px';
        cat.style.top = targetTop + 'px';

        await wait(310);
        pressKey(keys[i]);
        pwText.textContent += password[i];
        await wait(130);
    }

    cat.style.transition = 'left 0.4s ease';
    cat.style.left = (stageRect.width + 30) + 'px';

    await wait(440);

    cat.classList.remove('walking');
    cat.style.transition = 'none';
    cat.style.left = '-100px';
    cat.style.top = '5px';

    cursor.classList.add('hidden');
    btn.disabled = false;
    copyBtn.classList.remove('hidden');

    copyBtn.onclick = () => {
        navigator.clipboard.writeText(password).then(() => {
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 1600);
        });
    };

    running = false;
}

buildKeyboard();
document.getElementById('generate-btn').addEventListener('click', run);
