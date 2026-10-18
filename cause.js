const C = window.CONFIG;
document.getElementById('title').textContent = `Chúc mừng sinh nhật ${C.name} 💖`;
const box = document.getElementById('reasons-container');
const btn = document.getElementById('nextBtn');
const counter = document.getElementById('counter');
let i = 0, busy = false;

// Tự động phát nhạc khi chạm vào trang
if (C.music) {
  const music = new Audio(C.music);
  music.loop = true;
  music.volume = 0.5;
  const startMusic = () => {
    music.play().catch(() => {});
    document.removeEventListener('click', startMusic);
    document.removeEventListener('touchstart', startMusic);
  };
  document.addEventListener('click', startMusic);
  document.addEventListener('touchstart', startMusic);
}

function addCard(r){
  const card = document.createElement('div');
  card.className = 'reason-card';
  card.innerHTML = `<div class="reason-text">${r.emoji} ${r.text}</div><div class="gif-overlay"><img src="${r.gif}" alt=""></div>`;
  card.addEventListener('click', () => card.classList.toggle('flip')); // chạm trên điện thoại
  box.appendChild(card);
  gsap.from(card, {opacity:0, y:50, duration:.5, ease:'back.out'});
  card.scrollIntoView({behavior:'smooth', block:'center'});
}

btn.addEventListener('click', () => {
  if(busy) return;
  if(i >= C.reasons.length){
    return gsap.to('body', {opacity:0, duration:1, onComplete:() => location.href = 'last.html'});
  }
  busy = true;
  gsap.fromTo(btn, {scale:.9}, {scale:1, duration:.3, ease:'elastic.out'});
  addCard(C.reasons[i]);
  i++;
  counter.textContent = `Lời chúc ${i} / ${C.reasons.length}`;
  floatBit();
  if(i === C.reasons.length){
    btn.textContent = 'Vào phần kỷ niệm 💫';
    btn.classList.add('story-mode');
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
setInterval(floatBit, 3000);