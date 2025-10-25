/* Mocked analysis flow for Neko demo */
const fileInput = document.getElementById('fileInput');
const useSample = document.getElementById('useSample');
const progressArea = document.getElementById('progressArea');
const progressFill = document.getElementById('progressFill');
const dots = document.getElementById('dots');
const summary = document.getElementById('summary');
const summaryList = document.getElementById('summaryList');
const resetBtn = document.getElementById('resetBtn');
const floorImage = document.getElementById('floorImage');
const canvas = document.getElementById('floorCanvas');
const ctx = canvas.getContext('2d');
const dataGrid = document.getElementById('dataGrid');

let dotCount = 0;
let animTimer = null;

function startDots(){
  animTimer = setInterval(()=>{
    dotCount = (dotCount+1)%4;
    dots.textContent = '.'.repeat(dotCount);
  },400);
}
function stopDots(){ clearInterval(animTimer); dots.textContent='.'; }

function resetUI(){
  progressArea.hidden = true;
  summary.hidden = true;
  dataGrid.innerHTML = '';
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // redraw sample baseline
  drawImageToCanvas(floorImage);
}

function simulateUploadAndAnalyze(imageSrc){
  progressArea.hidden = false;
  progressFill.style.width = '0%';
  startDots();

  // simulate upload progress
  let p = 0;
  const uploadInterval = setInterval(()=>{
    p += Math.floor(Math.random()*12)+8;
    if(p>100) p=100;
    progressFill.style.width = p + '%';
    if(p>=100){
      clearInterval(uploadInterval);
      // small delay then show results
      setTimeout(()=>{
        stopDots();
        showMockResults();
      },800);
    }
  }, 180);
}

function showMockResults(){
  // show overlay and populate side panel with fake structured data
  summary.hidden = false;
  summaryList.innerHTML = '';
  const rooms = [
    {name:'Living Room', area:'28.3 m²', bbox:[60,60,520,340]},
    {name:'Kitchen', area:'20.1 m²', bbox:[590,60,1120,290]},
    {name:'Bedroom', area:'14.6 m²', bbox:[60,390,380,740]},
    {name:'Bathroom', area:'6.8 m²', bbox:[430,390,780,740]},
    {name:'Office', area:'10.2 m²', bbox:[840,390,1120,740]}
  ];

  rooms.forEach(r=>{
    const li = document.createElement('li');
    li.textContent = `${r.name} — ${r.area}`;
    summaryList.appendChild(li);
  });

  // Draw overlays
  drawImageToCanvas(floorImage, ()=>{
    // room fills
    rooms.forEach(r=>{
      ctx.save();
      ctx.fillStyle = 'rgba(46,204,113,0.14)';
      ctx.strokeStyle = 'rgba(46,204,113,0.9)';
      ctx.lineWidth = 3;
      ctx.fillRect(...r.bbox);
      ctx.strokeRect(...r.bbox);
      ctx.restore();
    });

    // doors (orange lines)
    ctx.save();
    ctx.strokeStyle = 'rgba(255,165,0,0.95)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(320,350); ctx.lineTo(350,350);
    ctx.moveTo(420,380); ctx.lineTo(420,410);
    ctx.stroke();
    ctx.restore();

    // windows (blue small lines)
    ctx.save();
    ctx.strokeStyle = 'rgba(59,130,246,0.95)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(70,55); ctx.lineTo(520,55);
    ctx.moveTo(600,55); ctx.lineTo(1120,55);
    ctx.stroke();
    ctx.restore();

    // populate structured data cards
    dataGrid.innerHTML = '';
    rooms.forEach(r=>{
      const card = document.createElement('div');
      card.className = 'data-card';
      card.innerHTML = `<strong>${r.name}</strong><div>Area: ${r.area}</div><div>Suggested use: ${suggestUse(r.name)}</div>`;
      dataGrid.appendChild(card);
    });
  });
}

function suggestUse(name){
  if(name.toLowerCase().includes('kitchen')) return 'Kitchen / dining';
  if(name.toLowerCase().includes('bath')) return 'Bathroom / utility';
  if(name.toLowerCase().includes('office')) return 'Home office';
  return 'Living / multipurpose';
}

function drawImageToCanvas(imgEl, cb){
  const ratio = Math.min(canvas.width / imgEl.naturalWidth, canvas.height / imgEl.naturalHeight);
  const iw = imgEl.naturalWidth * ratio;
  const ih = imgEl.naturalHeight * ratio;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(imgEl, 0, 0, imgEl.naturalWidth, imgEl.naturalHeight, 0, 0, canvas.width, canvas.height);
  if(cb) cb();
}

window.addEventListener('load', ()=>{
  // draw sample immediately
  floorImage.addEventListener('load', ()=> drawImageToCanvas(floorImage));
  if(floorImage.complete) drawImageToCanvas(floorImage);

  useSample.addEventListener('click', (e)=>{
    e.preventDefault();
    simulateUploadAndAnalyze(floorImage.src);
  });

  fileInput.addEventListener('change', (ev)=>{
    const f = ev.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = (e)=>{
      floorImage.src = e.target.result;
      simulateUploadAndAnalyze(e.target.result);
    };
    reader.readAsDataURL(f);
  });

  resetBtn.addEventListener('click', ()=> resetUI());
});
