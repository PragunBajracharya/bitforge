/* ================= helpers ================= */
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let done=store.get('bf-done',{});
let cur=store.get('bf-cur',{track:'algorithms',algorithms:0,crypto:0});
let lang=store.get('bf-lang','python');if(!LANGS.some(l=>l[0]===lang))lang='python';
let cleanup=()=>{};
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>Number(n).toLocaleString('en-US');
const sleep0=()=>new Promise(r=>setTimeout(r,0));

const pseudoHTML=key=>`<ol class="pseudo">${ALGOS[key].pseudo.map(l=>`<li>${esc(l)}</li>`).join('')}</ol>`;
const setLine=(root,i)=>$$('.pseudo li',root).forEach((li,k)=>li.classList.toggle('on',Array.isArray(i)?i.includes(k):k===i));
const refBlock=sub=>`<h2 class="section-title">Reference</h2><p class="section-sub">${sub}</p><div id="ref"></div>`;

function reference(el,key){
  const A=ALGOS[key];
  el.innerHTML=`<div class="ref-grid">
    <div class="card"><h3>Time &amp; space · ${esc(A.name)}</h3><div class="tblwrap"><table class="cx"><tbody>${A.cx.map(r=>`<tr><th>${r[0]}</th><td class="bo">${r[1]}</td><td class="why">${r[2]||''}</td></tr>`).join('')}</tbody></table></div></div>
    <div class="card"><h3>Key ideas</h3><ul class="pts">${A.pts.map(p=>`<li>${p}</li>`).join('')}</ul></div>
  </div>
  <div class="card"><div class="code-head"><h3>Implementation</h3>
    <div class="langs" role="group" aria-label="Programming language">${LANGS.map(([k,l])=>`<button data-l="${k}" aria-pressed="${k===lang}">${l}</button>`).join('')}</div>
    <button class="btn sm copy">Copy</button></div>
    <pre class="code"><code></code></pre></div>`;
  const code=$('code',el);
  const show=()=>{code.className='language-'+lang;code.textContent=A.code[lang];delete code.dataset.highlighted;
    if(window.hljs){try{hljs.highlightElement(code)}catch(e){}}
    $$('.langs button',el).forEach(b=>b.setAttribute('aria-pressed',b.dataset.l===lang))};
  $$('.langs button',el).forEach(b=>b.onclick=()=>{lang=b.dataset.l;store.set('bf-lang',lang);show()});
  const cp=$('.copy',el);
  cp.onclick=()=>{const reset=()=>setTimeout(()=>cp.textContent='Copy',1800);
    const fallback=()=>{const r=document.createRange();r.selectNodeContents(code);const s=getSelection();s.removeAllRanges();s.addRange(r);cp.textContent='Selected · press Ctrl+C';reset()};
    try{navigator.clipboard.writeText(A.code[lang]).then(()=>{cp.textContent='Copied';reset()},fallback)}catch(e){fallback()}};
  show();
}

/* A prediction prompt: options are [label, value]; onDone(isCorrect) */
function ask(box,question,options,correct,onDone){
  box.innerHTML=`<div class="predict"><p>${question}</p><div class="row">${options.map((o,i)=>`<button class="btn" data-i="${i}">${o[0]}</button>`).join('')}</div></div>`;
  $$('button',box).forEach(b=>b.onclick=()=>{const ok=options[+b.dataset.i][1]===correct;box.innerHTML='';onDone(ok)});
}

function quiz(root,qs){
  root.innerHTML=`<div class="bench">${qs.map((q,i)=>`<div class="q" data-i="${i}"><p>${i+1}. ${q.q}</p>${q.o.map((o,j)=>`<label><input type="radio" name="q${i}" id="q${i}o${j}" value="${j}"> <span>${o}</span></label>`).join('')}<div class="why" hidden>${q.why}</div></div>`).join('')}<div class="row"><button class="btn primary" id="qcheck">Check answers</button><button class="btn" id="qreset">Try again</button><span class="stats" id="qscore"></span></div></div>`;
  $('#qcheck',root).onclick=()=>{let s=0;qs.forEach((q,i)=>{const box=$(`.q[data-i="${i}"]`,root);const pick=$(`input[name=q${i}]:checked`,box);$$('label',box).forEach((l,j)=>{l.classList.toggle('right',j===q.a);l.classList.toggle('wrong',!!pick&&+pick.value===j&&j!==q.a)});$('.why',box).hidden=false;if(pick&&+pick.value===q.a)s++});
    $('#qscore',root).innerHTML=`Score <b>${s} / ${qs.length}</b>${s===qs.length?' · <span class="ok">perfect</span>':''}`};
  $('#qreset',root).onclick=()=>quiz(root,qs);
}

/* ================= ALGORITHMS ================= */

function sortFrames(src,algo){
  const a=src.slice(),F=[],n=a.length;let comps=0,writes=0;
  const fr=(h,k,line,msg,extra)=>F.push(Object.assign({a:a.slice(),h,k,line,msg,comps,writes},extra||{}));
  if(algo==='bubble'){
    for(let i=0;i<n-1;i++){let s=false;
      fr([],'info',1,`Pass ${i+1}: carry the largest unsorted value to index ${n-1-i}.`);
      for(let j=0;j<n-1-i;j++){comps++;const res=a[j]>a[j+1];
        fr([j,j+1],'cmp',4,`Compare A[${j}] = ${a[j]} with A[${j+1}] = ${a[j+1]}.`,{q:`Is ${a[j]} &gt; ${a[j+1]}, so these two swap?`,res});
        if(res){[a[j],a[j+1]]=[a[j+1],a[j]];writes+=2;s=true;fr([j,j+1],'sw',5,`${a[j+1]} &gt; ${a[j]}, so they swap.`)}}
      if(!s){fr([],'info',6,'No swaps in this pass, so the array is sorted. Stop early.');break}}
  }
  if(algo==='insertion'){
    for(let i=1;i<n;i++){fr([i],'foc',1,`Take A[${i}] = ${a[i]} and insert it into the sorted part A[0..${i-1}].`);let j=i;
      while(j>0){comps++;const res=a[j-1]>a[j];
        fr([j-1,j],'cmp',3,`Compare A[${j-1}] = ${a[j-1]} with A[${j}] = ${a[j]}.`,{q:`Is ${a[j-1]} &gt; ${a[j]}, so ${a[j]} keeps moving left?`,res});
        if(!res){fr([j],'foc',3,`${a[j-1]} ≤ ${a[j]}, so ${a[j]} is in the right place.`);break}
        [a[j-1],a[j]]=[a[j],a[j-1]];writes+=2;fr([j-1,j],'sw',4,`Swap: ${a[j-1]} moves left past ${a[j]}.`);j--}}
  }
  if(algo==='quick'){
    const q=(lo,hi)=>{if(lo>=hi)return;const p=a[hi];let i=lo;
      fr([hi],'piv',2,`Partition A[${lo}..${hi}] around pivot ${p} (the last element). i starts at ${lo}.`);
      for(let j=lo;j<hi;j++){comps++;const res=a[j]<p;
        fr([j,hi],'cmp',4,`Compare A[${j}] = ${a[j]} with pivot ${p}.`,{q:`Is ${a[j]} &lt; ${p}, so it belongs on the left side?`,res});
        if(res){if(i!==j){[a[i],a[j]]=[a[j],a[i]];writes+=2;fr([i,j],'sw',5,`${a[i]} &lt; ${p}: swap it into the left side at index ${i}. i becomes ${i+1}.`)}
          else fr([i],'foc',5,`${a[i]} &lt; ${p} and already on the left side. i becomes ${i+1}.`);i++}}
      if(i!==hi){[a[i],a[hi]]=[a[hi],a[i]];writes+=2}
      fr([i],'sw',6,`Pivot ${p} lands at index ${i}: smaller values to its left, larger to its right. It never moves again.`);
      q(lo,i-1);q(i+1,hi)};
    q(0,n-1);
  }
  if(algo==='merge'){
    const m=(lo,hi)=>{if(hi<=lo)return;const mid=(lo+hi)>>1;m(lo,mid);m(mid+1,hi);
      const L=a.slice(lo,mid+1),R=a.slice(mid+1,hi+1);let i=0,j=0,k=lo;
      fr(Array.from({length:hi-lo+1},(_,x)=>lo+x),'foc',4,`Merge the sorted halves [${L.join(', ')}] and [${R.join(', ')}].`);
      while(i<L.length&&j<R.length){comps++;const res=L[i]<=R[j];
        fr([k],'cmp',5,`Fronts: left ${L[i]}, right ${R[j]}. The smaller one goes to A[${k}].`,{q:`Is ${L[i]} ≤ ${R[j]}, so we take from the left half?`,res});
        a[k]=res?L[i++]:R[j++];writes++;fr([k],'sw',6,`Write ${a[k]} to A[${k}].`);k++}
      while(i<L.length){a[k]=L[i++];writes++;fr([k],'sw',7,`Copy leftover ${a[k]} to A[${k}].`);k++}
      while(j<R.length){a[k]=R[j++];writes++;fr([k],'sw',7,`Copy leftover ${a[k]} to A[${k}].`);k++}};
    m(0,n-1);
  }
  fr([],'fin',-1,`Done: sorted with ${fmt(comps)} comparisons and ${fmt(writes)} writes.`);
  return F;
}

function makeInput(n,order){
  const a=Array.from({length:n},(_,i)=>i+1);
  if(order==='reversed')a.reverse();
  else if(order==='random'){for(let i=n-1;i>0;i--){const j=rnd(0,i);[a[i],a[j]]=[a[j],a[i]]}}
  else if(order==='nearly'){for(let k=0;k<Math.max(1,Math.round(n/20));k++){const i=rnd(0,n-1),j=Math.min(n-1,i+rnd(1,3));[a[i],a[j]]=[a[j],a[i]]}}
  return a;
}

function countSorts(a0){
  const r={};
  {const a=a0.slice();let c=0;for(let i=0;i<a.length-1;i++){let s=false;for(let j=0;j<a.length-1-i;j++){c++;if(a[j]>a[j+1]){const t=a[j];a[j]=a[j+1];a[j+1]=t;s=true}}if(!s)break}r.bubble=c}
  {const a=a0.slice();let c=0;for(let i=1;i<a.length;i++){let j=i;while(j>0){c++;if(a[j-1]>a[j]){const t=a[j];a[j]=a[j-1];a[j-1]=t;j--}else break}}r.insertion=c}
  {const a=a0.slice();let c=0;const st=[[0,a.length-1]];while(st.length){const[lo,hi]=st.pop();if(lo>=hi)continue;const p=a[hi];let i=lo;for(let j=lo;j<hi;j++){c++;if(a[j]<p){const t=a[i];a[i]=a[j];a[j]=t;i++}}const t=a[i];a[i]=a[hi];a[hi]=t;st.push([lo,i-1],[i+1,hi])}r.quick=c}
  {let c=0;const ms=a=>{if(a.length<2)return a;const m=a.length>>1,L=ms(a.slice(0,m)),R=ms(a.slice(m)),o=[];let i=0,j=0;while(i<L.length&&j<R.length){c++;o.push(L[i]<=R[j]?L[i++]:R[j++])}return o.concat(L.slice(i),R.slice(j))};ms(a0.slice());r.merge=c}
  return r;
}

const algoLessons=[
{id:'sorting',title:'Sorting algorithms',eyebrow:'Lesson 1 · Sorting',
 lede:'Watch four classic sorts work on the same data, one comparison at a time. The pseudocode on the right highlights the line being executed, and the narration explains why. Turn on Predict mode to answer each comparison yourself before the algorithm does.',
 goals:['Trace each algorithm line by line','Predict comparisons before they happen','See how input order changes the work'],
 render(root){
  root.innerHTML=`<div class="bench">
   <div class="row">
    <label>Algorithm<select id="salgo"><option value="bubble">Bubble sort</option><option value="insertion">Insertion sort</option><option value="quick">Quicksort</option><option value="merge">Merge sort</option></select></label>
    <label>Input order<select id="sorder"><option value="random">Random</option><option value="sorted">Already sorted</option><option value="reversed">Reversed</option><option value="nearly">Nearly sorted</option></select></label>
    <label>Size<select id="ssize"><option>8</option><option selected>12</option><option>24</option><option>48</option><option>96</option></select></label>
    <label>Speed<input type="range" id="sspeed" min="1" max="60" value="22"></label>
    <label class="chk"><input type="checkbox" id="spred"> Predict mode</label>
   </div>
   <div class="split">
    <div class="stack" style="gap:10px">
     <div class="bars" id="bars"></div>
     <div class="legend"><span><i style="background:var(--mark)"></i>Being compared</span><span><i style="background:var(--track)"></i>Moved or written</span><span><i style="background:var(--bad)"></i>Pivot</span></div>
     <div class="row"><button class="btn sm" id="sback">◀ Back</button><button class="btn primary" id="splay">Play</button><button class="btn" id="sstep">Step ▶</button><button class="btn" id="sshuf">New array</button></div>
     <div class="stats"><span>Comparisons <b id="sc">0</b></span><span>Writes <b id="sw">0</b></span><span>Step <b id="sf">0</b></span><span id="sscore"></span></div>
    </div>
    <div class="stack"><div class="panel-title">Pseudocode</div><div id="spseudo"></div><div class="panel-title">What’s happening</div><div class="narr" id="snarr"></div><div id="sask"></div></div>
   </div></div>
   <div class="note"><p><b>Try this:</b> run insertion sort on “Already sorted”, then on “Reversed”. Same size, wildly different work: n − 1 comparisons versus n(n − 1)/2.</p><p>Then run quicksort on “Already sorted”. The last element is always the largest, so every partition is lopsided and quicksort degrades to O(n²).</p></div>
   ${refBlock('Follows the algorithm selected above. Complexity, key ideas and working code in four languages.')}`;
  let base=[],F=[],fi=0,timer=null,waiting=false,score={ok:0,n:0};
  const bars=$('#bars',root),algo=()=>$('#salgo',root).value,pred=()=>$('#spred',root).checked;
  const cls={cmp:'cmp',sw:'sw',piv:'piv',foc:'foc'};
  const show=f=>{const n=f.a.length,lab=n<=24;
    $$('.bar',bars).forEach((b,i)=>{b.style.height=(f.a[i]/n*100)+'%';b.className='bar'+(f.k==='fin'?' fin':f.h.includes(i)?' '+(cls[f.k]||''):'');b.innerHTML=lab?`<span>${f.a[i]}</span>`:''});
    $('#sc',root).textContent=fmt(f.comps);$('#sw',root).textContent=fmt(f.writes);$('#sf',root).textContent=`${fi} / ${F.length}`;
    setLine(root,f.line);$('#snarr',root).innerHTML=f.msg};
  const initial=()=>({a:base,h:[],k:'',line:-1,msg:'Press <b>Step</b> to run one operation at a time, or <b>Play</b> to watch.',comps:0,writes:0});
  const upScore=()=>{$('#sscore',root).innerHTML=score.n?`Predictions <b>${score.ok} / ${score.n}</b>`:''};
  const stop=()=>{clearInterval(timer);timer=null;$('#splay',root).textContent='Play'};
  const frames=()=>{stop();waiting=false;$('#sask',root).innerHTML='';F=sortFrames(base,algo());fi=0;
    $('#spseudo',root).innerHTML=pseudoHTML(algo());reference($('#ref',root),algo());show(initial())};
  const build=()=>{base=makeInput(+$('#ssize',root).value,$('#sorder',root).value);bars.innerHTML=base.map(()=>'<div class="bar"></div>').join('');frames()};
  const advance=()=>{if(waiting)return false;if(fi>=F.length){stop();return false}
    const f=F[fi];
    if(pred()&&f.q){stop();waiting=true;show(Object.assign({},f,{msg:f.msg+' <b>Your prediction?</b>'}));
      ask($('#sask',root),f.q,[['Yes',true],['No',false]],f.res,ok=>{score.n++;if(ok)score.ok++;upScore();waiting=false;fi++;
        $('#snarr',root).innerHTML=`<span class="tag ${ok?'ok':'no'}">${ok?'Correct':'Not quite'}</span>${f.msg} The answer is <b>${f.res?'yes':'no'}</b>.`;$('#sf',root).textContent=`${fi} / ${F.length}`});
      return false}
    fi++;show(f);return true};
  const play=()=>{if(timer){stop();return}if(waiting)return;if(fi>=F.length)frames();$('#splay',root).textContent='Pause';
    const sp=+$('#sspeed',root).value;timer=setInterval(()=>{const per=Math.max(1,Math.round(sp/12));for(let k=0;k<per;k++)if(!advance())break},Math.max(10,320-sp*5))};
  $('#splay',root).onclick=play;$('#sstep',root).onclick=()=>{stop();advance()};
  $('#sback',root).onclick=()=>{stop();if(waiting){waiting=false;$('#sask',root).innerHTML=''}if(fi>1){fi--;show(F[fi-1])}else{fi=0;show(initial())}};
  $('#sshuf',root).onclick=build;$('#ssize',root).onchange=build;$('#sorder',root).onchange=build;$('#salgo',root).onchange=frames;
  $('#sspeed',root).oninput=()=>{if(timer){stop();play()}};
  $('#spred',root).onchange=()=>{if(!pred()&&waiting){waiting=false;$('#sask',root).innerHTML=''}};
  build();cleanup=stop;
 }},

{id:'complexity',title:'Complexity lab',eyebrow:'Lesson 2 · Big-O in practice',
 lede:'Big-O describes how work grows with input size. Here you can measure it: every sort below really runs on the input you choose, and its comparisons are counted against the theoretical curves.',
 goals:['Read O(n), O(n log n) and O(n²) as growth','Find best and worst cases','Predict before you measure'],
 render(root){
  const NS=[10,25,50,100,250,500,1000,2000,4000];
  root.innerHTML=`<div class="bench">
   <div class="row"><label>Input size n = <b id="lnv" style="color:var(--ink)"></b><input type="range" id="ln" min="0" max="${NS.length-1}" value="5"></label>
    <label>Input order<select id="lord"><option value="random">Random</option><option value="sorted">Already sorted</option><option value="reversed">Reversed</option><option value="nearly">Nearly sorted</option></select></label>
    <label class="chk"><input type="checkbox" id="llog"> Log scale</label><button class="btn" id="lrerun">Run again</button></div>
   <div class="stack" id="lbars" style="gap:8px"></div>
   <div class="stats" id="lsum"></div></div>

   <h2 class="section-title">Challenges</h2><p class="section-sub">Answer first. The lab then switches to that setup so you can check the numbers yourself.</p>
   <div class="stack" id="lch" style="gap:12px"></div>

   <h2 class="section-title">Growth at n = <span id="lnv2"></span></h2><p class="section-sub">How many basic steps each complexity class implies at the size you picked.</p>
   <div class="card"><div class="tblwrap"><table class="cx" id="lgrowth"></table></div></div>

   <h2 class="section-title">Sorting cheat sheet</h2><p class="section-sub">All four algorithms side by side.</p>
   <div class="card"><div class="tblwrap"><table class="cx"><thead><tr><th>Algorithm</th><th>Best</th><th>Average</th><th>Worst</th><th>Space</th><th>Stable</th></tr></thead><tbody>
    <tr><th>Bubble sort</th><td class="bo">O(n)</td><td class="bo">O(n²)</td><td class="bo">O(n²)</td><td class="bo">O(1)</td><td>Yes</td></tr>
    <tr><th>Insertion sort</th><td class="bo">O(n)</td><td class="bo">O(n²)</td><td class="bo">O(n²)</td><td class="bo">O(1)</td><td>Yes</td></tr>
    <tr><th>Quicksort</th><td class="bo">O(n log n)</td><td class="bo">O(n log n)</td><td class="bo">O(n²)</td><td class="bo">O(log n)</td><td>No</td></tr>
    <tr><th>Merge sort</th><td class="bo">O(n log n)</td><td class="bo">O(n log n)</td><td class="bo">O(n log n)</td><td class="bo">O(n)</td><td>Yes</td></tr>
    <tr><th>Binary search</th><td class="bo">O(1)</td><td class="bo">O(log n)</td><td class="bo">O(log n)</td><td class="bo">O(1)</td><td>–</td></tr>
    <tr><th>BFS / DFS</th><td class="bo" colspan="3">O(V + E)</td><td class="bo">O(V)</td><td>–</td></tr>
   </tbody></table></div></div>
   <div class="note"><p><b>Space complexity</b> counts the extra memory beyond the input. Merge sort’s O(n) buffer is why in-place quicksort is often preferred when memory is tight, even though its worst case is worse.</p><p>Big-O hides constant factors. An O(n²) insertion sort beats O(n log n) merge sort on tiny arrays, which is why production sorts switch to insertion sort below about 16–32 elements.</p></div>`;
  const NAMES={bubble:'Bubble',insertion:'Insertion',quick:'Quicksort',merge:'Merge'};
  const run=()=>{const n=NS[+$('#ln',root).value],ord=$('#lord',root).value,log=$('#llog',root).checked;
    $('#lnv',root).textContent=fmt(n);$('#lnv2',root).textContent=fmt(n);
    const r=countSorts(makeInput(n,ord));const lg=Math.log2(n);
    const refs=[['n',n],['n log₂ n',Math.round(n*lg)],['n² / 2',Math.round(n*n/2)]];
    const all=[...Object.values(r),...refs.map(x=>x[1])];const max=Math.max(...all);
    const w=v=>log?(Math.log10(v+1)/Math.log10(max+1)*100):(v/max*100);
    const min=Math.min(...Object.values(r));
    $('#lbars',root).innerHTML=Object.entries(r).map(([k,v])=>`<div class="hb${v===min?' best':''}"><span class="lbl">${NAMES[k]}</span><div class="trk"><div class="fill" style="width:${Math.max(.4,w(v))}%"></div></div><span class="val">${fmt(v)}</span></div>`).join('')
      +refs.map(([l,v])=>`<div class="hb ref"><span class="lbl">${l}</span><div class="trk"><div class="fill" style="width:${Math.max(.4,w(v))}%"></div></div><span class="val">${fmt(v)}</span></div>`).join('');
    const worst=Object.entries(r).sort((a,b)=>b[1]-a[1])[0];
    $('#lsum',root).innerHTML=`<span>Fewest comparisons <b>${Object.keys(r).filter(k=>r[k]===min).map(k=>NAMES[k]).join(' & ')}</b></span><span>Most <b>${NAMES[worst[0]]}</b>, ${(worst[1]/Math.max(1,min)).toFixed(1)}× the fewest</span>`;
    const p2=n>1000?`≈ 10^${Math.floor(n*Math.log10(2))}`:fmt(2**n);
    $('#lgrowth',root).innerHTML=`<thead><tr><th>Class</th><th>Steps at n = ${fmt(n)}</th><th>Typical example</th></tr></thead><tbody>
     <tr><th>O(1)</th><td class="bo">1</td><td class="why">Array index, hash table lookup</td></tr>
     <tr><th>O(log n)</th><td class="bo">${lg.toFixed(1)}</td><td class="why">Binary search</td></tr>
     <tr><th>O(n)</th><td class="bo">${fmt(n)}</td><td class="why">Linear scan, BFS over a grid</td></tr>
     <tr><th>O(n log n)</th><td class="bo">${fmt(Math.round(n*lg))}</td><td class="why">Merge sort, quicksort on average</td></tr>
     <tr><th>O(n²)</th><td class="bo">${fmt(n*n)}</td><td class="why">Bubble and insertion sort, comparing all pairs</td></tr>
     <tr><th>O(2ⁿ)</th><td class="bo">${p2}</td><td class="why">Trying every subset; brute-forcing an n-bit key</td></tr></tbody>`};
  const setup=(ni,ord)=>{$('#ln',root).value=ni;$('#lord',root).value=ord;run()};
  const CH=[
   {q:'On <b>already-sorted</b> input with n = 1,000, which algorithm makes the <b>most</b> comparisons?',o:[['Bubble','bubble'],['Insertion','insertion'],['Quicksort','quick'],['Merge','merge']],a:'quick',set:[6,'sorted'],why:'Quicksort with a last-element pivot makes ~500,000 comparisons, because every pivot is the maximum. Bubble and insertion finish in 999 thanks to their early-exit behavior.'},
   {q:'On <b>random</b> input with n = 4,000, about how many times more comparisons does bubble sort make than merge sort?',o:[['~4×',4],['~20×',20],['~200×',200],['~4,000×',4000]],a:200,set:[8,'random'],why:'Bubble makes ≈ n²/2 ≈ 8 million; merge makes ≈ n log₂ n ≈ 44,000. The ratio grows with n: at n = 1 million it would be ~25,000×.'},
   {q:'Which input order makes <b>insertion sort</b> do the most work?',o:[['Random','random'],['Already sorted','sorted'],['Reversed','reversed'],['Nearly sorted','nearly']],a:'reversed',set:[5,'reversed'],why:'Reversed input forces every new element to travel all the way to the front: n(n − 1)/2 comparisons. Nearly sorted input is close to the O(n) best case.'}];
  CH.forEach((c,i)=>{const box=document.createElement('div');box.className='card';$('#lch',root).appendChild(box);
    const draw=()=>{box.innerHTML=`<div class="eyebrow" style="margin-bottom:6px">Challenge ${i+1}</div><div class="ask"></div><div class="res"></div>`;
      ask($('.ask',box),c.q,c.o,c.a,ok=>{setup(...c.set);$('.res',box).innerHTML=`<p class="fb ${ok?'ok':'no'}" style="margin:0 0 6px"><b>${ok?'Correct.':'Not this time.'}</b> The lab above now shows this setup.</p><p style="margin:0 0 8px">${c.why}</p><button class="btn sm">Try again</button>`;$('.res button',box).onclick=draw})};
    draw()});
  ['#ln','#lord','#llog'].forEach(s=>$(s,root).oninput=run);$('#lrerun',root).onclick=run;run();
 }},

{id:'binary',title:'Binary search',eyebrow:'Lesson 3 · Searching',
 lede:'Binary search finds a value in a sorted array by halving the search range each step, so a million items need at most 20 comparisons. Each step has two parts: compute the middle, then decide which half to keep.',
 goals:['Maintain the lo ≤ hi invariant','Predict which half survives','Compare against linear search'],
 render(root){
  root.innerHTML=`<div class="bench"><div class="row">
    <label>Target<input type="number" id="bt"></label>
    <button class="btn primary" id="bstep">Step ▶</button><button class="btn" id="brun">Run to end</button><button class="btn" id="bmiss">Search a missing value</button><button class="btn" id="bnew">New array</button>
    <label class="chk"><input type="checkbox" id="bpred" checked> Predict mode</label></div>
   <div class="split">
    <div class="stack" style="gap:10px"><div class="cells" id="bcells"></div>
     <div class="stats"><span>lo <b id="blo">0</b></span><span>hi <b id="bhi">0</b></span><span>mid <b id="bmid">–</b></span><span>Comparisons <b id="bc">0</b></span><span>Linear search needs <b id="blin">–</b></span><span id="bscore"></span></div>
     <div class="panel-title">Trace</div><div class="log" id="blog"></div></div>
    <div class="stack"><div class="panel-title">Pseudocode</div>${pseudoHTML('binary')}<div class="panel-title">What’s happening</div><div class="narr" id="bnarr"></div><div id="bask"></div></div>
   </div></div>
   <div class="note"><p>Dimmed cells have been ruled out. Notice that the range shrinks to half its size at every step, regardless of where the target is.</p><p>If lo passes hi, the range is empty and the value is not in the array. That “not found” case still costs only ⌊log₂ n⌋ + 1 comparisons.</p></div>
   ${refBlock('Binary search on a sorted array.')}`;
  reference($('#ref',root),'binary');
  let arr,lo,hi,mid,c,fin,phase,waiting,score={ok:0,n:0};
  const T=()=>+$('#bt',root).value;
  const newArr=()=>{const s=new Set();while(s.size<31)s.add(rnd(1,199));arr=[...s].sort((x,y)=>x-y);$('#bt',root).value=arr[rnd(0,30)];reset()};
  const reset=()=>{lo=0;hi=arr.length-1;mid=-1;c=0;fin=null;phase='mid';waiting=false;$('#bask',root).innerHTML='';$('#blog',root).innerHTML='';
    const ix=arr.indexOf(T());$('#blin',root).textContent=ix<0?`${arr.length} (then gives up)`:`${ix+1}`;
    setLine(root,1);$('#bnarr',root).innerHTML=`Start with the whole array: lo = 0, hi = ${hi}. Looking for <b>${T()}</b>.`;draw()};
  const draw=()=>{$('#bcells',root).innerHTML=arr.map((v,i)=>`<div class="cell${i<lo||i>hi?' out-range':''}${i===mid&&fin===null?' mid':''}${i===fin?' hit':''}">${v}<small>${i}</small></div>`).join('');
    $('#blo',root).textContent=lo;$('#bhi',root).textContent=hi;$('#bmid',root).textContent=mid<0?'–':mid;$('#bc',root).textContent=c;
    $('#bscore',root).innerHTML=score.n?`Predictions <b>${score.ok} / ${score.n}</b>`:''};
  const log=s=>{$('#blog',root).insertAdjacentHTML('beforeend',`<div>${s}</div>`);$('#blog',root).scrollTop=1e6};
  const outcome=()=>arr[mid]===T()?'found':arr[mid]<T()?'right':'left';
  const apply=()=>{const t=T();c++;const o=outcome();
    if(o==='found'){fin=mid;setLine(root,4);$('#bnarr',root).innerHTML=`A[${mid}] = ${t}. <b class="ok">Found it</b> after ${c} comparison${c>1?'s':''}.`;log(`<span class="ok">A[${mid}] = ${t} → found</span>`)}
    else if(o==='right'){setLine(root,5);$('#bnarr',root).innerHTML=`A[${mid}] = ${arr[mid]} &lt; ${t}, so the target can only be to the right. lo ← ${mid+1}.`;log(`A[${mid}] = ${arr[mid]} &lt; ${t} → lo = ${mid+1}`);lo=mid+1}
    else{setLine(root,6);$('#bnarr',root).innerHTML=`A[${mid}] = ${arr[mid]} &gt; ${t}, so the target can only be to the left. hi ← ${mid-1}.`;log(`A[${mid}] = ${arr[mid]} &gt; ${t} → hi = ${mid-1}`);hi=mid-1}
    phase='mid';draw()};
  const step=(noAsk)=>{if(fin!==null||waiting)return;
    if(phase==='mid'){if(lo>hi){fin=-2;mid=-1;setLine(root,7);$('#bnarr',root).innerHTML=`lo (${lo}) &gt; hi (${hi}): the range is empty. <b class="no">${T()} is not in the array.</b> ${c} comparisons used.`;log(`<span class="no">lo &gt; hi → not found</span>`);draw();return}
      mid=lo+((hi-lo)>>1);setLine(root,3);$('#bnarr',root).innerHTML=`mid = ${lo} + ⌊(${hi} − ${lo}) / 2⌋ = <b>${mid}</b>, and A[${mid}] = <b>${arr[mid]}</b>. Compare it with ${T()}.`;phase='cmp';draw();
      if($('#bpred',root).checked&&!noAsk){waiting=true;
        ask($('#bask',root),`A[${mid}] = ${arr[mid]}, target = ${T()}. What happens next?`,[['Found it','found'],['Keep the right half','right'],['Keep the left half','left']],outcome(),ok=>{waiting=false;score.n++;if(ok)score.ok++;apply();$('#bnarr',root).insertAdjacentHTML('afterbegin',`<span class="tag ${ok?'ok':'no'}">${ok?'Correct':'Not quite'}</span>`)})}
      return}
    apply()};
  $('#bstep',root).onclick=()=>step(false);
  $('#brun',root).onclick=()=>{if(waiting){waiting=false;$('#bask',root).innerHTML='';apply()}let g=0;while(fin===null&&g++<80)step(true)};
  $('#bmiss',root).onclick=()=>{let v;do{v=rnd(1,199)}while(arr.includes(v));$('#bt',root).value=v;reset()};
  $('#bnew',root).onclick=newArr;$('#bt',root).onchange=reset;
  newArr();
 }},

{id:'graphs',title:'Graph search: BFS & DFS',eyebrow:'Lesson 4 · Graphs',
 lede:'Explore a maze from the top-left corner to the bottom-right. Step through to see the queue (BFS) or stack (DFS) change, with the pseudocode line lit up. Then run both on the same maze and compare.',
 goals:['See a queue vs a stack in action','Understand why BFS finds shortest paths','Compare cells explored and path length'],
 render(root){
  const C=22,R=13,S=0,E=C*R-1;
  root.innerHTML=`<div class="bench"><div class="row">
    <label>Algorithm<select id="gmode"><option value="bfs">Breadth-first (BFS)</option><option value="dfs">Depth-first (DFS)</option></select></label>
    <label>Speed<input type="range" id="gspeed" min="1" max="60" value="30"></label>
    <button class="btn primary" id="gplay">Play</button><button class="btn" id="gstep">Step ▶</button><button class="btn" id="greset">Reset run</button><button class="btn" id="gmaze">Random walls</button><button class="btn" id="gclear">Clear walls</button></div>
   <div class="split">
    <div class="stack" style="gap:10px"><div class="gridwrap"><div class="grid" id="grid" style="grid-template-columns:repeat(${C},1fr)"></div></div>
     <div class="legend"><span><i style="background:var(--track)"></i>Start / goal</span><span><i style="background:var(--bad)"></i>Current</span><span><i style="background:color-mix(in srgb,var(--mark) 55%,var(--surface))"></i>Waiting in <span class="dsname">queue</span></span><span><i style="background:color-mix(in srgb,var(--track) 32%,var(--surface))"></i>Explored</span><span><i style="background:var(--mark)"></i>Path</span></div>
     <div class="stats"><span>Explored <b id="gv">0</b></span><span>Waiting <b id="gf">0</b></span><span>Path length <b id="gp">–</b></span></div>
     <div class="out" id="gcmp">Run BFS and DFS on the same walls to compare them here.</div>
     <div class="stats">Click or drag on the grid to draw and erase walls.</div></div>
    <div class="stack"><div class="panel-title">Pseudocode</div><div id="gpseudo"></div><div class="panel-title">What’s happening</div><div class="narr" id="gnarr"></div>
     <div class="panel-title" id="gdsl">Queue</div><div class="chips" id="gds"></div></div>
   </div></div>
   <div class="note"><p>The only difference between the two algorithms is one line: BFS takes from the <b>front</b> of a queue, DFS from the <b>top</b> of a stack. That choice decides whether the search spreads in rings or dives down corridors.</p><p>BFS needs memory for a whole “ring” of cells at once, which can be large on wide graphs. DFS usually holds less, but its path can be far from the shortest.</p></div>
   ${refBlock('Follows the algorithm selected above. The code uses a general adjacency-list graph rather than a grid.')}`;
  const g=$('#grid',root);let walls=new Set(),timer=null,F=[],fi=0,visited=new Set(),results={};
  g.innerHTML=Array.from({length:C*R},(_,i)=>`<div class="g${i===S?' s':i===E?' e':''}" data-i="${i}"></div>`).join('');
  const cells=$$('.g',g);const mode=()=>$('#gmode',root).value;
  const xy=i=>`(${i%C},${(i/C)|0})`;
  const nbs=i=>{const x=i%C,y=(i/C)|0,o=[];if(y>0)o.push(i-C);if(x<C-1)o.push(i+1);if(y<R-1)o.push(i+C);if(x>0)o.push(i-1);return o.filter(n=>!walls.has(n))};
  const buildFrames=()=>{const bfs=mode()==='bfs',nm=bfs?'queue':'stack';const prev=new Map([[S,-1]]),ds=[S];F=[{k:'init',line:1,fr:[S],msg:`Put the start ${xy(S)} in the ${nm}.`}];let found=false;
    while(ds.length){const c=bfs?ds.shift():ds.pop();F.push({k:'pop',cell:c,line:3,fr:ds.slice(),msg:`Take ${xy(c)} from the ${bfs?'front of the queue':'top of the stack'}.`});
      if(c===E){found=true;break}
      const add=[];for(const n of(bfs?nbs(c):nbs(c).reverse()))if(!prev.has(n)){prev.set(n,c);ds.push(n);add.push(n)}
      F.push(add.length?{k:'push',cell:c,line:7,fr:ds.slice(),msg:`Add ${add.length} unseen neighbor${add.length>1?'s':''} to the ${nm}: ${add.map(xy).join(', ')}.`}:{k:'push',cell:c,line:6,fr:ds.slice(),msg:'Every neighbor is a wall or already seen. Nothing to add.'})}
    const path=[];if(found){for(let p=E;p!==-1;p=prev.get(p))path.unshift(p)}
    F.push(found?{k:'found',cell:E,line:4,fr:[],path,msg:`Reached the goal. Following parent links back gives a path of <b>${path.length-1}</b> steps.`}:{k:'none',line:8,fr:[],msg:'<b class="no">The queue is empty and the goal was never reached. There is no path.</b>'})};
  const paint=f=>{const fr=new Set(f?f.fr:[]),path=new Set(f&&f.path||[]);
    cells.forEach((c,i)=>{let k='g';if(i===S)k+=' s';else if(i===E)k+=' e';else if(walls.has(i))k+=' wall';else if(path.has(i))k+=' path';else if(f&&f.cell===i&&f.k!=='found')k+=' cur';else if(fr.has(i))k+=' fr';else if(visited.has(i))k+=' vis';c.className=k});
    if(!f){$('#gv',root).textContent=0;$('#gf',root).textContent=0;$('#gp',root).textContent='–';return}
    $('#gv',root).textContent=visited.size;$('#gf',root).textContent=f.fr.length;setLine(root,f.line);$('#gnarr',root).innerHTML=f.msg;
    const list=mode()==='bfs'?f.fr:f.fr.slice().reverse();
    $('#gds',root).innerHTML=list.length?list.slice(0,16).map(xy).map(s=>`<span>${s}</span>`).join('')+(list.length>16?`<span>+${list.length-16} more</span>`:''):'<span>empty</span>';
    if(f.k==='found'||f.k==='none'){$('#gp',root).innerHTML=f.path?f.path.length-1:'<span class="no">none</span>';results[mode()]={v:visited.size,p:f.path?f.path.length-1:null};showCmp()}};
  const showCmp=()=>{const r=k=>results[k]?`explored <b>${results[k].v}</b> cells, path <b>${results[k].p??'none'}</b>`:'not run yet';$('#gcmp',root).innerHTML=`BFS: ${r('bfs')}<br>DFS: ${r('dfs')}`};
  const stop=()=>{clearInterval(timer);timer=null;$('#gplay',root).textContent='Play'};
  const reset=()=>{stop();buildFrames();fi=0;visited=new Set();paint(null);setLine(root,0);
    const bfs=mode()==='bfs';$('#gdsl',root).textContent=bfs?'Queue (front → back)':'Stack (top → bottom)';$$('.dsname',root).forEach(s=>s.textContent=bfs?'queue':'stack');
    $('#gnarr',root).innerHTML='Press <b>Step</b> to run one operation at a time, or <b>Play</b> to watch.';$('#gds',root).innerHTML='<span>empty</span>'};
  const advance=()=>{if(fi>=F.length){stop();return false}const f=F[fi++];if(f.k==='pop')visited.add(f.cell);return f};
  const step=()=>{const f=advance();if(f)paint(f)};
  const play=()=>{if(timer){stop();return}if(fi>=F.length)reset();$('#gplay',root).textContent='Pause';
    timer=setInterval(()=>{const sp=+$('#gspeed',root).value;let f=null;for(let k=0;k<Math.max(1,Math.round(sp/5));k++){const x=advance();if(!x)break;f=x}if(f)paint(f)},Math.max(16,180-sp4()))};
  const sp4=()=>+$('#gspeed',root).value*3;
  const wallsChanged=()=>{results={};showCmp();reset()};
  let drawing=null;
  const toggleAt=(c)=>{if(!c||!g.contains(c))return;const i=+c.dataset.i;if(i===S||i===E)return;drawing?walls.add(i):walls.delete(i);c.classList.toggle('wall',drawing)};
  g.addEventListener('pointerdown',e=>{const c=e.target.closest('.g');if(!c)return;const i=+c.dataset.i;if(i===S||i===E)return;stop();drawing=!walls.has(i);toggleAt(c)});
  g.addEventListener('pointermove',e=>{if(drawing===null)return;const el=document.elementFromPoint(e.clientX,e.clientY);toggleAt(el&&el.closest&&el.closest('.g'))});
  const up=()=>{if(drawing!==null){drawing=null;wallsChanged()}};window.addEventListener('pointerup',up);
  $('#gplay',root).onclick=play;$('#gstep',root).onclick=()=>{stop();if(fi>=F.length)reset();step()};$('#greset',root).onclick=reset;
  $('#gmode',root).onchange=()=>{$('#gpseudo',root).innerHTML=pseudoHTML(mode());reference($('#ref',root),mode());reset()};
  $('#gclear',root).onclick=()=>{walls.clear();wallsChanged()};
  const reachable=()=>{const seen=new Set([S]),q=[S];while(q.length){const c=q.shift();if(c===E)return true;for(const n of nbs(c))if(!seen.has(n)){seen.add(n);q.push(n)}}return false};
  $('#gmaze',root).onclick=()=>{for(let t=0;t<40;t++){walls=new Set();for(let i=0;i<C*R;i++)if(i!==S&&i!==E&&Math.random()<.28)walls.add(i);if(reachable())break}wallsChanged()};
  $('#gpseudo',root).innerHTML=pseudoHTML('bfs');reference($('#ref',root),'bfs');
  $('#gmaze',root).click();
  cleanup=()=>{stop();window.removeEventListener('pointerup',up)};
 }},

{id:'algo-quiz',n:6,title:'Checkpoint quiz',eyebrow:'Lesson 5 · Review',
 goals:['Check your understanding','Each answer comes with an explanation'],
 lede:'Six questions covering everything in the algorithms track.',
 render(root){quiz(root,[
  {q:'Binary search on a sorted list of 1,000,000 items needs at most about how many comparisons?',o:['20','1,000','500,000','1,000,000'],a:0,why:'2²⁰ ≈ 1,048,576, so about 20 halvings shrink a million items down to one.'},
  {q:'Which sort guarantees O(n log n) time even in the worst case?',o:['Bubble sort','Insertion sort','Quicksort with a last-element pivot','Merge sort'],a:3,why:'Merge sort always splits in half. Quicksort hits O(n²) when the pivot is repeatedly the smallest or largest value.'},
  {q:'What is the extra space complexity of merge sort?',o:['O(1)','O(log n)','O(n)','O(n²)'],a:2,why:'Merging needs a temporary buffer as large as the range being merged.'},
  {q:'Which input makes insertion sort run in O(n) time?',o:['Random','Reversed','Already sorted','All values distinct'],a:2,why:'Each new value is compared once with its left neighbor and stays put.'},
  {q:'On a grid where every step costs the same, which search guarantees a shortest path?',o:['DFS','BFS','Both','Neither'],a:1,why:'BFS explores cells in order of distance, so the first time it reaches the goal is via a shortest route.'},
  {q:'What is the time complexity of BFS on a graph with V vertices and E edges?',o:['O(V)','O(E log V)','O(V + E)','O(V · E)'],a:2,why:'Each vertex is enqueued once and each edge is examined once (twice in an undirected graph).'}
 ])}}
];

/* ================= CRYPTOGRAPHY ================= */
const EN=[8.17,1.49,2.78,4.25,12.7,2.23,2.02,6.09,6.97,.15,.77,4.03,2.41,6.75,7.51,1.93,.1,5.99,6.33,9.06,2.76,.98,2.36,.15,1.97,.07];
const caesar=(s,k)=>s.replace(/[a-z]/gi,ch=>{const b=ch<='Z'?65:97;return String.fromCharCode(((ch.charCodeAt(0)-b+k)%26+26)%26+b)});
const freq=s=>{const f=new Array(26).fill(0);let n=0;for(const ch of s.toUpperCase()){const c=ch.charCodeAt(0)-65;if(c>=0&&c<26){f[c]++;n++}}return{f:f.map(x=>n?x/n*100:0),cnt:f,n}};
const chi=s=>{const{cnt,n}=freq(s);let x=0;for(let i=0;i<26;i++){const e=EN[i]/100*n;x+=(cnt[i]-e)**2/(e||1e-9)}return x};
const enc=new TextEncoder(),dec=new TextDecoder();
const hex=b=>[...b].map(x=>x.toString(16).padStart(2,'0')).join(' ');
const modPow=(b,e,m)=>{let r=1n;b%=m;while(e>0n){if(e&1n)r=r*b%m;b=b*b%m;e>>=1n}return r};
const egcd=(a,b)=>{let[x0,x1]=[1n,0n];while(b){const q=a/b;[a,b]=[b,a%b];[x0,x1]=[x1,x0-q*x1]}return[a,x0]};
const isPrime=n=>{if(n<2n)return false;for(let i=2n;i*i<=n;i++)if(n%i===0n)return false;return true};
const shaBytes=async s=>new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(s)));
const shaHex=async s=>hex(await shaBytes(s)).replace(/ /g,'');

const cryptoLessons=[
{id:'caesar',title:'Caesar cipher & frequency analysis',eyebrow:'Lesson 1 · Classical ciphers',
 lede:'A Caesar cipher shifts every letter by the same amount. It hides nothing about letter frequencies, so a computer can break it by comparing the ciphertext’s letter counts with ordinary English. Encrypt, crack, then try breaking one yourself.',
 goals:['Encrypt with modular arithmetic','Read a frequency histogram','Break a cipher by hand and by χ²'],
 render(root){
  root.innerHTML=`<div class="bench"><div class="split"><div class="stack" style="gap:12px">
   <div class="two"><label class="fld">PLAINTEXT<textarea id="cp" rows="4">Meet me at the old library after the lecture. Bring the notes on prime numbers and do not tell anyone where we are going.</textarea></label>
    <label class="fld">CIPHERTEXT (editable)<textarea id="cc" rows="4"></textarea></label></div>
   <div class="row"><label>Shift k = <b id="cks" style="color:var(--ink)"></b><input type="range" id="ck" min="1" max="25" value="11"></label><button class="btn primary" id="ccrack">Crack the ciphertext</button></div>
   <div><div class="legend"><span><i style="background:var(--track)"></i>Ciphertext letter frequency</span><span><i style="background:var(--muted);opacity:.45"></i>Typical English</span></div>
    <div class="freq" id="cf"></div><div class="freq-l">${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l=>`<span>${l}</span>`).join('')}</div></div>
   <div class="out" id="cout">Move the shift slider and watch the colored bars slide sideways relative to the grey English profile. Then press <b>Crack</b>.</div>
   <div id="cchi" hidden><div class="panel-title">χ² score for each shift (lower = more English-like)</div><div class="chi" id="cchib"></div><div class="freq-l">${Array.from({length:26},(_,i)=>`<span>${i}</span>`).join('')}</div></div>
  </div><div class="stack"><div class="panel-title">Pseudocode</div>${pseudoHTML('caesar')}<div class="panel-title">The math</div><div class="narr">Letters are numbers 0–25 (A = 0). Encrypt: <b>c = (x + k) mod 26</b>. Decrypt: <b>x = (c − k) mod 26</b>. With k = 3, “Z” (25) becomes (25 + 3) mod 26 = 2, which is “C”.</div></div></div></div>

  <h2 class="section-title">Your turn: break this message</h2><p class="section-sub">A random sentence encrypted with a secret shift. Use the frequency hint or just slide until it reads as English.</p>
  <div class="bench"><div class="out" id="xct" style="font-size:15px"></div>
   <div class="row"><label>Your guess for k = <b id="xgv" style="color:var(--ink)">0</b><input type="range" id="xg" min="0" max="25" value="0"></label><button class="btn primary" id="xcheck">Check</button><button class="btn" id="xhint">Hint</button><button class="btn" id="xnew">New message</button><span class="stats" id="xscore"></span></div>
   <div class="out" id="xprev"></div><div id="xfb"></div></div>
  <div class="note"><p>A full substitution cipher (any letter can map to any other) has 26! ≈ 4 × 10²⁶ keys, but frequency analysis still breaks it, because each letter keeps its own frequency. Modern ciphers are built so their output looks uniformly random regardless of the input.</p></div>
  ${refBlock('Encryption plus the automatic χ² cracker.')}`;
  reference($('#ref',root),'caesar');
  const P=$('#cp',root),Cc=$('#cc',root),K=$('#ck',root);
  const chart=()=>{const{f}=freq(Cc.value);const mx=Math.max(13,...f);$('#cf',root).innerHTML=f.map((v,i)=>`<div class="c"><i style="height:${v/mx*100}%"></i><i style="height:${EN[i]/mx*100}%"></i></div>`).join('')};
  const encrypt=()=>{$('#cks',root).textContent=K.value;Cc.value=caesar(P.value,+K.value);chart();setLine(root,2);$('#cchi',root).hidden=true};
  P.oninput=encrypt;K.oninput=encrypt;Cc.oninput=()=>{chart();$('#cchi',root).hidden=true};
  $('#ccrack',root).onclick=()=>{const ct=Cc.value;const sc=Array.from({length:26},(_,k)=>chi(caesar(ct,-k)));const best=sc.indexOf(Math.min(...sc));
    const top=sc.map((x,k)=>({x,k})).sort((a,b)=>a.x-b.x);setLine(root,[4,5,6,7]);
    const mx=Math.log(Math.max(...sc)+1);$('#cchib',root).innerHTML=sc.map((x,k)=>`<i class="${k===best?'best':''}" style="height:${Math.max(3,Math.log(x+1)/mx*100)}%" title="shift ${k}: ${x.toFixed(1)}"></i>`).join('');$('#cchi',root).hidden=false;
    $('#cout',root).innerHTML=`<div class="ok"><b>Best guess: shift ${best}</b> (χ² = ${sc[best].toFixed(1)})</div><div style="color:var(--ink);margin:6px 0">${esc(caesar(ct,-best))}</div><div>Next best: ${top.slice(1,4).map(s=>`shift ${s.k} (χ² ${s.x.toFixed(0)})`).join(', ')}. The winner is far below the rest, which is why the attack is so reliable.</div>`};
  encrypt();
  const SENT=['THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG NEAR THE QUIET RIVERBANK','CRYPTOGRAPHY IS THE ART OF WRITING SECRETS THAT ONLY YOUR FRIENDS CAN READ','EVERY ALGORITHM IS A RECIPE THAT A COMPUTER FOLLOWS ONE STEP AT A TIME','NEVER REUSE A ONE TIME PAD BECAUSE THE KEY WILL CANCEL ITSELF OUT','PUBLIC KEY ENCRYPTION LETS STRANGERS AGREE ON A SECRET IN THE OPEN','THE ENIGMA MACHINE WAS BROKEN BY MATHEMATICIANS WORKING AT BLETCHLEY PARK'];
  let ch,shift,score=0,tries=0;
  const newCh=()=>{ch=SENT[rnd(0,SENT.length-1)];shift=rnd(1,25);$('#xct',root).textContent=caesar(ch,shift);$('#xg',root).value=0;$('#xfb',root).innerHTML='';prev()};
  const prev=()=>{const g=+$('#xg',root).value;$('#xgv',root).textContent=g;$('#xprev',root).textContent='Decrypted with your guess: '+caesar(caesar(ch,shift),-g)};
  $('#xg',root).oninput=prev;
  $('#xcheck',root).onclick=()=>{tries++;const g=+$('#xg',root).value;if(g===shift){score++;$('#xfb',root).innerHTML=`<p class="ok" style="margin:0"><b>Cracked.</b> The key was ${shift}. Press “New message” for another.</p>`}else $('#xfb',root).innerHTML=`<p class="no" style="margin:0">Not yet: that doesn’t read as English. Keep sliding.</p>`;$('#xscore',root).innerHTML=`Solved <b>${score}</b> · Attempts <b>${tries}</b>`};
  $('#xhint',root).onclick=()=>{const{cnt}=freq(caesar(ch,shift));const top=cnt.indexOf(Math.max(...cnt));const L=String.fromCharCode(65+top);const guess=(top-4+26)%26;
    $('#xfb',root).innerHTML=`<p style="margin:0">The most common ciphertext letter is <b>${L}</b>. In English the most common letter is usually E (sometimes T or A). If ${L} stands for E, then k = (${top} − 4) mod 26 = <b>${guess}</b>.</p>`};
  $('#xnew',root).onclick=newCh;newCh();
 }},

{id:'xor',title:'XOR and the reused key',eyebrow:'Lesson 2 · Stream ciphers',
 lede:'XOR-ing a message with a random key as long as the message is a one-time pad, which is perfectly secret. Use the same key twice and the key cancels out. Start at the bit level, then watch the attack recover a whole message.',
 goals:['Compute XOR bit by bit','See why XOR decrypts itself','Recover a message from a reused key'],
 render(root){
  root.innerHTML=`<div class="bench"><div class="split"><div class="stack" style="gap:12px">
   <div class="panel-title">Bit by bit: the first character of message 1</div>
   <div class="byte-wrap"><div class="stack" id="xbits" style="gap:4px"></div></div>
   <div class="stats">Click the key bits to flip them. A ciphertext bit is 1 exactly when the message bit and key bit differ.</div>
  </div><div class="stack"><div class="panel-title">Pseudocode</div>${pseudoHTML('xor')}<div class="panel-title">XOR truth table</div><div class="narr mono" style="word-break:normal">0 ⊕ 0 = 0 &nbsp; 0 ⊕ 1 = 1<br>1 ⊕ 0 = 1 &nbsp; 1 ⊕ 1 = 0<br>Key fact: x ⊕ k ⊕ k = x</div></div></div></div>

  <h2 class="section-title">The two-time pad attack</h2><p class="section-sub">Both messages are encrypted with the same key. You play the eavesdropper who only sees c1 and c2.</p>
  <div class="bench"><div class="two">
    <label class="fld">MESSAGE 1<input type="text" id="x1" value="TRANSFER 500 TO ALICE"></label>
    <label class="fld">MESSAGE 2<input type="text" id="x2" value="MEET AT NOON TOMORROW"></label></div>
   <div class="row"><label style="flex:1;min-width:0">KEY (hex bytes, reused for both)<input type="text" id="xk" class="mono"></label><button class="btn" id="xnew">New random key</button></div>
   <div class="tblwrap"><dl class="kv">
    <dt>m1</dt><dd id="o1"></dd><dt>c1 = m1 ⊕ k</dt><dd id="oc1"></dd>
    <dt>m2</dt><dd id="o2"></dd><dt>c2 = m2 ⊕ k</dt><dd id="oc2"></dd>
    <dt>c1 ⊕ c2</dt><dd id="occ"></dd><dt>m1 ⊕ m2</dt><dd id="omm"></dd></dl></div>
   <div class="row"><label style="flex:1;min-width:0">EVE’S GUESS FOR MESSAGE 1 (try a partial guess like “TRANSFER”)<input type="text" id="xguess" value="TRANSFER"></label></div>
   <div class="out" id="xout"></div></div>
  <div class="note"><p>Eve computes c1 ⊕ c2 = m1 ⊕ m2 without knowing the key. XOR-ing in any guessed piece of m1 reveals the matching piece of m2. Guessing common words (“THE”, “TRANSFER”) and sliding them along is called <i>crib dragging</i>. This is how US analysts read Soviet VENONA traffic.</p></div>
  ${refBlock('XOR encryption and the reused-key attack.')}`;
  reference($('#ref',root),'xor');
  const kbytes=()=>($('#xk',root).value.match(/[0-9a-f]{2}/gi)||[]).map(h=>parseInt(h,16));
  const bitsRow=(label,v,btn)=>`<div class="byte"><span class="lab">${label}</span>${Array.from({length:8},(_,b)=>{const bit=(v>>(7-b))&1;return btn?`<button class="b ${bit?'one':''}" data-b="${b}" aria-label="Flip key bit ${b}">${bit}</button>`:`<span class="b ${bit?'one':''}">${bit}</span>`}).join('')}<span class="lab">0x${v.toString(16).padStart(2,'0')}${v>31&&v<127?` “${esc(String.fromCharCode(v))}”`:''}</span></div>`;
  const bits=()=>{const m=enc.encode($('#x1',root).value)[0]??0,k=kbytes()[0]??0;
    $('#xbits',root).innerHTML=bitsRow('message',m)+bitsRow('key',k,true)+bitsRow('cipher',m^k)+bitsRow('cipher ⊕ key',(m^k)^k);
    $$('#xbits button',root).forEach(b=>b.onclick=()=>{const kb=kbytes();if(!kb.length)kb.push(0);kb[0]^=1<<(7-+b.dataset.b);$('#xk',root).value=hex(kb);upd()})};
  const upd=()=>{bits();const m1=enc.encode($('#x1',root).value),m2=enc.encode($('#x2',root).value),kb=kbytes();
    if(!kb.length){$('#xout',root).innerHTML='<span class="no">Enter at least one key byte as hex, for example “a7 3f”.</span>';return}
    const x=(m,i)=>m^kb[i%kb.length],c1=m1.map(x),c2=m2.map(x),L=Math.min(c1.length,c2.length);
    const cc=Array.from({length:L},(_,i)=>c1[i]^c2[i]),mm=Array.from({length:L},(_,i)=>m1[i]^m2[i]);
    $('#o1',root).textContent=hex(m1);$('#oc1',root).textContent=hex(c1);$('#o2',root).textContent=hex(m2);$('#oc2',root).textContent=hex(c2);$('#occ',root).textContent=hex(cc);$('#omm',root).textContent=hex(mm);
    const gs=enc.encode($('#xguess',root).value);const rec=Array.from({length:Math.min(gs.length,L)},(_,i)=>cc[i]^gs[i]);
    const warn=kb.length<Math.max(m1.length,m2.length)?' <span class="no">The key is shorter than the messages, so it also repeats inside each message, which leaks even more.</span>':'';
    $('#xout',root).innerHTML=`<span class="ok">c1 ⊕ c2 = m1 ⊕ m2: ${cc.every((v,i)=>v===mm[i])?'yes, the key cancelled out':'no'}.</span><br>c1 ⊕ c2 ⊕ (Eve’s guess) reveals the start of message 2: <b style="color:var(--ink)">${esc(dec.decode(new Uint8Array(rec)))}</b>${warn}`};
  const newKey=()=>{const n=Math.max($('#x1',root).value.length,$('#x2',root).value.length,1);$('#xk',root).value=hex(crypto.getRandomValues(new Uint8Array(n)));upd()};
  ['#x1','#x2','#xk','#xguess'].forEach(s=>$(s,root).oninput=upd);$('#xnew',root).onclick=newKey;newKey();setLine(root,2);
 }},

{id:'hash',title:'Hashing: avalanche & proof of work',eyebrow:'Lesson 3 · Hash functions',
 lede:'SHA-256 maps any input to 256 bits. Change one character and about half the output bits flip. Because you can’t run it backwards, finding an input with a special hash takes pure guessing, which is how Bitcoin mining works.',
 goals:['Measure the avalanche effect','Feel exponential difficulty','Know when to use slow hashes'],
 render(root){
  root.innerHTML=`<div class="bench"><div class="split"><div class="stack" style="gap:12px">
   <div class="two"><label class="fld">INPUT A<input type="text" id="h1" value="attack at dawn"></label><label class="fld">INPUT B<input type="text" id="h2" value="attack at dawm"></label></div>
   <div class="row"><button class="btn" id="hflip">Change one character in B</button><button class="btn" id="hsame">Make B equal to A</button></div>
   <div class="tblwrap"><dl class="kv"><dt>SHA-256(A)</dt><dd id="ha"></dd><dt>SHA-256(B)</dt><dd id="hb"></dd></dl></div>
   <div class="stats"><span>Bits that differ <b id="hd">–</b> / 256</span><span>Expected for unrelated inputs ≈ <b>128</b></span></div>
   <div class="bits" id="hbits"></div>
  </div><div class="stack"><div class="panel-title">Pseudocode (SHA-256 outline)</div>${pseudoHTML('sha256')}</div></div></div>

  <h2 class="section-title">Mine a block</h2><p class="section-sub">Find a nonce so that SHA-256(data + nonce) starts with a given number of zero hex digits. Each extra zero means about 16× more guesses.</p>
  <div class="bench"><div class="row">
    <label style="flex:1;min-width:0">BLOCK DATA<input type="text" id="mdata" value="Alice pays Bob 5 coins | nonce="></label>
    <label>Leading zeros<select id="mdiff"><option>1</option><option>2</option><option selected>3</option><option>4</option><option value="5">5 (about a minute)</option></select></label>
    <button class="btn primary" id="mgo">Start mining</button></div>
   <div class="stats"><span>Expected guesses <b id="mexp"></b></span><span>Guesses <b id="mtry">0</b></span><span>Rate <b id="mrate">–</b></span><span>Time <b id="mtime">–</b></span></div>
   <div class="out" id="mout">Pick a difficulty and start. Try 3, then 4, and compare how long each takes.</div></div>
  <div class="note"><p>Fast hashes are right for file integrity, digital signatures and proof of work. They are wrong for storing passwords: an attacker with a GPU can try billions of guesses per second. Passwords need deliberately slow, salted hashes such as Argon2, scrypt or bcrypt.</p></div>
  ${refBlock('Hashing with each language’s standard library, plus the proof-of-work loop.')}`;
  reference($('#ref',root),'sha256');
  const upd=async()=>{if(!(window.crypto&&crypto.subtle)){$('#ha',root).textContent='Web Crypto is not available in this browser.';return}
    const[a,b]=await Promise.all([shaBytes($('#h1',root).value),shaBytes($('#h2',root).value)]);
    $('#ha',root).textContent=hex(a).replace(/ /g,'');$('#hb',root).textContent=hex(b).replace(/ /g,'');
    let d=0,cells='';for(let i=0;i<32;i++)for(let j=7;j>=0;j--){const x=((a[i]^b[i])>>j)&1;d+=x;cells+=`<i${x?' class="d"':''}></i>`}
    $('#hd',root).textContent=d;$('#hbits',root).innerHTML=cells};
  $('#h1',root).oninput=upd;$('#h2',root).oninput=upd;
  $('#hflip',root).onclick=()=>{const s=$('#h2',root).value||'a';const i=rnd(0,s.length-1);const c=s.charCodeAt(i);$('#h2',root).value=s.slice(0,i)+String.fromCharCode(c===122?121:c+1)+s.slice(i+1);upd()};
  $('#hsame',root).onclick=()=>{$('#h2',root).value=$('#h1',root).value;upd()};
  upd();
  let mining=false;
  const exp=()=>{$('#mexp',root).textContent=fmt(16**+$('#mdiff',root).value)};$('#mdiff',root).onchange=exp;exp();
  $('#mgo',root).onclick=async()=>{if(mining){mining=false;return}
    mining=true;$('#mgo',root).textContent='Stop';const d=+$('#mdiff',root).value,target='0'.repeat(d),data=$('#mdata',root).value;let nonce=0,found=null;const t0=performance.now();
    $('#mout',root).textContent='Mining…';
    while(mining){for(let k=0;k<300;k++){const h=await shaHex(data+nonce);if(h.startsWith(target)){found={nonce,h};mining=false;break}nonce++}
      const t=(performance.now()-t0)/1000;$('#mtry',root).textContent=fmt(found?nonce+1:nonce);$('#mrate',root).textContent=fmt(Math.round(nonce/Math.max(t,.001)))+'/s';$('#mtime',root).textContent=t.toFixed(1)+' s';await sleep0()}
    $('#mgo',root).textContent='Start mining';
    if(found)$('#mout',root).innerHTML=`<span class="ok"><b>Block mined.</b></span> nonce = <b style="color:var(--ink)">${found.nonce}</b><br>hash = <b style="color:var(--track)">${found.h.slice(0,d)}</b>${found.h.slice(d)}<br>Verifying it takes one hash; finding it took ${fmt(found.nonce+1)}. That asymmetry is the point of proof of work.`;
    else if($('#mout',root))$('#mout',root).textContent='Stopped.'};
  cleanup=()=>{mining=false};
 }},

{id:'rsa',title:'RSA, step by step',eyebrow:'Lesson 4 · Public-key encryption',
 lede:'RSA publishes the product of two primes and keeps the primes secret. Walk through key generation one step at a time, predicting each value before it’s revealed, then see why textbook RSA leaks patterns.',
 goals:['Generate a key pair by hand','Use modular inverse and exponentiation','Spot why padding is required'],
 render(root){
  root.innerHTML=`<div class="bench"><div class="row">
   <label>Prime p<input type="number" id="rp" value="61"></label><label>Prime q<input type="number" id="rq" value="53"></label><label>Public exponent e<input type="number" id="re" value="17"></label><label>Message m (a number)<input type="number" id="rm" value="65"></label></div>
   <div class="split"><div class="stack" style="gap:10px">
    <div class="row"><button class="btn primary" id="rwalk">Walk through step by step</button><button class="btn" id="rnext" disabled>Reveal next step ▶</button><button class="btn" id="rall">Show all</button><span class="stats" id="rscore"></span></div>
    <div class="steps" id="rsteps"></div><div class="out" id="rerr" hidden></div></div>
   <div class="stack"><div class="panel-title">Pseudocode</div>${pseudoHTML('rsa')}<div class="panel-title">Why it works</div><div class="narr">Because e·d ≡ 1 (mod φ), Euler’s theorem gives (mᵉ)ᵈ = m<sup>1 + kφ</sup> ≡ m (mod n). Computing d needs φ, and computing φ needs the factors p and q.</div></div></div></div>

  <h2 class="section-title">Encrypt a word, letter by letter</h2><p class="section-sub">Each character’s code is encrypted with the public key above. Watch what happens to repeated letters.</p>
  <div class="bench"><div class="row"><label style="flex:1;min-width:0">TEXT<input type="text" id="rtext" value="HELLO WORLD"></label></div>
   <div class="enc-tbl" id="rtbl"></div><div class="out" id="rtout"></div></div>
  <div class="note"><p>Real RSA keys use primes of 1,024 bits or more, so n has over 600 decimal digits and no known classical method can factor it in reasonable time. Shor’s algorithm on a large quantum computer could, which is why post-quantum schemes like ML-KEM are being deployed.</p></div>
  ${refBlock('Key generation, encryption and decryption.')}`;
  reference($('#ref',root),'rsa');
  let S=null,shown=0,walking=false,fb={},score={ok:0,n:0};
  const compute=()=>{try{const p=BigInt($('#rp',root).value),q=BigInt($('#rq',root).value),e=BigInt($('#re',root).value),m=BigInt($('#rm',root).value);
    if(p>99991n||q>99991n)return{err:'Keep p and q under 100,000 so the primality check stays fast.'};
    if(!isPrime(p)||!isPrime(q))return{err:`${!isPrime(p)?'p':'q'} is not prime. Try 61, 53, 101, 103, 1009 or 7919.`};
    if(p===q)return{err:'p and q must be different primes.'};
    const n=p*q,phi=(p-1n)*(q-1n);const[g,x]=egcd(e,phi);
    if(e<2n||g!==1n)return{err:`e = ${e} shares a factor with φ(n) = ${phi}. Pick an e with gcd(e, φ) = 1, such as 3, 7, 17 or 65537.`};
    const d=((x%phi)+phi)%phi;if(m<0n||m>=n)return{err:`The message must be between 0 and n − 1 = ${n-1n}.`,n,e};
    const c=modPow(m,e,n),m2=modPow(c,d,n);
    return{n,e,d,steps:[
     {line:1,l:'p, q',v:`${p}, ${q}`,note:'both prime'},
     {line:2,l:'n = p · q',v:n,pred:`${p} × ${q}`},
     {line:3,l:'φ = (p − 1)(q − 1)',v:phi,pred:`${p-1n} × ${q-1n}`},
     {line:4,l:'e',v:e,note:`gcd(${e}, ${phi}) = 1 ✓`},
     {line:5,l:'d = e⁻¹ mod φ',v:d,pred:`d such that ${e}·d mod ${phi} = 1`,after:`check: ${e} × ${d} mod ${phi} = ${e*d%phi}`},
     {line:6,l:'keys',v:`public (n = ${n}, e = ${e}) · private d = ${d}`},
     {line:7,l:'c = mᵉ mod n',v:c,pred:`${m}^${e} mod ${n}`},
     {line:8,l:'cᵈ mod n',v:m2,pred:`decrypt ${c}`,after:m2===m?'✓ equals the original message':''}]}}
   catch(err){return{err:'Enter whole numbers in every field.'}}};
  const render=()=>{const box=$('#rsteps',root);$('#rerr',root).hidden=!S.err;if(S.err){$('#rerr',root).innerHTML=`<span class="no">${S.err}</span>`;box.innerHTML='';setLine(root,-1);return}
    box.innerHTML=S.steps.map((s,i)=>{if(i<=shown)return`<div class="st${walking&&i===shown?' now':''}"><span>${s.l}</span><span><b>${s.v}</b>${s.note?` <span style="color:var(--muted)">(${s.note})</span>`:''}${s.after?` <span style="color:var(--muted)">${s.after}</span>`:''}${fb[i]!==undefined?` <span class="${fb[i]?'ok':'no'}">${fb[i]?'· you predicted it ✓':'· your prediction was off'}</span>`:''}</span></div>`;
      if(walking&&i===shown+1)return`<div class="st"><span>${s.l}</span><span>${s.pred?`<input type="text" id="rpred" placeholder="predict: ${esc(s.pred)}" style="width:min(100%,280px)">`:'<span style="color:var(--muted)">press Reveal</span>'}</span></div>`;return''}).join('');
    setLine(root,walking?S.steps[shown].line:-1);$('#rnext',root).disabled=!walking||shown>=S.steps.length-1;
    $('#rscore',root).innerHTML=score.n?`Predictions <b>${score.ok} / ${score.n}</b>`:'';const inp=$('#rpred',root);if(inp)inp.onkeydown=e=>{if(e.key==='Enter')next()}};
  const next=()=>{if(!walking||shown>=S.steps.length-1)return;const i=shown+1,inp=$('#rpred',root);
    if(inp&&inp.value.trim()){const ok=inp.value.trim().replace(/[ ,]/g,'')===String(S.steps[i].v);fb[i]=ok;score.n++;if(ok)score.ok++}
    shown++;if(shown>=S.steps.length-1)walking=false;render()};
  const textMode=()=>{const out=$('#rtout',root);if(!S||!S.n){$('#rtbl',root).innerHTML='';out.innerHTML='<span class="no">Fix the key above first.</span>';return}
    if(S.n<=127n){$('#rtbl',root).innerHTML='';out.innerHTML=`<span class="no">n = ${S.n} is too small to encrypt character codes (up to 127). Use bigger primes, such as 61 and 53.</span>`;return}
    const chars=[...$('#rtext',root).value].filter(c=>c.charCodeAt(0)<128).slice(0,40);
    const cs=chars.map(ch=>modPow(BigInt(ch.charCodeAt(0)),S.e,S.n).toString());const cnt={};cs.forEach(c=>cnt[c]=(cnt[c]||0)+1);
    $('#rtbl',root).innerHTML=chars.map((ch,i)=>`<div class="${cnt[cs[i]]>1?'dup':''}"><b>${ch===' '?'␣':esc(ch)}</b>${ch.charCodeAt(0)} → ${cs[i]}</div>`).join('');
    const dups=Object.keys(cnt).filter(k=>cnt[k]>1).length;
    out.innerHTML=dups?`<span class="no">Repeated letters give repeated ciphertext.</span> Textbook RSA is deterministic, so an attacker can do frequency analysis on it, just like a Caesar cipher. Real RSA adds random padding (OAEP) so the same message encrypts differently every time.`:'No repeated characters here. Try a word with repeated letters, like “BANANA”.'};
  const recalc=()=>{S=compute();walking=false;fb={};shown=S.steps?S.steps.length-1:0;render();textMode()};
  $$('#rp,#rq,#re,#rm',root).forEach(i=>i.oninput=recalc);$('#rtext',root).oninput=textMode;
  $('#rwalk',root).onclick=()=>{if(!S.steps)return;walking=true;shown=0;fb={};render();const inp=$('#rpred',root);if(inp)inp.focus()};
  $('#rnext',root).onclick=next;$('#rall',root).onclick=()=>{if(!S.steps)return;walking=false;shown=S.steps.length-1;render()};
  recalc();
 }},

{id:'dh',title:'Diffie–Hellman key exchange',eyebrow:'Lesson 5 · Key agreement',
 lede:'Alice and Bob agree on a shared secret over a public channel. Each keeps one number private, publishes gˣ mod p, and combines the other’s public value with their own secret. Then you play Eve and try to break it by brute force.',
 goals:['Run a key exchange','Understand the discrete log problem','See how key size defeats brute force'],
 render(root){
  const MODES={tiny:{p:1019n,g:2n,label:'Tiny: p = 1019, g = 2'},real:{p:2147483647n,g:7n,label:'31-bit: p = 2³¹ − 1, g = 7'}};
  root.innerHTML=`<div class="bench"><div class="row"><label>Group<select id="dmode"><option value="tiny">${MODES.tiny.label}</option><option value="real" selected>${MODES.real.label}</option></select></label><button class="btn" id="dnew">New random secrets</button></div>
   <div class="split"><div class="stack" style="gap:12px">
    <div class="two">
     <div class="card" style="background:var(--bg)"><h3>Alice</h3><label class="fld" style="margin:8px 0">SECRET a<input type="number" id="da"></label><dl class="kv"><dt>sends A = gᵃ mod p</dt><dd id="dA"></dd><dt>computes Bᵃ mod p</dt><dd id="dsa"></dd></dl></div>
     <div class="card" style="background:var(--bg)"><h3>Bob</h3><label class="fld" style="margin:8px 0">SECRET b<input type="number" id="db"></label><dl class="kv"><dt>sends B = gᵇ mod p</dt><dd id="dB"></dd><dt>computes Aᵇ mod p</dt><dd id="dsb"></dd></dl></div></div>
    <div class="out" id="dout"></div></div>
   <div class="stack"><div class="panel-title">Protocol</div>${pseudoHTML('dh')}</div></div></div>

  <h2 class="section-title">Play Eve: brute-force the discrete log</h2><p class="section-sub">Eve tries x = 1, 2, 3, … until gˣ mod p equals Alice’s public value A. Then she can compute the shared secret herself.</p>
  <div class="bench"><div class="row"><button class="btn primary" id="ego">Start Eve’s attack</button><span class="stats"><span>Tries <b id="etry">0</b></span><span>Rate <b id="erate">–</b></span><span>Search space <b id="espace"></b></span></span></div>
   <div class="out" id="eout">Run it on the tiny group first, then on the 31-bit group.</div></div>
  <div class="note"><p>Against a 31-bit prime, brute force finishes in seconds on a laptop. Real Diffie–Hellman uses a 2,048-bit prime (about 10⁶¹⁶ possible exponents) or the X25519 elliptic curve, where the best known attacks would take longer than the age of the universe.</p><p>Brute force is not the only threat: without authentication, a man in the middle can swap A and B for her own values. TLS prevents this by signing the exchange.</p></div>
  ${refBlock('The full exchange in four languages.')}`;
  reference($('#ref',root),'dh');
  const M=()=>MODES[$('#dmode',root).value];let st={};
  const upd=()=>{const{p,g}=M();try{const a=BigInt($('#da',root).value||0),b=BigInt($('#db',root).value||0);if(a<1n||b<1n)throw 0;
    const A=modPow(g,a,p),B=modPow(g,b,p),sa=modPow(B,a,p),sb=modPow(A,b,p);st={A,B,sa,p,g,b};
    $('#dA',root).textContent=A;$('#dB',root).textContent=B;$('#dsa',root).textContent=sa;$('#dsb',root).textContent=sb;
    $('#dout',root).innerHTML=`${sa===sb?`<span class="ok"><b>Shared secret agreed: ${sa}</b></span>`:'<span class="no">Mismatch</span>'}<br>Eve sees only p = ${p}, g = ${g}, A = ${A} and B = ${B}.`;setLine(root,5)}
   catch(e){$('#dout',root).innerHTML='<span class="no">Secrets must be positive whole numbers.</span>'}
   $('#espace',root).textContent=fmt(Number(p)-1)};
  const nw=()=>{const P=Number(M().p);$('#da',root).value=P<5000?rnd(2,P-2):rnd(1e8,P-2);$('#db',root).value=P<5000?rnd(2,P-2):rnd(1e8,P-2);upd()};
  $('#da',root).oninput=upd;$('#db',root).oninput=upd;$('#dnew',root).onclick=nw;$('#dmode',root).onchange=()=>{eve=false;nw()};
  let eve=false;
  $('#ego',root).onclick=async()=>{if(eve){eve=false;return}if(!st.A)return;eve=true;$('#ego',root).textContent='Stop';
    const p=Number(st.p),g=Number(st.g),A=Number(st.A);let x=1,v=g%p,found=false;const t0=performance.now();
    while(eve){const end=x+3e6;while(x<end){if(v===A){found=true;break}v=v*g%p;x++}
      const t=(performance.now()-t0)/1000;$('#etry',root).textContent=fmt(x);$('#erate',root).textContent=fmt(Math.round(x/Math.max(t,.001)))+'/s';
      $('#eout',root).textContent=`Searching… ${(x/(p-1)*100).toFixed(1)}% of the space so far.`;if(found||x>=p)break;await sleep0()}
    eve=false;$('#ego',root).textContent='Start Eve’s attack';
    if(found){const s=modPow(st.B,BigInt(x),st.p);const t=(performance.now()-t0)/1000;
      $('#eout',root).innerHTML=`<span class="no"><b>Broken in ${t.toFixed(2)} s.</b></span> Eve found x = ${x} with ${st.g}<sup>${x}</sup> mod ${st.p} = A. She computes Bˣ mod p = <b>${s}</b>, which ${s===st.sa?'matches the shared secret':'differs'}.<br>At this rate, a 2,048-bit group would need roughly 10<sup>${Math.round(616-Math.log10(x/Math.max(t,.001)))}</sup> seconds.`}
    else if(x<p)$('#eout',root).textContent=`Stopped after ${fmt(x)} tries.`};
  nw();cleanup=()=>{eve=false};
 }},

{id:'crypto-quiz',n:6,title:'Checkpoint quiz',eyebrow:'Lesson 6 · Review',
 goals:['Check your understanding','Each answer comes with an explanation'],
 lede:'Six questions covering the cryptography track.',
 render(root){quiz(root,[
  {q:'Why can a Caesar cipher be broken without trying keys by hand?',o:['It uses a short password','Letter frequencies survive encryption','It encrypts numbers incorrectly','The ciphertext is longer than the plaintext'],a:1,why:'Shifting keeps the shape of the frequency distribution, so it can be matched against English.'},
  {q:'Two messages are XOR-encrypted with the same key. What does c1 ⊕ c2 reveal?',o:['The key','Nothing','m1 ⊕ m2','Only the key length'],a:2,why:'The key cancels: (m1 ⊕ k) ⊕ (m2 ⊕ k) = m1 ⊕ m2. Knowing either message reveals the other.'},
  {q:'Changing one character of a SHA-256 input flips roughly how many of the 256 output bits?',o:['1','8','128','256'],a:2,why:'A good hash behaves like a random function, so about half the bits change.'},
  {q:'Proof-of-work difficulty goes from 4 to 5 leading zero hex digits. The expected work grows by about…',o:['1.25×','2×','16×','256×'],a:2,why:'Each hex digit has 16 values, so each extra required zero multiplies the expected guesses by 16.'},
  {q:'RSA’s security depends mainly on the difficulty of which problem?',o:['Sorting large lists','Factoring n into p and q','Computing SHA-256','Finding shortest paths'],a:1,why:'Anyone who factors n can compute φ(n) and then the private exponent d.'},
  {q:'In Diffie–Hellman, which values does an eavesdropper never see?',o:['p and g','A and B','The secrets a and b','The number of messages'],a:2,why:'Only gᵃ and gᵇ travel over the network. Recovering a from gᵃ is the discrete logarithm problem.'}
 ])}}
];

