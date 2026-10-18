const C = window.CONFIG;

// Khởi tạo âm thanh phát liên tục
let bgMusic = null;
function playMusic() {
  if (!bgMusic && C.music) {
    bgMusic = new Audio(C.music);
    bgMusic.loop = true;
    bgMusic.volume = 0.5;
    bgMusic.play().catch(e => console.log("Cần tương tác để phát nhạc:", e));
  }
}

// Điền tên và lời chúc
document.querySelectorAll('.nm').forEach(e => e.textContent = C.name);
document.getElementById('wish').textContent = C.wish;

// Quản lý chuyển các màn
const stages = [...document.querySelectorAll('.stage')];
function show(i) {
  stages.forEach((s, k) => s.classList.toggle('on', k === i));
  stages[i].scrollTop = 0;
}

// Vệt sáng theo tay/chuột
const glow = document.getElementById('glow');
['mousemove','touchmove'].forEach(ev => addEventListener(ev, e => {
  const p = e.touches ? e.touches[0] : e;
  glow.style.setProperty('--x', p.clientX + 'px');
  glow.style.setProperty('--y', p.clientY + 'px');
}, {passive:true}));

// Hiệu ứng pháo giấy
const cv = document.getElementById('confetti'), cx = cv.getContext('2d');
let parts = [], running = false;
const fit = () => { cv.width = innerWidth; cv.height = innerHeight; };
fit(); addEventListener('resize', fit);
function burst(n = 150){
  const cols = ['#ff69b4','#ffc857','#8fd3ff','#b79bff','#9fffc9','#fff'];
  for(let i=0;i<n;i++) parts.push({x:innerWidth/2,y:innerHeight*.55,vx:(Math.random()-.5)*15,vy:-Math.random()*15-4,r:Math.random()*6+3,c:cols[i%cols.length],a:Math.random()*6});
  if(!running){ running = true; requestAnimationFrame(tick); }
}
function tick(){
  cx.clearRect(0,0,cv.width,cv.height);
  parts.forEach(p => { p.vy+=.35; p.vx*=.99; p.x+=p.vx; p.y+=p.vy; p.a+=.15;
    cx.fillStyle=p.c; cx.save(); cx.translate(p.x,p.y); cx.rotate(p.a); cx.fillRect(-p.r,-p.r/2,p.r*2,p.r); cx.restore(); });
  parts = parts.filter(p => p.y < cv.height+20);
  if(parts.length) requestAnimationFrame(tick); else { running=false; cx.clearRect(0,0,cv.width,cv.height); }
}

// Thổi nến
const cake = document.getElementById('cake');
let blown = false, micStream = null;
function blow(){
  if(blown) return; blown = true;
  if(micStream){ micStream.getTracks().forEach(t => t.stop()); micStream = null; }
  cake.classList.add('out');
  setTimeout(() => burst(), 400);
  setTimeout(() => { show(2); burst(80); }, 2400);
}

// Nút Bật đèn -> Bắt đầu phát nhạc không ngừng
document.getElementById('lightBtn').onclick = () => { 
  playMusic(); 
  document.body.classList.add('lit'); 
  setTimeout(() => show(1), 500); 
};
document.getElementById('blowBtn').onclick = blow;
cake.onclick = blow;

// Thổi micro
document.getElementById('micBtn').onclick = async function(){
  try{
    micStream = await navigator.mediaDevices.getUserMedia({audio:true});
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const an = ac.createAnalyser(); an.fftSize = 512;
    ac.createMediaStreamSource(micStream).connect(an);
    const buf = new Uint8Array(an.fftSize);
    this.textContent = 'Đang nghe… thổi đi nào 🌬️';
    (function listen(){
      if(blown) return;
      an.getByteTimeDomainData(buf);
      let s = 0; for(const v of buf) s += (v-128)*(v-128);
      if(Math.sqrt(s/buf.length) > 28) return blow();
      requestAnimationFrame(listen);
    })();
  }catch(e){ this.textContent = 'Không dùng được micro, hãy chạm vào nến'; }
};

// Chuyển từ Mở quà -> Lời chúc (Màn 3)
document.getElementById('openBtn').onclick = () => {
  burst();
  initCauseStage();
  show(3);
};

// Xử lý Lời chúc (Màn 3)
let causeIndex = 0, busy = false;
function initCauseStage() {
  document.getElementById('title').textContent = `Chúc mừng sinh nhật ${C.name} 💖`;
  const box = document.getElementById('reasons-container');
  box.innerHTML = '';
  causeIndex = 0;
  document.getElementById('counter').textContent = '';
  const btn = document.getElementById('nextBtn');
  btn.textContent = 'Bấm vào đây… 💕';
  btn.classList.remove('story-mode');
}

function addCard(r){
  const box = document.getElementById('reasons-container');
  const card = document.createElement('div');
  card.className = 'reason-card';
  card.innerHTML = `<div class="reason-text">${r.emoji} ${r.text}</div><div class="gif-overlay"><img src="${r.gif}" alt=""></div>`;
  card.addEventListener('click', () => card.classList.toggle('flip'));
  box.appendChild(card);
  gsap.from(card, {opacity:0, y:50, duration:.5, ease:'back.out'});
  card.scrollIntoView({behavior:'smooth', block:'center'});
}

const causeBtn = document.getElementById('nextBtn');
causeBtn.addEventListener('click', () => {
  if(busy) return;
  if(causeIndex >= C.reasons.length){
    initLastStage();
    show(4);
    return;
  }
  busy = true;
  gsap.fromTo(causeBtn, {scale:.9}, {scale:1, duration:.3, ease:'elastic.out'});
  addCard(C.reasons[causeIndex]);
  causeIndex++;
  document.getElementById('counter').textContent = `Lời chúc ${causeIndex} / ${C.reasons.length}`;
  floatBit();
  if(causeIndex === C.reasons.length){
    causeBtn.textContent = 'Vào phần kỷ niệm 💫';
    causeBtn.classList.add('story-mode');
  }
  setTimeout(() => busy = false, 500);
});

function floatBit(){
  const set = ['🌸','✨','💖','🦋','⭐'];
  for(let k=0;k<6;k++){
    const el = document.createElement('div');
    el.className = 'floating';
    el.textContent = set[Math.floor(Math.random()*set.length)];
    el.style.left = Math.random()*innerWidth + 'px';
    el.style.top = (innerHeight*.5 + Math.random()*innerHeight*.5) + 'px';
    el.style.fontSize = (Math.random()*20+14) + 'px';
    document.body.appendChild(el);
    gsap.to(el, {y:-400, opacity:0, duration:Math.random()*4+4, ease:'none', onComplete:() => el.remove()});
  }
}

// Xử lý Kỷ niệm (Màn 4) - Hiển thị từng ảnh khi chạm
let memIndex = 0;

function initLastStage() {
  document.getElementById('ft').textContent = C.finalTitle;
  document.getElementById('fx').innerHTML = C.finalText.map(t => `<p>${t}</p>`).join('') + `<p>— ${C.from}</p>`;
  
  const memoriesBox = document.getElementById('memories');
  memoriesBox.innerHTML = '';
  memIndex = 0;

  const finalSec = document.getElementById('finalSection');
  if (finalSec) finalSec.style.display = 'none';

  const memBtn = document.getElementById('nextMemoryBtn');
  if (memBtn) {
    memBtn.style.display = 'inline-block';
    memBtn.textContent = 'Chạm để xem kỷ niệm 💕';
  }

  // Tạo hiệu ứng tim bay
  const hs = document.getElementById('hearts'), set = ['💝','💖','💗','💓','💕'];
  hs.innerHTML = '';
  for(let i=0;i<14;i++){
    const h = document.createElement('div');
    h.className = 'heart'; h.textContent = set[i % set.length];
    h.style.left = Math.random()*100 + 'vw';
    h.style.setProperty('--d', (6 + Math.random()*6) + 's');
    h.style.setProperty('--l', (-Math.random()*8) + 's');
    h.style.setProperty('--x', (Math.random()*80 - 40) + 'px');
    hs.appendChild(h);
  }
}

function addMemoryCard(m) {
  const container = document.getElementById('memories');
  const card = document.createElement('div');
  card.className = 'memory-card';
  card.innerHTML = `
    <img class="memory-img" src="${m.img}" alt="${m.title}">
    <div class="memory-title">${m.title}</div>
    <div class="memory-caption">${m.caption}</div>
  `;
  container.appendChild(card);
  
  // Hiệu ứng xuất hiện mượt mà
  gsap.from(card, { opacity: 0, y: 40, scale: 0.95, duration: 0.6, ease: 'back.out(1.2)' });
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Bắt sự kiện chạm nút xem từng ảnh kỷ niệm
const nextMemBtn = document.getElementById('nextMemoryBtn');
if (nextMemBtn) {
  nextMemBtn.addEventListener('click', () => {
    if (memIndex < C.memories.length) {
      addMemoryCard(C.memories[memIndex]);
      memIndex++;
      if (memIndex === C.memories.length) {
        nextMemBtn.textContent = 'Xem lời nhắn gửi cuối 💖';
      } else {
        nextMemBtn.textContent = `Xem kỷ niệm tiếp theo (${memIndex}/${C.memories.length}) 💕`;
      }
      burst(50); // Pháo hoa nhỏ khi hiện từng ảnh
    } else {
      nextMemBtn.style.display = 'none';
      const finalSec = document.getElementById('finalSection');
      if (finalSec) {
        finalSec.style.display = 'block';
        gsap.from(finalSec, { opacity: 0, y: 30, duration: 0.8 });
        finalSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
        burst(120); // Pháo hoa màn kết
      }
    }
  });
}

// Nút chơi lại
document.getElementById('replayBtn').onclick = () => {
  blown = false;
  cake.classList.remove('out');
  show(1);
};