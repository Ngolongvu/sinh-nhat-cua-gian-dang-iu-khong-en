const C = window.CONFIG;
document.getElementById('ft').textContent = C.finalTitle;
document.getElementById('fx').innerHTML = C.finalText.map(t => `<p>${t}</p>`).join('') + `<p>— ${C.from}</p>`;
document.getElementById('memories').innerHTML = C.memories.map(m =>
  `<div class="memory-card"><img class="memory-img" src="${m.img}" alt="${m.title}"><div class="memory-title">${m.title}</div><div class="memory-caption">${m.caption}</div></div>`).join('');

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

// hiện dần khi cuộn tới
const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold:.15});
document.querySelectorAll('.memory-card').forEach(c => io.observe(c));

// tim bay
const hs = document.getElementById('hearts'), set = ['💝','💖','💗','💓','💕'];
for(let i=0;i<14;i++){
  const h = document.createElement('div');
  h.className = 'heart'; h.textContent = set[i % set.length];
  h.style.left = Math.random()*100 + 'vw';
  h.style.setProperty('--d', (6 + Math.random()*6) + 's');
  h.style.setProperty('--l', (-Math.random()*8) + 's');
  h.style.setProperty('--x', (Math.random()*80 - 40) + 'px');
  hs.appendChild(h);
}