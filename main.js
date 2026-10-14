(function(){'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var fmtS=function(n,d){d=d||0;return Number(n).toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d})};
var escS=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var KEY='sa1';
function defStore(){return {credits:0,df:'normal',fx:undefined,
  ao:{up:{lab:0,budget:0,ground:0,reuse:0,mat:0,bay:0,sim:0},done:{},open:false,vessel:{}},
  mc:{up:{solar:0,recy:0,shield:0,gym:0,repair:0,store:0},done:{},open:false,hints:true}}}
var memOnly=false,store=defStore();
function mergeStore(q){
  var d=defStore();
  d.credits=q.credits||0;d.df=q.df||'normal';d.fx=q.fx;
  if(q.ao){d.ao.up=Object.assign(d.ao.up,q.ao.up||{});d.ao.done=q.ao.done||{};d.ao.open=!!q.ao.open;d.ao.vessel=q.ao.vessel||{}}
  if(q.mc){d.mc.up=Object.assign(d.mc.up,q.mc.up||{});d.mc.done=q.mc.done||{};d.mc.open=!!q.mc.open;d.mc.hints=q.mc.hints!==false}
  return d;
}
try{
  var raw=localStorage.getItem(KEY);
  if(raw)store=mergeStore(JSON.parse(raw));
  else{
    // reprise des anciennes sauvegardes
    var a=localStorage.getItem('ao2'),c=localStorage.getItem('mc2'),o={ao:{},mc:{}};
    if(a){var A=JSON.parse(a);o.credits=(o.credits||0)+(A.credits||0);o.df=A.df;o.fx=A.fx;o.ao={up:A.up,done:A.done,open:A.open}}
    if(c){var C=JSON.parse(c);o.credits=(o.credits||0)+(C.credits||0);o.df=o.df||C.diff;if(o.fx===undefined)o.fx=C.fx;o.mc={up:C.up,done:C.done,open:C.open,hints:C.hints}}
    store=mergeStore(o);
  }
}catch(e){memOnly=true}
function save(){try{localStorage.setItem(KEY,JSON.stringify(store))}catch(e){}}

var SH={store:store,memOnly:memOnly,save:save,fx:store.fx!==false};
try{if(store.fx===undefined&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)SH.fx=false}catch(e){}
SH.FACTS=['Les ingénieurs gardent toujours une marge de masse : on dit que chaque kilo compte.','La sonde Voyager 1 émet avec moins de 25 watts, soit moins qu\'une ampoule.','Un signal radio met environ 1,3 seconde pour aller de la Terre à la Lune.','Le moteur ionique accélère très doucement, mais pendant des années.','Une assistance gravitationnelle peut accélérer une sonde sans carburant.','Sur Vénus, il fait environ 460 °C : plus chaud que dans un four.','À Jupiter, le Soleil est 25 fois plus faible qu\'ici.','Sur la Station spatiale, l\'équipage voit environ 16 levers de soleil par jour.','Un jour martien dure 24 h 37 : un peu plus que le nôtre.','En apesanteur, on peut grandir de quelques centimètres.','La Lune s\'éloigne de la Terre d\'environ 3,8 cm par an.','Un message radio vers Mars met de 3 à 22 minutes.'];
var factI=0,bubT=null,moodT=null,launchT=[],launching=false;
var pupEl=$('#pup'),pupSway=$('#pupSway'),bub=$('#pupBubble'),pup={y:90,vy:0,ang:0};
function setMood(m,ms){pupEl.setAttribute('data-mood',m);clearTimeout(moodT);if(ms&&m!=='idle')moodT=setTimeout(function(){pupEl.setAttribute('data-mood','idle')},ms)}
SH.say=function(txt,mood,ms){
  if(mood)setMood(mood,ms||3200);
  if(!txt){bub.classList.remove('on');return}
  bub.textContent=txt;bub.classList.add('on');clearTimeout(bubT);
  bubT=setTimeout(function(){bub.classList.remove('on')},Math.max(2600,txt.length*70));
};
SH.flash=function(kind){var f=$('#flash');f.className='flash';void f.offsetWidth;f.className='flash on'+(kind?' '+kind:'')};
SH.confetti=function(){
  if(!SH.fx)return;
  var box=$('#confetti'),cols=['#ff7b3a','#6fd3e8','#58d68d','#f3c24f','#ffffff'];
  for(var i=0;i<46;i++){var s=document.createElement('i');s.style.left=(Math.random()*100)+'%';s.style.background=cols[i%cols.length];s.style.animationDuration=(2.4+Math.random()*2.2)+'s';s.style.animationDelay=(Math.random()*.6)+'s';s.style.setProperty('--dx',(Math.random()*160-80)+'px');box.appendChild(s)}
  setTimeout(function(){box.innerHTML=''},5800);
};
SH.transit=function(to,why,cb){SH.launch(cb,{words:['Relais',to],name:why||''})};
SH.countUp=function(el,to){
  if(!SH.fx||to<=0){el.textContent=to;return}
  var t0=null;function f(ts){if(!t0)t0=ts;var p=Math.min(1,(ts-t0)/900);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)}
  requestAnimationFrame(f);
};
SH.launch=function(cb,opts){
  opts=opts||{};
  if(launching)return;
  if(!SH.fx){cb();return}
  var words=opts.words||['3','2','1','Décollage !'];
  var L=$('#launch'),c=$('#lCount');
  launching=true;L.hidden=false;L.classList.remove('go');
  $('#lName').textContent=opts.name||'';
  function num(t){c.textContent=t;c.style.animation='none';void c.offsetWidth;c.style.animation=''}
  var done=false;
  function end(){if(done)return;done=true;launchT.forEach(clearTimeout);launchT=[];L.hidden=true;L.classList.remove('go');launching=false;cb()}
  $('#lSkip').onclick=end;
  num(words[0]);
  words.forEach(function(w,i){if(i===0)return;launchT.push(setTimeout(function(){num(w);if(i===words.length-1)L.classList.add('go')},i*700))});
  launchT.push(setTimeout(end,(words.length-1)*700+1600));
};
function applyFx(){
  document.documentElement.setAttribute('data-fx',SH.fx?'on':'off');
  var b=$('#fxBtn');b.setAttribute('aria-pressed',SH.fx?'true':'false');b.textContent=SH.fx?'Effets : oui':'Effets : non';
  try{AO.syncFx();MC.syncFx()}catch(e){}
}
function pupTarget(){
  var H=window.innerHeight,doc=document.documentElement,max=Math.max(1,doc.scrollHeight-H);
  var prog=Math.min(1,Math.max(0,(window.pageYOffset||doc.scrollTop||0)/max));
  var h=pupEl.offsetHeight||170,top=86,bot=Math.max(top,H-h-24);
  return top+(bot-top)*prog;
}
function pupLoop(ts){
  var ty=pupTarget();
  if(SH.fx){pup.vy=(pup.vy+(ty-pup.y)*.05)*.82;pup.y+=pup.vy;var tgt=Math.max(-28,Math.min(28,-pup.vy*1.6))+Math.sin(ts/900)*2.2;pup.ang+=(tgt-pup.ang)*.1}
  else{pup.y=ty;pup.ang=0}
  pupEl.style.transform='translate3d(0,'+pup.y.toFixed(1)+'px,0)';
  pupSway.style.transform='rotate('+pup.ang.toFixed(2)+'deg)';
  if(SH.fx){var st=$('#starsL');if(st)st.style.transform='translate3d(0,'+(-Math.min(300,(window.pageYOffset||0)*.06)).toFixed(1)+'px,0)'}
  requestAnimationFrame(pupLoop);
}
function stars(){
  var c=$('#stars'),x=c.getContext('2d');if(!x)return;
  var w=c.width=window.innerWidth,h=c.height=window.innerHeight;
  var s=7,rnd=function(){s=(s*16807)%2147483647;return s/2147483647};
  var n=Math.round(w*h/9000);
  for(var i=0;i<n;i++){x.fillStyle='rgba(210,225,255,'+(.15+rnd()*.55).toFixed(2)+')';x.beginPath();x.arc(rnd()*w,rnd()*h,rnd()<.06?1.4:.7,0,6.283);x.fill()}
}

/* ---------- navigation commune ---------- */
var STEPI={hub:0,lab:1,traj:2,fly:3,crew:4,res:5,end:5},view='hub';
SH.setStep=function(key,text){
  var idx=STEPI[key];if(idx===undefined)idx=-1;
  var map={hub:0,lab:1,traj:2,fly:3,crew:4,end:5};
  $$('#steps li').forEach(function(li){var i=map[li.dataset.s];li.className=idx<0?'':i===idx?'on':i<idx?'done':''});
  $('#stepMini').textContent=text||'';
};
SH.showMod=function(m){
  view=m;
  $('#aoRoot').hidden=m==='mc';
  $('#mcRoot').hidden=m!=='mc';
  $('#h-hub').hidden=true;$('#h-learn').hidden=true;
};
var CREWMAP={leo:[],moon:['lune','sol'],venus:[],mars:['mars','base'],ast:['ast'],jup:[]};
function chapterOf(m){for(var k in CREWMAP)if(CREWMAP[k].indexOf(m)>=0)return k;return null}
SH.hub=function(){
  view='hub';
  $('#aoRoot').hidden=false;$('#mcRoot').hidden=true;
  ['a-work','a-s-fly','a-s-res','h-learn'].forEach(function(id){var e=document.getElementById(id);if(e)e.hidden=true});
  $('#h-hub').hidden=false;
  SH.setStep('hub','Programme');
  renderHub();
  var s=$('#h-hub');s.classList.remove('enter');
  SH.say('Choisis ton prochain chapitre, commandant.','happy',3400);
  window.scrollTo(0,0);
};
var learnSaved=null;
function openLearn(){
  if(!$('#h-learn').hidden)return;
  var ids=['aoRoot','mcRoot','h-hub','a-work','a-s-fly','a-s-res'];
  learnSaved=ids.map(function(id){var e=document.getElementById(id);return [e,e.hidden]});
  ids.forEach(function(id){document.getElementById(id).hidden=true});
  $('#aoRoot').hidden=false;$('#h-learn').hidden=false;
  SH.say('Un peu de théorie, ça sauve des missions !','happy',3000);
  window.scrollTo(0,0);
}
function closeLearn(){
  $('#h-learn').hidden=true;
  if(learnSaved){learnSaved.forEach(function(p){p[0].hidden=p[1]});learnSaved=null}
  else SH.hub();
  window.scrollTo(0,0);
}

/* ---------- campagne ---------- */
function stm(n){return '<span class="stars-m" aria-label="'+n+' médaille'+(n>1?'s':'')+' sur 3">'+'★'.repeat(n)+'<span style="opacity:.28">'+'★'.repeat(3-n)+'</span></span>'}
function crewRow(mk,ch,vessel,cl){
  var ml=cl[mk];
  var seq=MC.isUnlocked(mk);
  var best=ml.best?'Meilleur : '+ml.best+' / 100':'Pas encore jouée';
  var btns='';
  if(vessel&&seq)btns+='<button class="btn sm pri" data-h-crew="'+mk+'" data-h-vessel="1">Envoyer l\'équipage</button>';
  else if(!vessel)btns+='<span class="hint">Réussissez d\'abord le vol de ce chapitre pour embarquer votre vaisseau.</span>';
  else btns+='<span class="hint">Terminez la mission précédente avec 40 points.</span>';
  if(seq)btns+=' <button class="btn sm" data-h-crew="'+mk+'">Équipage seul</button>';
  return '<div class="crew-row"><div class="t"><span><b>'+escS(ml.name)+'</b> · '+ml.turns+' '+ml.unitL+'s</span><span class="hint">'+best+' '+(ml.stars?stm(ml.stars):'')+'</span></div><span class="hint">'+escS(ml.sub)+'</span><div class="row">'+btns+'</div></div>';
}
function renderHub(){
  var d=AO.demo();$('#demoTitle').textContent=d.title;$('#demoPoll').innerHTML=d.poll;$('#demoFoot').textContent=d.foot;
  var cur=store.df;
  $('#dfs').innerHTML=['easy','normal','hard'].map(function(k){var o=DFINFO[k];return '<button class="opt" role="radio" aria-checked="'+(cur===k)+'" data-h-df="'+k+'"><div class="o-top"><span class="o-name">'+o.name+'</span><span class="o-state">'+(cur===k?'Choisi':'')+'</span></div><span class="o-desc">'+o.desc+'</span><span class="o-meta">Crédits × '+fmtS(o.credit,1)+'</span></button>'}).join('');
  var chs=AO.chapters(),cl={};MC.missionList().forEach(function(m){cl[m.key]=m});
  var nDone=0;
  $('#route').innerHTML=chs.map(function(c,i){
    var done=c.best>=45;if(done)nDone++;
    var vessel=store.ao.vessel[c.key],cm=CREWMAP[c.key];
    var cls=!c.unlocked?'lock':done?'done':'open';
    var tags='<span class="tg">'+c.level+'</span>'+(cm.length?'<span class="tg cr">Équipage</span>':'<span class="tg rb">Sonde robotique</span>');
    var crew='';
    if(cm.length)crew='<div class="crewbox"><div class="eyebrow">Mission habitée : équipage à bord de votre vaisseau</div>'+cm.map(function(mk){return crewRow(mk,c.key,vessel,cl)}).join('')+'<span class="hint">Pendant la mission, le jeu bascule entre l\'équipage et l\'Atelier selon les circonstances : trajectoire, énergie, radiations, incidents.</span></div>';
    else crew='<div class="crewbox"><span class="hint">Chapitre robotique : votre vaisseau voyage sans équipage. Il compte pour la progression et rapporte des crédits.</span></div>';
    return '<div class="chap '+cls+'"><span class="badge">'+(i+1)+'</span><div class="chap-b"><div class="top-r"><div class="tagrow">'+tags+'</div>'+stm(c.medal)+'</div>'+
      '<div class="chap-h"><svg viewBox="0 0 100 100" aria-hidden="true">'+c.glyph+'</svg><div><h3>'+c.name+'</h3><span class="sub">'+c.sub+'</span></div></div>'+
      '<dl><dt>Δv requis</dt><dd>'+fmtS(c.dv,1)+' km/s</dd><dt>Durée</dt><dd>'+AO.dur(c.days)+'</dd><dt>Budget max.</dt><dd>'+fmtS(c.budget)+' M$</dd><dt>Cible science</dt><dd>'+c.sci+' pts</dd></dl>'+
      '<div class="row">'+(c.unlocked?'<button class="btn pri" data-h-design="'+c.key+'">'+(c.runs?'Rejouer le vol':'Concevoir et lancer')+'</button>':'<span class="hint">Verrouillé : terminez '+chs[i-1].name+' avec 45 points.</span>')+(c.runs?'<span class="hint">Meilleur vol : '+c.best+' / 100 · '+c.runs+' essai'+(c.runs>1?'s':'')+'</span>':'')+'</div>'+crew+'</div></div>';
  }).join('');
  $('#progress').textContent=nDone+' vols réussis sur 6';
  function shop(list,ups,tag){return list.map(function(u){var lv=ups[u.id]||0,max=u.cost.length,cost=lv<max?u.cost[lv]:0,pips='';for(var i=0;i<max;i++)pips+='<i class="'+(i<lv?'on':'')+'"></i>';
    return '<div class="up"><span class="o-name">'+u.n+'</span><span class="pipw" aria-label="Niveau '+lv+' sur '+max+'">'+pips+'</span><span class="o-desc">'+u.d+'</span>'+(lv>=max?'<span class="o-state">Au maximum</span>':'<button class="btn" data-h-buy="'+tag+':'+u.id+'"'+(store.credits<cost?' disabled':'')+'>Acheter · '+cost+' crédits</button>')+'</div>'}).join('')}
  $('#shopAO').innerHTML=shop(AO.UPG,AO.upStore(),'ao');
  $('#shopMC').innerHTML=shop(MC.UP,MC.upStore(),'mc');
  renderCredits();
}
var DFINFO={easy:{name:'Découverte',desc:'Budget et réserves généreux, peu d\'incidents, aucune contrainte surprise. Idéal pour apprendre.',credit:.8},normal:{name:'Normal',desc:'Les règles du jeu : incidents en vol, contraintes surprises, réserves justes.',credit:1},hard:{name:'Expert',desc:'Budget serré, incidents plus nombreux et plus graves, conseils masqués.',credit:1.4}};
function renderCredits(){var t='Crédits : '+store.credits;$('#credits').textContent=t;var c2=$('#credits2');if(c2)c2.textContent=t}
SH.renderCredits=renderCredits;
SH.onFlightDone=function(dest,score,full,vessel){};
SH.onCrewDone=function(mk,score,complete){};
SH.nextAfterFlight=function(dest,vessel){
  var cm=CREWMAP[dest]||[];
  var chs=AO.chapters(),i=AO.ORDER.indexOf(dest),parts=[],btns='';
  if(vessel&&cm.length){
    var m=cm.filter(function(k){return MC.isUnlocked(k)})[0];
    if(m){var ml=MC.missionList().filter(function(x){return x.key===m})[0];
      parts.push('Le vaisseau est arrivé à destination. Envoyez maintenant l\'équipage : <b>'+escS(ml.name)+'</b>. Votre conception influence l\'énergie, les ergols, les radiations et la science de la mission.');
      btns+='<button class="btn pri" data-h-crew="'+m+'" data-h-vessel="1">Envoyer l\'équipage</button> '}
  }else if(!vessel){parts.push('Le vol n\'a pas abouti : l\'équipage ne peut pas embarquer. Corrigez la conception et relancez.')}
  var nx=chs[i+1];
  if(vessel&&nx&&nx.unlocked)btns+='<button class="btn" data-h-design="'+nx.key+'">Chapitre suivant : '+nx.name+'</button>';
  if(!parts.length&&!btns)return null;
  return {text:parts.join(' ')||'Passez au chapitre suivant.',btn:btns};
};
SH.nextAfterCrew=function(mk){
  var ch=chapterOf(mk),vessel=ch?store.ao.vessel[ch]:null,cm=CREWMAP[ch]||[];
  var nxt=cm[cm.indexOf(mk)+1],btns='',text='';
  if(nxt&&MC.isUnlocked(nxt)){text='La mission suivante de ce chapitre est ouverte : <b>'+escS(MC.MISSIONS[nxt].name)+'</b>.';btns+='<button class="btn pri" data-h-crew="'+nxt+'"'+(vessel?' data-h-vessel="1"':'')+'>Continuer avec l\'équipage</button> '}
  var chs=AO.chapters(),i=AO.ORDER.indexOf(ch),nc=chs[i+1];
  if(nc&&nc.unlocked){text=(text?text+' ':'')+'Le chapitre suivant à l\'Atelier est ouvert : <b>'+nc.name+'</b>.';btns+='<button class="btn" data-h-design="'+nc.key+'">Chapitre suivant : '+nc.name+'</button>'}
  if(!btns)return null;
  return {text:text,btn:btns};
};

document.addEventListener('click',function(e){
  var t=e.target.closest?e.target.closest('[data-h-design],[data-h-crew],[data-h-buy],[data-h-df]'):null;if(!t)return;
  if(t.dataset.hDesign){
    var k=t.dataset.hDesign;
    if(!AO.unlocked(k)){SH.say('Terminez le chapitre précédent avec 45 points.','alert',2800);return}
    AO.start(k);return;
  }
  if(t.dataset.hCrew){
    var mk=t.dataset.hCrew,ch=chapterOf(mk),v=t.dataset.hVessel?store.ao.vessel[ch]:null;
    var fromFlight=v&&!$('#aoRoot').hidden;
    if(fromFlight&&SH.fx){var dn=AO.DEST[ch];SH.launch(function(){MC.open(mk,v)},{words:['Arrivée','Transfert','Équipage !'],name:(dn?dn.name:'')});SH.say('On passe en mode équipage !','cheer',2600);return}
    MC.open(mk,v||null);return;
  }
  if(t.dataset.hDf){store.df=t.dataset.hDf;save();renderHub();return}
  if(t.dataset.hBuy){
    var p=t.dataset.hBuy.split(':'),list=p[0]==='ao'?AO.UPG:MC.UP,ups=p[0]==='ao'?AO.upStore():MC.upStore();
    var u=list.filter(function(x){return x.id===p[1]})[0],lv=ups[u.id]||0,cost=u.cost[lv];
    if(cost&&store.credits>=cost){store.credits-=cost;ups[u.id]=lv+1;save();renderHub();SH.say('Amélioration achetée !','cheer',2400);SH.flash('good')}
  }
});
$('#hubCta').addEventListener('click',function(){$('#routeSec').scrollIntoView({behavior:SH.fx?'smooth':'auto',block:'start'})});
$('#hubLearn').addEventListener('click',openLearn);
$('#learnBtn').addEventListener('click',openLearn);
$('#learnBack').addEventListener('click',closeLearn);
$('#brandBtn').addEventListener('click',function(){if(!$('#h-learn').hidden)learnSaved=null;SH.hub()});
$('#unlockAll').addEventListener('click',function(){store.ao.open=true;store.mc.open=true;save();renderHub()});
var confirmReset=false;
$('#resetAll').addEventListener('click',function(){
  if(!confirmReset){confirmReset=true;this.textContent='Confirmer l\'effacement';$('#resetMsg').textContent='Crédits, améliorations, vaisseaux et scores repartent de zéro.';return}
  var fx=store.fx,df=store.df;
  var d=defStore();Object.keys(store.ao.up).forEach(function(k){store.ao.up[k]=0});store.ao.done={};store.ao.open=false;store.ao.vessel={};
  Object.keys(store.mc.up).forEach(function(k){store.mc.up[k]=0});store.mc.done={};store.mc.open=false;store.credits=0;save();
  confirmReset=false;this.textContent='Réinitialiser la campagne';$('#resetMsg').textContent='Campagne réinitialisée.';renderHub();
});
$('#pupBtn').addEventListener('click',function(){SH.say(SH.FACTS[factI++%SH.FACTS.length],'happy',4200)});
$('#fxBtn').addEventListener('click',function(){SH.fx=!SH.fx;store.fx=SH.fx;save();applyFx()});
function hdr(){var h=$('.sh-top');if(h)document.documentElement.style.setProperty('--hdr',h.offsetHeight+'px')}
var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){stars();hdr()},200)});
SH.hdr=hdr;
/* ===== Moteur 3D (Three.js) : scènes de mission ===== */
var S3=(function(){
var T=(typeof THREE!=='undefined')?THREE:null;
var api={ok:false,mount:function(){},scene:function(){},sync:function(){},progress:function(){},cut:function(){},burst:function(){},pulse:function(){},phase:function(){},refresh:function(){}};
if(!T)return api;
var R,cv,sc,cam,host=null,raf=0,clock=new T.Clock(),W=0,H=0,dirty=true,time=0;
try{cv=document.createElement('canvas');cv.className='c3d';R=new T.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'default'})}catch(e){return api}
if(!R||!R.getContext||!R.getContext()){return api}
R.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));R.setClearColor(0x03060f,1);
sc=new T.Scene();cam=new T.PerspectiveCamera(48,1,.1,3000);
var amb=new T.AmbientLight(0x5a6aa0,.55),sun=new T.DirectionalLight(0xffffff,1.4),hemi=new T.HemisphereLight(0x7f9bff,0x201510,.25);
sun.position.set(40,22,30);sc.add(amb,sun,hemi);
var G=new T.Group();sc.add(G);          // contenu de la scène
var camR=new T.Group();sc.add(camR);camR.add(cam);cam.rotation.y=Math.PI; // camR.lookAt oriente +Z vers la cible // rig caméra (pour les particules d'écran)
var V=function(x,y,z){return new T.Vector3(x,y,z)};
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
function rnd(seed){var s=seed||1;return function(){s=(s*16807)%2147483647;return s/2147483647}}
var TEXC={};
function dot(){var c=document.createElement('canvas');c.width=c.height=64;var x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new T.CanvasTexture(c)}
var DOT=dot();
function mkTex(kind){
  if(TEXC[kind])return TEXC[kind];
  var c=document.createElement('canvas');c.width=512;c.height=256;var x=c.getContext('2d'),r=rnd(kind.length*977+kind.charCodeAt(0));
  var base={earth:'#2a64b4',moon:'#9ba1ad',mars:'#b4573b',venus:'#d6b47a',jup:'#c8a47c',ast:'#716659',ice:'#c9d6e6'}[kind]||'#888';
  x.fillStyle=base;x.fillRect(0,0,512,256);
  function blob(col,n,rmin,rmax,a,sq){for(var i=0;i<n;i++){x.globalAlpha=a;x.fillStyle=col;x.beginPath();x.ellipse(r()*512,r()*256,rmin+r()*(rmax-rmin),(rmin+r()*(rmax-rmin))*(sq||1),r()*3,0,6.283);x.fill()}x.globalAlpha=1}
  function crater(n,rmin,rmax){for(var i=0;i<n;i++){var cx=r()*512,cy=r()*256,rr=rmin+r()*(rmax-rmin);x.globalAlpha=.35;x.fillStyle='#4b505c';x.beginPath();x.arc(cx,cy,rr,0,6.283);x.fill();x.globalAlpha=.4;x.strokeStyle='#d6dae4';x.lineWidth=1.2;x.beginPath();x.arc(cx-rr*.12,cy-rr*.12,rr,0,6.283);x.stroke()}x.globalAlpha=1}
  if(kind==='earth'){blob('#3d8a4b',26,14,46,.95,.7);blob('#7b9a45',14,8,26,.8,.7);blob('#c8b27a',8,6,20,.7,.6);blob('#ffffff',46,16,52,.28,.22);x.fillStyle='#f2f6ff';x.fillRect(0,0,512,14);x.fillRect(0,242,512,14)}
  else if(kind==='moon'){blob('#6c717d',12,20,60,.5,.8);crater(70,3,16);blob('#b8bdc8',20,10,30,.25)}
  else if(kind==='mars'){blob('#7a3322',18,18,56,.7,.6);blob('#d78d5b',22,10,40,.5,.6);crater(26,3,12);x.fillStyle='#f1e7de';x.fillRect(0,0,512,10);x.fillRect(0,246,512,10)}
  else if(kind==='venus'){for(var i=0;i<26;i++){x.globalAlpha=.22;x.fillStyle=i%2?'#f1dcae':'#b88c4e';x.fillRect(0,i*10,512,6+r()*8)}x.globalAlpha=1;blob('#fff2cf',24,20,70,.18,.35)}
  else if(kind==='jup'){var cols=['#d9b88f','#a47650','#e6d2b0','#8a5a3a','#c99a6a','#efe0c3'];for(var j=0;j<14;j++){x.fillStyle=cols[j%cols.length];x.globalAlpha=.8;x.fillRect(0,j*19,512,10+r()*12)}x.globalAlpha=1;x.fillStyle='#b5503a';x.beginPath();x.ellipse(330,150,30,16,0,0,6.283);x.fill()}
  else if(kind==='ast'){blob('#3d362e',22,10,40,.6);crater(46,3,14);blob('#9a8e7c',14,6,22,.35)}
  var t=new T.CanvasTexture(c);TEXC[kind]=t;return t;
}
function mat(color,rough,metal,extra){var o={color:color,roughness:rough==null?.6:rough,metalness:metal||0};if(extra)for(var k in extra)o[k]=extra[k];return new T.MeshStandardMaterial(o)}
function planet(kind,rad,atm){
  var g=new T.Group();
  var m=new T.Mesh(new T.SphereGeometry(rad,48,32),new T.MeshStandardMaterial({map:mkTex(kind),roughness:1,metalness:0,color:kind==='moon'?0x9ea4b0:0xffffff}));g.add(m);g.userData.body=m;
  if(atm){var a=new T.Mesh(new T.SphereGeometry(rad*1.045,40,24),new T.MeshBasicMaterial({color:atm,transparent:true,opacity:.2,side:T.BackSide,depthWrite:false,blending:T.AdditiveBlending}));g.add(a)}
  return g;
}
function asteroid(rad){
  var geo=new T.IcosahedronGeometry(rad,3),p=geo.attributes.position,r=rnd(11);
  for(var i=0;i<p.count;i++){var x=p.getX(i),y=p.getY(i),z=p.getZ(i),l=Math.sqrt(x*x+y*y+z*z),n=1+.18*Math.sin(x*1.3+y*.7)+.12*Math.sin(z*1.9-x*.5)+.06*(r()-.5);p.setXYZ(i,x/l*rad*n*1.15,y/l*rad*n*.85,z/l*rad*n)}
  geo.computeVertexNormals();
  return new T.Mesh(geo,new T.MeshStandardMaterial({map:mkTex('ast'),color:0xcdbfae,roughness:1,flatShading:true}));
}
function starfield(){
  var n=1400,pos=new Float32Array(n*3),r=rnd(5);
  for(var i=0;i<n;i++){var u=r()*2-1,a=r()*6.283,s=Math.sqrt(1-u*u),R=1100;pos[i*3]=R*s*Math.cos(a);pos[i*3+1]=R*u;pos[i*3+2]=R*s*Math.sin(a)}
  var g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));
  return new T.Points(g,new T.PointsMaterial({color:0xffffff,size:1.7,sizeAttenuation:false,transparent:true,opacity:.9,depthWrite:false}));
}
function glowSprite(col,size){var s=new T.Sprite(new T.SpriteMaterial({map:DOT,color:col,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));s.scale.set(size,size,1);return s}
/* ---- particules ---- */
function Parts(n,col,size,add){
  var pos=new Float32Array(n*3),vel=new Float32Array(n*3),life=new Float32Array(n);
  for(var i=0;i<n;i++){pos[i*3+1]=-9999;life[i]=0}
  var g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));
  var m=new T.PointsMaterial({color:col,size:size,map:DOT,transparent:true,depthWrite:false,blending:add===false?T.NormalBlending:T.AdditiveBlending,sizeAttenuation:true});
  var p=new T.Points(g,m);p.frustumCulled=false;
  p.userData={pos:pos,vel:vel,life:life,n:n,i:0};
  p.emit=function(x,y,z,vx,vy,vz,l){var u=p.userData,k=u.i;u.i=(k+1)%u.n;u.pos[k*3]=x;u.pos[k*3+1]=y;u.pos[k*3+2]=z;u.vel[k*3]=vx;u.vel[k*3+1]=vy;u.vel[k*3+2]=vz;u.life[k]=l};
  p.step=function(dt,drag){var u=p.userData;for(var i=0;i<u.n;i++){if(u.life[i]>0){u.life[i]-=dt;u.pos[i*3]+=u.vel[i*3]*dt;u.pos[i*3+1]+=u.vel[i*3+1]*dt;u.pos[i*3+2]+=u.vel[i*3+2]*dt;if(drag){u.vel[i*3]*=drag;u.vel[i*3+1]*=drag;u.vel[i*3+2]*=drag}if(u.life[i]<=0)u.pos[i*3+1]=-9999}}p.geometry.attributes.position.needsUpdate=true};
  return p;
}
/* ---- objets ---- */
function shipObj(){
  var g=new T.Group(),body=new T.Group();g.add(body);
  var white=mat(0xe9eef8,.45,.2),gold=mat(0xd6a53a,.35,.7),dark=mat(0x222a40,.7,.3),blue=mat(0x1c46a8,.3,.5,{emissive:0x0b1f66});
  function cyl(rt,rb,h,m,x){var o=new T.Mesh(new T.CylinderGeometry(rt,rb,h,24),m);o.rotation.z=-Math.PI/2;o.position.x=x;body.add(o);return o}
  cyl(.5,.5,1.5,white,0);cyl(.5,.5,.95,gold,-1.2);cyl(.12,.5,.9,white,1.15);cyl(.42,.2,.4,dark,-1.85);
  var nose=new T.Mesh(new T.SphereGeometry(.14,12,8),white);nose.position.x=1.62;body.add(nose);
  var win=new T.Mesh(new T.SphereGeometry(.13,10,8),mat(0x8fd0ff,.2,.3,{emissive:0x3a7fb8}));win.position.set(.55,.34,0);body.add(win);
  var pa=[];
  [-1,1].forEach(function(s){
    var arm=new T.Mesh(new T.CylinderGeometry(.04,.04,.9,8),dark);arm.rotation.x=Math.PI/2;arm.position.set(-1.1,0,s*.7);body.add(arm);
    var pn=new T.Mesh(new T.BoxGeometry(1.1,.04,1.8),blue);pn.position.set(-1.1,0,s*(1.15+.9));body.add(pn);
    var grid=new T.Mesh(new T.BoxGeometry(1.12,.045,.03),mat(0xaec6ff,.4,.3));for(var k=-3;k<=3;k++){var gg=grid.clone();gg.position.set(0,0,k*.28);pn.add(gg)}
    pa.push(pn);
  });
  var dish=new T.Mesh(new T.ConeGeometry(.3,.16,20,1,true),mat(0xf2f4fa,.4,.4,{side:T.DoubleSide}));dish.position.set(.1,.75,0);dish.rotation.x=Math.PI;body.add(dish);
  var mast=new T.Mesh(new T.CylinderGeometry(.025,.025,.35,6),dark);mast.position.set(.1,.55,0);body.add(mast);
  var flame=new T.Group(),f1=new T.Mesh(new T.ConeGeometry(.34,2.1,16),new T.MeshBasicMaterial({color:0xff8a3a,transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false})),f2=new T.Mesh(new T.ConeGeometry(.18,1.3,12),new T.MeshBasicMaterial({color:0xfff2c8,transparent:true,opacity:.95,blending:T.AdditiveBlending,depthWrite:false}));
  f1.rotation.z=Math.PI/2;f1.position.x=-3.05;f2.rotation.z=Math.PI/2;f2.position.x=-2.6;flame.add(f1,f2);flame.visible=false;g.add(flame);
  var fl=new T.PointLight(0xff9a50,0,14);fl.position.set(-3,0,0);g.add(fl);
  var shield=new T.Mesh(new T.SphereGeometry(2.5,24,16),new T.MeshBasicMaterial({color:0x66b8ff,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));g.add(shield);
  g.userData={body:body,flame:flame,light:fl,panels:pa,shield:shield,dish:dish,f1:f1,f2:f2};
  return g;
}
function rocketObj(){
  var g=new T.Group(),white=mat(0xf4f6fb,.4,.1),red=mat(0xd2452f,.5,.1),dark=mat(0x20263a,.7,.3);
  var b=new T.Mesh(new T.CylinderGeometry(.55,.6,4.2,24),white);g.add(b);
  var st=new T.Mesh(new T.CylinderGeometry(.56,.56,.5,24),dark);st.position.y=.6;g.add(st);
  var n=new T.Mesh(new T.ConeGeometry(.55,1.5,24),red);n.position.y=2.85;g.add(n);
  for(var i=0;i<4;i++){var f=new T.Mesh(new T.BoxGeometry(.06,1.1,.7),red);var a=i*Math.PI/2;f.position.set(Math.cos(a)*.75,-1.6,Math.sin(a)*.75);f.rotation.y=-a;g.add(f)}
  var eng=new T.Mesh(new T.CylinderGeometry(.3,.45,.5,16),dark);eng.position.y=-2.3;g.add(eng);
  var fl=new T.Group(),a1=new T.Mesh(new T.ConeGeometry(.5,3.2,16),new T.MeshBasicMaterial({color:0xff8a3a,transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false})),a2=new T.Mesh(new T.ConeGeometry(.26,2,12),new T.MeshBasicMaterial({color:0xfff2c8,transparent:true,opacity:.95,blending:T.AdditiveBlending,depthWrite:false}));
  a1.rotation.x=Math.PI;a1.position.y=-4.1;a2.rotation.x=Math.PI;a2.position.y=-3.6;fl.add(a1,a2);fl.visible=false;g.add(fl);
  var lt=new T.PointLight(0xff9a50,0,22);lt.position.y=-3;g.add(lt);
  g.userData={flame:fl,light:lt,a1:a1,a2:a2};return g;
}
function landerObj(){
  var g=new T.Group(),gold=mat(0xd2a23c,.4,.7),dark=mat(0x2a3148,.7,.3),white=mat(0xe9edf6,.5,.2);
  var b=new T.Mesh(new T.CylinderGeometry(.9,1.05,.9,8),gold);b.position.y=1.5;g.add(b);
  var t=new T.Mesh(new T.CylinderGeometry(.6,.9,.5,8),white);t.position.y=2.2;g.add(t);
  var d=new T.Mesh(new T.ConeGeometry(.32,.18,16,1,true),mat(0xf3f5fa,.4,.4,{side:T.DoubleSide}));d.position.set(.3,2.7,0);d.rotation.x=Math.PI;g.add(d);
  for(var i=0;i<4;i++){var a=i*Math.PI/2+Math.PI/4,leg=new T.Mesh(new T.CylinderGeometry(.05,.05,1.5,6),dark);leg.position.set(Math.cos(a)*.95,.75,Math.sin(a)*.95);leg.rotation.z=Math.cos(a)*.5;leg.rotation.x=-Math.sin(a)*.5;g.add(leg);var ft=new T.Mesh(new T.CylinderGeometry(.22,.22,.05,12),dark);ft.position.set(Math.cos(a)*1.25,.03,Math.sin(a)*1.25);g.add(ft)}
  var eng=new T.Mesh(new T.ConeGeometry(.35,.5,12),dark);eng.position.y=.95;eng.rotation.x=Math.PI;g.add(eng);
  var fl=new T.Mesh(new T.ConeGeometry(.3,1.6,12),new T.MeshBasicMaterial({color:0xff9a50,transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false}));fl.rotation.x=Math.PI;fl.position.y=.2;fl.visible=false;g.add(fl);
  g.userData={flame:fl};return g;
}
function roverObj(){
  var g=new T.Group(),w=mat(0xe7ebf5,.5,.2),d=mat(0x1b2033,.8,.2);
  var b=new T.Mesh(new T.BoxGeometry(1.5,.4,.9),w);b.position.y=.55;g.add(b);
  for(var i=0;i<4;i++){var wh=new T.Mesh(new T.CylinderGeometry(.26,.26,.2,12),d);wh.rotation.x=Math.PI/2;wh.position.set(i<2?.55:-.55,.28,i%2?.5:-.5);g.add(wh)}
  var m=new T.Mesh(new T.CylinderGeometry(.03,.03,.8,6),d);m.position.set(.5,1.1,0);g.add(m);
  var p=new T.Mesh(new T.BoxGeometry(.9,.03,.7),mat(0x1c46a8,.3,.5,{emissive:0x0b1f66}));p.position.set(-.1,.85,0);g.add(p);
  var cam2=new T.Mesh(new T.BoxGeometry(.22,.18,.22),d);cam2.position.set(.5,1.52,0);g.add(cam2);
  return g;
}
function astroObj(){
  var g=new T.Group(),w=mat(0xf2f4fa,.6,.05),gd=mat(0xc9962f,.2,.8),dk=mat(0x2a3148,.7,.2);
  var b=new T.Mesh(new T.CylinderGeometry(.2,.24,.6,12),w);b.position.y=.8;g.add(b);
  var pk=new T.Mesh(new T.BoxGeometry(.26,.45,.14),w);pk.position.set(-.2,.85,0);g.add(pk);
  var h=new T.Mesh(new T.SphereGeometry(.22,16,12),w);h.position.y=1.28;g.add(h);
  var v=new T.Mesh(new T.SphereGeometry(.16,14,10),gd);v.position.set(.1,1.3,0);v.scale.set(.9,.85,.95);g.add(v);
  [-1,1].forEach(function(s){var l=new T.Mesh(new T.CylinderGeometry(.075,.08,.5,8),w);l.position.set(0,.3,s*.1);g.add(l);var bt=new T.Mesh(new T.BoxGeometry(.2,.09,.11),dk);bt.position.set(.04,.04,s*.1);g.add(bt);var ar=new T.Mesh(new T.CylinderGeometry(.06,.065,.45,8),w);ar.position.set(0,.85,s*.3);ar.rotation.x=s*.35;g.add(ar)});
  g.userData={};return g;
}
function terrain(col,seed,size,amp,fogCol){
  var geo=new T.PlaneGeometry(size,size,70,70);geo.rotateX(-Math.PI/2);var p=geo.attributes.position,r=rnd(seed);
  var ph=[r()*6,r()*6,r()*6];
  for(var i=0;i<p.count;i++){var x=p.getX(i),z=p.getZ(i),d=Math.sqrt(x*x+z*z),flat=clamp((d-6)/14,0,1);
    var h=(Math.sin(x*.11+ph[0])*Math.cos(z*.09+ph[1])*1.2+Math.sin(x*.27+z*.21+ph[2])*.45+Math.sin(x*.6)*Math.cos(z*.55)*.12)*amp*flat;
    var cr=Math.sin(d*.5)*0;p.setY(i,h+cr)}
  geo.computeVertexNormals();
  var t=new T.Mesh(geo,new T.MeshStandardMaterial({color:col,roughness:1,flatShading:true}));
  var rk=rnd(seed+3),rocks=new T.Group();
  for(var k=0;k<46;k++){var a=rk()*6.283,dd=7+rk()*34,s=.18+rk()*.7,m=new T.Mesh(new T.DodecahedronGeometry(s,0),new T.MeshStandardMaterial({color:col,roughness:1,flatShading:true}));m.position.set(Math.cos(a)*dd,s*.3,Math.sin(a)*dd);m.rotation.set(rk()*3,rk()*3,rk()*3);m.scale.y=.6;rocks.add(m)}
  t.add(rocks);return t;
}
function blobShadow(rad){var m=new T.Mesh(new T.CircleGeometry(rad,24),new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.35,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=.02;return m}
function disp(o){o.traverse(function(c){if(c.geometry&&!c.userData.keep)c.geometry.dispose()})}
/* ---- état de la scène ---- */
var A=null,F={storm:0,night:0,dust:0,comms:0,burn:0,eva:0,black:0,dmg:0,alert:0,fail:0,meteor:0,boom:0},prog=0,warpT=0,shake=0,pulseT=0,pulseK='',burstT=0,burstK='';
var stars=starfield();sc.add(stars);
var streak=new Parts(260,0xffd9a0,.5,true);camR.add(streak);
var sparks=new Parts(120,0xffc070,.45,true);
var smoke=new Parts(90,0x6a6f80,1.6,false);
var boom=new Parts(240,0xff9a4a,.9,true);
var dust=new Parts(180,0xd49a6a,.9,false);
var exh=new Parts(160,0xff9a50,.8,true);
G.add(sparks,smoke,boom,dust,exh);
var lookT=V(0,0,0),look=V(0,0,0),camT=V(0,2,14);
function clear(){
  while(G.children.length>5){var o=G.children[G.children.length-1];G.remove(o);disp(o)}
  // les 5 premiers enfants sont les systèmes de particules
}
function reorder(){}
function setFog(c,d){sc.fog=c?new T.FogExp2(c,d):null}
function lightsDefault(){amb.intensity=.5;sun.intensity=1.15;sun.color.set(0xffffff);hemi.intensity=.25}
/* --- construction --- */
var DEFS={leo:{r:0},moon:{r:3.4,k:'moon',D:92},venus:{r:7.5,k:'venus',D:110,atm:0xffd89a},mars:{r:5.4,k:'mars',D:110,atm:0xff9a6a},ast:{r:4.4,k:'ast',D:100},jup:{r:13,k:'jup',D:150,atm:0xe6c9a0}};
var MCP={lune:'moon',sol:'moon',mars:'mars',base:'mars',ast:'ast'};
function buildSpace(dest,opts){
  var d=DEFS[dest]||DEFS.moon,o=A;
  o.dest=dest;o.def=d;o.land=!!(opts&&opts.land);
  o.earth=planet('earth',9,0x6fa8ff);o.earth.position.set(0,0,0);G.add(o.earth);
  o.moonE=null;
  if(d.r){var pl=d.k==='ast'?asteroid(d.r):planet(d.k,d.r,d.atm);pl.position.set(d.D,0,0);G.add(pl);o.dst=pl}
  o.ship=shipObj();G.add(o.ship);o.ship.position.set(0,9.6,0);o.ship.visible=false;
  o.rocket=rocketObj();G.add(o.rocket);o.rocket.position.set(0,9+2.5,0);
  o.stage=null;
  var sg=glowSprite(0xfff1c8,120);sg.position.set(-420,160,-260);G.add(sg);
  sun.position.set(-300,110,-180);
  o.beam=null;o.ph=-1;o.pad=true;o.ascT=0;o.ang=0;o.lastPos=V(0,0,0);
  o.flag=null;
}
function buildCadet(key,opts){
  var o=A;o.key=key;o.ang=0;o.rv=[];
  lightsDefault();
  if(key==='lune'){
    var moon=planet('moon',7,null);moon.position.set(0,-1,0);G.add(moon);o.dst=moon;
    var e=planet('earth',2.2,0x6fa8ff);e.position.set(-46,10,-70);G.add(e);o.earth=e;
    o.ship=shipObj();o.ship.scale.setScalar(.9);G.add(o.ship);
    sun.position.set(40,18,24);
    var sg=glowSprite(0xfff1c8,90);sg.position.set(300,120,-200);G.add(sg);
    o.astro=astroObj();o.astro.scale.setScalar(.7);o.astro.visible=false;G.add(o.astro);
  }else if(key==='sol'||key==='base'||key==='ast'){
    var isM=key==='base',isA=key==='ast';
    if(isA){
      var a=asteroid(8);a.position.set(0,-4,0);G.add(a);o.dst=a;
      o.lander=landerObj();o.lander.scale.setScalar(.7);o.lander.position.set(0,4.6,0);G.add(o.lander);
      sun.position.set(30,22,10);
      var dd=new T.Group();for(var i=0;i<22;i++){var m=new T.Mesh(new T.DodecahedronGeometry(.18+Math.random()*.35,0),mat(0x8a7f70,1,0,{flatShading:true}));m.userData={a:Math.random()*6.283,r:11+Math.random()*9,y:(Math.random()-.5)*6,s:.1+Math.random()*.25};dd.add(m)}G.add(dd);o.deb=dd;
      o.astro=astroObj();o.astro.scale.setScalar(.85);G.add(o.astro);
      var sg0=glowSprite(0xfff1c8,70);sg0.position.set(250,120,-200);G.add(sg0);
    }else{
      var tr=terrain(isM?0xa4503a:0x8b909c,isM?7:3,150,isM?1.6:1.2);G.add(tr);o.terr=tr;
      o.lander=landerObj();G.add(o.lander);o.lander.position.set(isM?-6:0,0,isM?-2:0);
      if(isM){
        var dm=new T.Mesh(new T.SphereGeometry(3,32,16,0,Math.PI*2,0,Math.PI/2),new T.MeshStandardMaterial({color:0xdde6ff,transparent:true,opacity:.42,roughness:.15,metalness:.2,side:T.DoubleSide}));dm.position.set(4,0,-3);G.add(dm);o.dome=dm;
        var wl=[];for(var k=0;k<5;k++){var wm=new T.Mesh(new T.BoxGeometry(.5,.45,.05),new T.MeshBasicMaterial({color:0xffd27a}));var aa=k*1.1+.3;wm.position.set(4+Math.cos(aa)*1.4,.9,-3+Math.sin(aa)*1.4);wm.lookAt(4,.9,-3);G.add(wm);wl.push(wm)}o.win=wl;
        for(var q=0;q<5;q++){var pp=new T.Mesh(new T.BoxGeometry(2.2,.06,1.3),mat(0x1c46a8,.3,.5,{emissive:0x0b1f66}));pp.position.set(9+q*2.6,.9,-5);pp.rotation.x=-.5;G.add(pp);var st=new T.Mesh(new T.CylinderGeometry(.05,.05,.9,6),mat(0x2a3148));st.position.set(9+q*2.6,.45,-5);G.add(st)}
        var dv=new T.Mesh(new T.CylinderGeometry(.2,2,9,16,1,true),new T.MeshBasicMaterial({color:0xd49a6a,transparent:true,opacity:.18,depthWrite:false,side:T.DoubleSide}));dv.position.set(-16,4.5,-14);G.add(dv);o.devil=dv;
        var ph=planet('ast',1.4,null);ph.position.set(24,26,-58);G.add(ph);
        sun.color.set(0xffe2c8);sun.intensity=1.2;hemi.color.set(0xd88a60);hemi.intensity=.35;
        var sg1=glowSprite(0xffd6a0,60);sg1.position.set(-120,50,-190);G.add(sg1);sun.position.set(-60,35,-40);
      }else{
        var fl=new T.Group(),pole=new T.Mesh(new T.CylinderGeometry(.04,.04,3,6),mat(0xdfe3ee));pole.position.y=1.5;fl.add(pole);var cl=new T.Mesh(new T.BoxGeometry(1.3,.8,.03),mat(0xffc12e,.7,0,{emissive:0x7a5400}));cl.position.set(.65,2.6,0);fl.add(cl);fl.position.set(7,0,4);G.add(fl);
        var e2=planet('earth',2.4,0x6fa8ff);e2.position.set(-34,24,-62);G.add(e2);o.earth=e2;
        sun.position.set(40,12,20);
        var sg2=glowSprite(0xfff1c8,60);sg2.position.set(160,50,-120);G.add(sg2);
      }
      o.rover=roverObj();G.add(o.rover);o.astro=astroObj();G.add(o.astro);
      var sh=blobShadow(1.5);sh.position.copy(o.lander.position);sh.position.y=.04;G.add(sh);
    }
  }else{ // transit (mars)
    var e3=planet('earth',4.2,0x6fa8ff);e3.position.set(-34,0,0);G.add(e3);o.earth=e3;
    var m3=planet('mars',3.4,0xff9a6a);m3.position.set(34,0,-8);G.add(m3);o.dst=m3;
    o.ship=shipObj();G.add(o.ship);
    sun.position.set(0,30,-160);
    var sg3=glowSprite(0xfff1c8,160);sg3.position.set(0,40,-380);G.add(sg3);
    var curve=new T.QuadraticBezierCurve3(V(-27,1,0),V(0,12,16),V(26,.5,-4));o.curve=curve;
    var pts=curve.getPoints(60),lg=new T.BufferGeometry().setFromPoints(pts),ln=new T.Line(lg,new T.LineBasicMaterial({color:0x7fb4ff,transparent:true,opacity:.35}));G.add(ln);
    o.astro=astroObj();o.astro.scale.setScalar(.8);o.astro.visible=false;G.add(o.astro);
  }

  // Architecture propre à chaque mission personnalisée : chaque véhicule reçoit
  // des équipements visibles spécifiques, sans modifier les calculs de mission.
  function missionKit(key){
    var silver=mat(0xdce5f4,.42,.35),gold=mat(0xe5b84b,.35,.65),blue=mat(0x2453c7,.32,.55,{emissive:0x10265c}),dark=mat(0x20283b,.7,.3),white=mat(0xf2f5fc,.45,.18),orange=mat(0xc86d3d,.55,.18);
    function box(w,h,d,m,x,y,z,parent){var q=new T.Mesh(new T.BoxGeometry(w,h,d),m);q.position.set(x,y,z);(parent||G).add(q);return q}
    function cyl(rt,rb,h,m,x,y,z,parent){var q=new T.Mesh(new T.CylinderGeometry(rt,rb,h,12),m);q.position.set(x,y,z);(parent||G).add(q);return q}
    function panel(x,y,z,w,h,rot,parent){var q=box(w,.08,h,blue,x,y,z,parent);q.rotation.y=rot||0;for(var i=1;i<5;i++)box(w,.025,.025,silver,x-w/2+w*i/5,y+.05,z,parent);return q}
    if(key==='lune'){
      // Orbiteur habité : capsule, deux grandes ailes solaires et antenne longue portée.
      if(o.ship){var b=o.ship.userData&&o.ship.userData.body||o.ship;box(.65,.48,.62,white,-.35,.42,0,b);box(.34,.28,.34,blue,-.35,.7,0,b);panel(-1.2,.05,-2.15,1.55,2.1,0,b);panel(-1.2,.05,2.15,1.55,2.1,0,b);cyl(.035,.035,.85,gold,.1,1.05,0,b).rotation.z=.2;}
    }else if(key==='sol'){
      // Module lunaire : pattes renforcées, réservoirs d'atterrissage et instruments de surface.
      if(o.lander){var l=o.lander;for(var j=0;j<4;j++){var a=j*Math.PI/2+.4;var str=new T.Mesh(new T.CylinderGeometry(.045,.06,1.05,7),silver);str.position.set(Math.cos(a)*1.35,.6,Math.sin(a)*1.35);str.rotation.z=Math.cos(a)*.35;str.rotation.x=-Math.sin(a)*.35;l.add(str);cyl(.12,.12,.08,dark,Math.cos(a)*1.65,.08,Math.sin(a)*1.65,l)}box(.45,.42,.4,blue,0,2.75,0,l);box(.22,.12,.22,gold,.1,3.03,0,l)}
      if(o.rover){box(.4,.28,.35,orange,0,.68,0,o.rover);panel(-.15,.95,0,.9,.75,0,o.rover)}
    }else if(key==='mars'){
      // Vaisseau interplanétaire : habitat central, blindage anti-radiation, grandes ailes solaires.
      if(o.ship){var b2=o.ship.userData&&o.ship.userData.body||o.ship;box(.9,.55,.75,orange,-.3,.15,0,b2);cyl(.42,.42,.13,gold,-.4,.65,0,b2);panel(-1.5,.05,-2.65,2.1,2.35,0,b2);panel(-1.5,.05,2.65,2.1,2.35,0,b2);cyl(.045,.045,1.25,silver,.15,1.15,0,b2);var dish=new T.Mesh(new T.SphereGeometry(.42,16,8,0,Math.PI*2,0,Math.PI/2),white);dish.position.set(.2,1.6,0);dish.rotation.x=Math.PI; b2.add(dish);}
    }else if(key==='base'){
      // Base de surface : habitat pressurisé, sas, panneaux solaires et relais météo.
      if(o.lander){var l2=o.lander;box(1.25,1.15,1.05,white,0,2.85,0,l2);box(.8,.55,.07,blue,0,2.9,.55,l2);cyl(.25,.25,.5,dark,.8,2.55,0,l2);box(.55,.4,.55,orange,-.95,2.5,0,l2);}
      for(var k=0;k<4;k++)panel(8+k*2.4,.95,-5,1.8,1.3,-.3,G);
      if(o.rover){box(.65,.35,.65,orange,0,.8,0,o.rover);cyl(.04,.04,.65,silver,.55,1.25,0,o.rover);box(.34,.2,.28,blue,.55,1.6,0,o.rover)}
    }else if(key==='ast'){
      // Sonde d'échantillonnage : bras de prélèvement, harpons d'ancrage et conteneur.
      if(o.lander){var la=o.lander;for(var n=0;n<3;n++){var side=n-1;var arm=new T.Mesh(new T.CylinderGeometry(.055,.07,1.25,8),silver);arm.position.set(side*.85,1.1,.75);arm.rotation.z=side*.45;la.add(arm);var claw=new T.Mesh(new T.TorusGeometry(.16,.035,6,12),gold);claw.position.set(side*1.12,.52,.75);claw.rotation.x=Math.PI/2;la.add(claw)}box(.45,.48,.45,orange,-.2,2.8,0,la);box(.28,.28,.28,gold,-.2,3.18,0,la);}
      if(o.astro){/* robot d'échantillonnage déjà présent : bras visuellement accentués */}
    }
  }
  missionKit(key);
}
function build(kind,opts){
  clear();A={kind:kind,opts:opts||{},t:0};lightsDefault();setFog(null);
  hemi.color.set(0x7f9bff);hemi.intensity=.18;
  if(kind.indexOf('a:')===0)buildSpace(kind.slice(2),opts);
  else if(kind.indexOf('i:')===0){var ik=kind.slice(2);buildSpace(opts&&opts.dest||'moon',opts);A.inter=ik;A.rocket.visible=false;A.ship.visible=true;A.ph=6;A.pad=false}
  else if(kind.indexOf('c:')===0)buildCadet(kind.slice(2),opts);
  if(kind.indexOf('c:')===0){var k=kind.slice(2);if(k==='sol')setFog(0x05080f,.006);else if(k==='base')setFog(0x3a1c12,.012)}
  snap=true;dirty=true;
}
var snap=true;
/* --- animation --- */
function ease(x){return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2}
function setBurn(ship,on,k){
  var u=ship.userData;if(!u)return;
  if(u.flame){u.flame.visible=on;if(u.light)u.light.intensity=on?2.2+Math.random()*1.2:0;if(on&&u.f1){u.f1.scale.y=.8+Math.random()*.5;u.f2.scale.y=.8+Math.random()*.5}}
}
function animSpace(dt){
  var o=A,i=o.ph,d=o.def,ship=o.ship,t=o.t,rk=o.rocket;
  var asc=!o.pad&&i===0;
  if(asc)o.ascT=Math.min(1.4,o.ascT+dt/2.2);
  var padY=9+2.5;
  // fusée
  if(i===0&&!o.fail){
    var e=ease(clamp(o.ascT,0,1));
    rk.visible=true;rk.position.set(e*14,padY+e*34+Math.max(0,o.ascT-1)*40,0);rk.rotation.z=-e*.85;
    var burn=asc;rk.userData.flame.visible=burn;rk.userData.light.intensity=burn?3+Math.random()*2:0;if(burn){rk.userData.a1.scale.y=.8+Math.random()*.5;for(var q=0;q<3;q++){var rr=rk.rotation.z;exh.emit(rk.position.x+Math.sin(rr)*2.4,rk.position.y-Math.cos(rr)*2.4,(Math.random()-.5)*.5,-Math.sin(rr)*(2+Math.random()*3),-Math.cos(rr)*(4+Math.random()*3),(Math.random()-.5)*1.5,1.1)}}
    ship.visible=false;ship.position.copy(rk.position);
  }else if(i>=1&&rk.visible){ // séparation d'étage
    if(!o.stage){o.stage=rk;o.stageT=0}
    o.stageT+=dt;rk.position.x+=dt*2;rk.position.y-=dt*(4+o.stageT*3);rk.rotation.z+=dt*1.4;rk.userData.flame.visible=false;rk.userData.light.intensity=0;
    if(o.stageT>3.2)rk.visible=false;
    ship.visible=!o.fail;
  }else if(i>=1)ship.visible=!o.fail;
  // positions du vaisseau selon la phase
  var pr=[0,.04,.22,.5,.68,.9,1,1,1][Math.max(0,i)],tgt=V(0,0,0),yaw=null;
  var x0=13,x1=d.r?d.D-d.r-11:30;
  if(i>=1&&o.inter==null){
    if(!d.r){ // LEO : orbite autour de la Terre
      o.ang+=dt*.22;tgt.set(Math.cos(o.ang)*14,Math.sin(o.ang*.5)*3,Math.sin(o.ang)*14);
    }else if(i<=5){tgt.set(x0+(x1-x0)*ease(pr),2+Math.sin(t*.4)*.6,0)}
    else if(o.land){ // atterrissage
      var topx=d.D,topy=d.r;
      var dsc=i===6?(1-clamp(o.t6/2.2,0,1)):0;
      tgt.set(topx-.2,topy+.95+dsc*10,0)
    }else{o.ang+=dt*.28;var rr=d.r+6+(d.k==='jup'?4:0);tgt.set(d.D+Math.cos(o.ang)*rr,Math.sin(o.ang*.6)*2.2,Math.sin(o.ang)*rr)}
  }else if(o.inter!=null){o.ang+=dt*.15;tgt.set(d.D-d.r-9+Math.sin(o.ang)*.6,.4+Math.cos(o.ang*1.3)*.3,6)}
  else tgt.copy(ship.position);
  if(i>=1||o.inter!=null){
    if(snap)ship.position.copy(tgt);else ship.position.lerp(tgt,1-Math.exp(-dt*(i>=6&&o.land?2.4:1.6)));
    var vel=ship.position.clone().sub(o.lastPos);
    if(o.land&&i>=6&&o.inter==null){ship.rotation.set(0,0,Math.PI/2)}
    else if(vel.lengthSq()>1e-6){var tg=Math.atan2(-vel.z,vel.x);ship.rotation.y+=(tg-ship.rotation.y)*.12;ship.rotation.z*=.9}
    else if(!d.r||o.inter!=null)ship.rotation.y+=.002;
    o.lastPos.copy(ship.position);
  }
  // flamme du vaisseau
  var burnShip=(F.burn&&i>=1&&!o.fail)||(o.inter==='burn'&&(pulseT>0||true)&&(pulseT>0));
  var landing=o.land&&i===6&&o.t6<2.2&&!o.fail&&o.inter==null;
  setBurn(ship,!!(burnShip||landing),0);
  // panneaux : se déploient en phase 1
  var depl=i>=2?1:i===1?clamp(o.t1/1.6,0,1):0;
  ship.userData.panels.forEach(function(p,k){p.scale.z=Math.max(.05,depl);p.position.z=(k?1:-1)*(0.15+(1.05+.9*0)*depl+.0);p.visible=i>=1||o.inter!=null});
  if(o.inter===null||o.inter==null){}
  // bouclier (interlude)
  var sh=ship.userData.shield;sh.material.opacity+=((o.inter==='shield'?(.12+.08*Math.sin(t*3)+(pulseT>0?.22:0)):0)-sh.material.opacity)*.1;
  if(o.inter==='power'){ship.userData.panels.forEach(function(p){p.material.emissiveIntensity=1+Math.sin(t*4)*.6+(pulseT>0?2:0)})}
  // caméra
  var cp=V(0,0,0),lk=V(0,0,0);
  if(i<=0||(i===0&&o.pad)){
    if(o.pad){cp.set(10,11.8,17);lk.set(0,12.6,0)}
    else{var rp=rk.position;cp.set(rp.x-7,rp.y-3,11);lk.set(rp.x+2,rp.y+3,0)}
  }else if(o.inter!=null){cp.set(ship.position.x-3.5+Math.sin(t*.2)*1.5,ship.position.y+1.6,ship.position.z+9);lk.copy(ship.position).add(V(2,0,0))}
  else if(!d.r){cp.set(0,6+Math.sin(t*.1)*2,27);lk.set(0,0,0);if(i>=1)lk.lerp(ship.position,.3)}
  else if(i<=4){var sp=ship.position;cp.set(sp.x-8.5,sp.y+3,12);lk.set(sp.x+10,sp.y,0)}
  else if(i===5){var sp2=ship.position;cp.set(sp2.x-5,sp2.y+3.5,13);lk.set(d.D-3,0,0)}
  else if(o.land){cp.set(d.D-7.5,d.r+3.2,10.5);lk.set(d.D,d.r+1.4,0)}
  else{cp.set(d.D-d.r*.8,d.r*.6+4,d.r+17);lk.set(d.D,0,0).lerp(ship.position,.25)}
  camT.copy(cp);lookT.copy(lk);
  o.t6=(i===6)?(o.t6||0)+dt:(i>6?9:0);o.t1=(i===1)?(o.t1||0)+dt:(i>1?9:0);
  if(i<6)o.t6=0;
  // comms
  if(!o.beamSph){o.beamSph=[];for(var b=0;b<4;b++){var s=glowSprite(0x7fe0ff,2.4);s.visible=false;G.add(s);o.beamSph.push(s)}}
  var tgtB=(o.land&&i>=6)||d.r===0?o.earth.position:o.earth.position;
  o.beamSph.forEach(function(s,k){s.visible=!!F.comms&&ship.visible;if(s.visible){var u=((t*.5+k/4)%1);s.position.lerpVectors(ship.position,tgtB,u)}});
  // planètes
  if(o.earth)o.earth.rotation.y+=dt*.02;
  if(o.dst&&d.k!=='ast')o.dst.rotation.y+=dt*.03;if(o.dst&&d.k==='ast'){o.dst.rotation.y+=dt*.1;o.dst.rotation.x+=dt*.05}
}
function animCadet(dt){
  var o=A,k=o.key,t=o.t,mode=0;
  var cp=V(0,2,16),lk=V(0,0,0);
  var sh=o.ship;
  if(k==='lune'){
    o.ang+=dt*.35;var R=11;var ox=Math.cos(o.ang)*R,oz=Math.sin(o.ang)*R*.8,oy=Math.sin(o.ang*.7)*2.5-1;
    sh.position.set(ox,oy,oz);sh.rotation.y=-(o.ang+Math.PI/2);
    o.dst.rotation.y+=dt*.04;
    cp.set(Math.sin(t*.06)*8,6+Math.sin(t*.04)*2,30);lk.set(0,-.5,0).lerp(sh.position,.25);
    if(F.eva){o.astro.visible=true;o.astro.position.set(sh.position.x+Math.sin(t)*.6,sh.position.y+2+Math.sin(t*1.4)*.3,sh.position.z+2);o.astro.rotation.set(Math.sin(t)*.4,t*.3,Math.cos(t*.8)*.4)}else o.astro.visible=false;
    setBurn(sh,!!F.burn&&!F.fail,0);
    var mxp=sh.position;
  }else if(k==='mars'){
    var p=clamp(prog,0,1);o.pp=(o.pp==null?p:o.pp+(p-o.pp)*(1-Math.exp(-dt*1.2)));
    var pos=o.curve.getPoint(o.pp),pos2=o.curve.getPoint(Math.min(1,o.pp+.02));
    sh.position.copy(pos);var dv=pos2.clone().sub(pos);sh.rotation.y=-Math.atan2(dv.z,dv.x);sh.rotation.z=Math.atan2(dv.y,Math.hypot(dv.x,dv.z));
    o.earth.rotation.y+=dt*.05;o.dst.rotation.y+=dt*.05;
    cp.set(pos.x-9+Math.sin(t*.2)*3,pos.y+5,pos.z+19);lk.copy(pos).add(V(9,-.5,-2));
    setBurn(sh,!!F.burn&&!F.fail,0);
    if(F.eva){o.astro.visible=true;o.astro.position.set(pos.x+Math.sin(t)*.5,pos.y+2,pos.z+2);o.astro.rotation.set(Math.sin(t)*.4,t*.3,0)}else o.astro.visible=false;
    mxp=pos;
  }else if(k==='ast'){
    o.dst.rotation.y+=dt*.05;
    var ang=t*.12;cp.set(Math.cos(ang)*16,5+Math.sin(t*.1)*1.5,Math.sin(ang)*16+4);lk.set(0,3,0);
    o.deb.children.forEach(function(m){var u=m.userData;u.a+=dt*u.s;m.position.set(Math.cos(u.a)*u.r,u.y,Math.sin(u.a)*u.r);m.rotation.x+=dt;m.rotation.y+=dt*.7});
    var ev=F.eva;o.astro.visible=true;o.astro.position.set(Math.sin(t*.5)*(ev?3.5:1.6)+2.5,ev?5.5+Math.sin(t)*.4:4.2,ev?2.5:1.5);o.astro.rotation.y=t*.3;
    var drill=F.burn;o.lander.userData.flame.visible=!!drill&&!F.fail;
    if(F.comms===0&&!drill&&Math.random()<.02)sparks.emit(0,4.4,0,(Math.random()-.5)*2,Math.random()*2,(Math.random()-.5)*2,.6);
    mxp=V(0,4,0);
  }else{ // surface
    var isM=k==='base';
    o.lander.userData.flame.visible=!!F.burn&&!F.fail;
    var ang2=t*.08+(isM?.6:0);var cr=isM?18:15;cp.set(Math.cos(ang2)*cr,4.2+Math.sin(t*.12)*.8,Math.sin(ang2)*cr);lk.set(isM?1:0,1.6,isM?-2:0);
    var rr=o.rover,ra=t*.25;rr.position.set(Math.cos(ra)*(isM?9:7),.05,Math.sin(ra)*(isM?9:7));rr.rotation.y=-ra-Math.PI/2*-1;
    var evOn=F.eva;o.astro.visible=true;
    var ax=(isM?3:2.4)+(evOn?Math.sin(t*.7)*3.5:.8),az=(isM?.5:2)+(evOn?Math.cos(t*.5)*2.5:0);
    o.astro.position.set(ax,0,az);o.astro.rotation.y=(evOn?t*.7:2.3)+Math.PI;o.astro.children.forEach(function(c){});
    o.astro.scale.setScalar(1.15);o.astro.position.y=0+(evOn?Math.abs(Math.sin(t*3))*.08:0);
    if(isM){o.devil.rotation.y+=dt*3;o.devil.position.x=-16+Math.sin(t*.1)*8;o.dome.rotation.y+=0;o.win.forEach(function(w,i){w.visible=!F.black&&(Math.sin(t*2+i*3)>-.95)})}
    if(o.terr&&o.terr.position)o.terr.position.y=0;
    mxp=o.lander.position;
  }
  if(snap){/* pas de lerp */}
  camT.copy(cp);lookT.copy(lk);
}
function animEnv(dt){
  var o=A,t=o.t;
  // éclairage selon night / black
  var ni=F.night?.12:1,bl=F.black?.35:1;
  sun.intensity+=((o.key==='base'?1.1:1.15)*ni-sun.intensity)*.08;
  amb.intensity+=((F.night?.16:.5)*bl-amb.intensity)*.08;
  // storm
  if(F.storm){for(var i=0;i<5;i++)streak.emit((Math.random()-.5)*26,(Math.random()-.2)*14,6+Math.random()*22,55+Math.random()*40,-14-Math.random()*10,0,.55);sun.intensity+=(Math.random()>.9?1.6:0);shake=Math.max(shake,.12)}
  streak.step(dt,1);
  if(F.alert)shake=Math.max(shake,.06);
  // poussière
  var dk=F.dust||(o.key==='base'&&o.opts&&o.opts.dust);
  if(F.dust){for(var j=0;j<4;j++)dust.emit(camT.x+(Math.random()-.5)*34,camT.y+Math.random()*7,camT.z+(Math.random()-.5)*34,-4-Math.random()*5,.3,1+Math.random()*2,3.5)}
  dust.step(dt,.99);
  // dégâts : étincelles + fumée
  var tg=o.ship&&o.ship.visible?o.ship:(o.lander||null);
  if(F.dmg&&tg){var p0=tg.position;if(Math.random()<.2*F.dmg+.05)sparks.emit(p0.x+(Math.random()-.5)*1.4,p0.y+(Math.random()-.2)*1.6,p0.z+(Math.random()-.5)*1.4,(Math.random()-.5)*4,Math.random()*3,(Math.random()-.5)*4,.55);if(Math.random()<.35)smoke.emit(p0.x+(Math.random()-.5)*.6,p0.y+.4,p0.z+(Math.random()-.5)*.6,.2+Math.random()*.4,.5+Math.random()*.8,(Math.random()-.5)*.4,2.2)}
  // météorites
  if(F.meteor&&tg){if(Math.random()<.35)smoke.emit(tg.position.x+30,tg.position.y+(Math.random()-.5)*8,tg.position.z+(Math.random()-.5)*10,-30-Math.random()*20,-4,0,1.4)}
  sparks.step(dt,.97);smoke.step(dt,.99);exh.step(dt,.985);
  // explosion
  if(F.boom&&!o.boomed){o.boomed=true;var bp=(tg?tg.position:V(0,0,0));for(var b=0;b<160;b++){var a=Math.random()*6.283,u=Math.random()*2-1,s=Math.sqrt(1-u*u),sp=3+Math.random()*10;boom.emit(bp.x,bp.y,bp.z,Math.cos(a)*s*sp,u*sp,Math.sin(a)*s*sp,1.4+Math.random())}shake=.7;if(o.ship)o.ship.visible=false}
  if(!F.boom)o.boomed=false;
  boom.step(dt,.97);
  // burst
  if(burstT>0){burstT-=dt;var bp2=(tg||o.ship)?(tg||o.ship).position:V(0,0,0);for(var q=0;q<6;q++){var aa=Math.random()*6.283,ss=2+Math.random()*4;sparks.material.color.set(burstK==='bad'?0xff6a5a:0xffd96a);sparks.emit(bp2.x,bp2.y+1,bp2.z,Math.cos(aa)*ss,Math.random()*4,Math.sin(aa)*ss,.9)}}
  if(pulseT>0){pulseT-=dt;if(pulseK==='repair'&&tg&&Math.random()<.6)sparks.emit(tg.position.x+(Math.random()-.5),tg.position.y+.5,tg.position.z+1,(Math.random()-.5)*3,Math.random()*3,(Math.random()-.5)*2,.5)}
  // fond d'étoiles
  stars.rotation.y+=dt*(.003+(warpT>0?.12:0));
  if(warpT>0){warpT-=dt;cam.fov=48+Math.sin(clamp(warpT,0,1)*3.14)*22;cam.updateProjectionMatrix()}
  else if(cam.fov!==48){cam.fov=48;cam.updateProjectionMatrix()}
}
function update(dt){
  if(!A)return;
  if(!SH.fx){dt=0}
  A.t+=dt;time+=dt;
  if(A.kind.indexOf('c:')===0)animCadet(dt);else animSpace(dt);
  animEnv(dt);
  // caméra amortie
  var k=snap||!SH.fx?1:1-Math.exp(-dt*2.2);
  camR.position.lerp(camT,k);look.lerp(lookT,k);
  var sx=0,sy=0;if(shake>0){sx=(Math.random()-.5)*shake;sy=(Math.random()-.5)*shake;shake=Math.max(0,shake-dt*.9)}
  camR.position.x+=sx;camR.position.y+=sy;
  camR.lookAt(look);camR.position.x-=sx;camR.position.y-=sy;
  snap=false;
}
function resize(){
  if(!host)return;var w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
  if(w!==W||h!==H){W=w;H=h;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();dirty=true}
}
function frame(){
  raf=requestAnimationFrame(frame);
  if(!host||!host.isConnected||!host.clientWidth||document.hidden)return;
  resize();
  var dt=Math.min(.05,clock.getDelta());
  if(!SH.fx&&!dirty)return;
  update(dt);R.render(sc,cam);dirty=false;
}
cv.addEventListener('webglcontextlost',function(e){e.preventDefault();api.ok=false;if(host)host.classList.remove('has3d')});
cv.addEventListener('webglcontextrestored',function(){api.ok=true;if(host)host.classList.add('has3d');dirty=true});
/* ---- API ---- */
api.ok=true;
api.mount=function(el){
  if(!el)return;if(host&&host!==el)host.classList.remove('has3d');
  host=el;host.classList.add('has3d');if(cv.parentNode!==host)host.insertBefore(cv,host.firstChild);
  W=H=0;dirty=true;snap=true;if(!raf){clock.getDelta();raf=requestAnimationFrame(frame)}
};
api.scene=function(kind,opts){if(host){var k=kind&&kind.indexOf('c:')===0?kind.slice(2):'';var info={lune:['ORBITER LUNAIRE','Capsule habitée · panneaux solaires · antenne longue portée'],sol:['ALUNISSEUR POLAIRE','Jambes amorties · rover · instruments de surface'],mars:['TRANSIT MARS','Habitat interplanétaire · blindage radiations · antennes'],base:['HABITAT MARTIEN','Module pressurisé · sas · panneaux solaires · rover'],ast:['SONDE DE PRÉLÈVEMENT','Bras robotisés · harpons d’ancrage · conteneur d’échantillons']}[k];var hud=host.querySelector('.mission-hud');if(info){host.setAttribute('data-vehicle',info[0]);host.setAttribute('data-equipment',info[1]);host.classList.add('mission-vehicle');if(!hud){hud=document.createElement('div');hud.className='mission-hud';host.appendChild(hud)}hud.innerHTML='<b>'+info[0]+'</b><span>'+info[1]+'</span>'}else{host.removeAttribute('data-vehicle');host.removeAttribute('data-equipment');host.classList.remove('mission-vehicle');if(hud)hud.remove()}}if(!api.ok)return;try{build(kind,opts)}catch(e){api.ok=false;if(host)host.classList.remove('has3d');if(window.console)console.warn('3D',e)}};
api.sync=function(el){
  if(!el)return;var g=function(k){return Number(el.getAttribute('data-'+k))||0};
  F.storm=g('storm');F.night=g('night');F.dust=g('dust');F.comms=g('comms');F.burn=g('burn');F.eva=g('eva');F.black=g('black');F.dmg=g('dmg');F.alert=g('alert');F.fail=g('fail');F.meteor=g('meteor');F.boom=g('boom');
  if(A&&F.boom){}
  dirty=true;
};
api.progress=function(p){prog=p;dirty=true};
api.cut=function(kind){warpT=1;dirty=true;if(A)snap=false};
api.burst=function(k){burstK=k;burstT=1.2;shake=k==='bad'?.4:.1;dirty=true};
api.pulse=function(k){pulseK=k;pulseT=1.4;if(A&&A.kind.indexOf('i:')===0)A.inter=A.inter;dirty=true};
api.phase=function(i,o){
  if(!A||A.kind.indexOf('a:')!==0)return;
  o=o||{};
  if(i===0&&A.ph===-1){A.ph=0;A.pad=true;A.ascT=0;dirty=true;return}   // sur la rampe
  if(A.ph===-1&&i>=1){A.ph=i;A.pad=false;A.rocket.visible=false;A.t1=9;A.t6=i>6?9:0;A.fail=!!o.fail;snap=true;dirty=true;return}
  if(i===0&&A.pad){A.pad=false}
  if(A.ph!==i){A.ph=i;if(i===1)A.t1=0;if(i===6)A.t6=0;dirty=true}
  A.fail=!!o.fail;
};
api.refresh=function(){dirty=true};
api.kind=function(){return A?A.kind:''};
api._dbg=function(){return {kids:G.children.map(function(c){var b=c.userData&&c.userData.body;return (c.type)+':'+c.position.toArray().map(function(v){return Math.round(v)}).join(',')+(b&&b.material&&b.material.map?'|tex'+b.material.map.id:'')}),cam:camR.position.toArray(),look:look.toArray(),camT:camT.toArray(),lookT:lookT.toArray(),n:G.children.length,kind:A&&A.kind,ph:A&&A.ph,pad:A&&A.pad,w:W,h:H,fov:cam.fov,aspect:cam.aspect,r:A&&A.rocket&&A.rocket.position.toArray(),t:A&&A.t}};
return api;
})();

SH.S3=S3;
var AO=(function(){var G0=9.80665;
function fmt(n,d){d=d||0;return Number(n).toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d})}

function dur(d){return d<45?Math.round(d)+' jours':d<700?Math.round(d/30.4)+' mois':fmt(d/365,1)+' ans'}
var ORDER=['leo','moon','venus','mars','ast','jup'];
var DEST={
 leo:{key:'leo',name:'Orbite terrestre',sub:'Satellite d\'observation de la Terre',level:'Initiation',dv:.9,days:1,maxDays:10,opsDays:365,budget:320,baseMass:600,baseCost:70,flux:1,sci:45,highThrust:false,arrP:.97,commF:1,thermal:'temp',radF:.3,type:'orbit',dist:'orbite à 700 km',lt:'0,02 s',
  cruiseName:'Montée en orbite',arrive:'Mise à poste',ops:'Observation de la Terre',arriveOk:'Le satellite est sur son orbite de travail.',ops1Ok:'Les premières images de la Terre arrivent.',opsOk:'Une année d\'observation est livrée aux chercheurs.',
  story:'Votre première mission : un satellite qui observe la Terre pendant un an. Peu de Δv, mais déjà de la thermique, de l\'énergie et des liaisons radio à tenir.'},
 moon:{key:'moon',name:'Lune',sub:'Atterrissage près du pôle Sud',level:'Débutant',dv:6.0,days:5,maxDays:12,opsDays:30,budget:650,baseMass:1100,baseCost:120,flux:1,sci:55,highThrust:true,arrP:.94,commF:1.3,thermal:'cold',radF:.5,type:'landing',dist:'384 400 km',lt:'1,3 s',
  cruiseName:'Croisière',arrive:'Atterrissage',ops:'Opérations de surface',arriveOk:'Atterrissage en douceur près du pôle Sud.',ops1Ok:'Les premières mesures de surface sont transmises.',opsOk:'Une lunaison de mesures est livrée.',
  story:'Atterrir au pôle Sud lunaire : un moteur puissant, du froid extrême et trois jours de voyage seulement. Rien ne pardonne dans la descente.'},
 venus:{key:'venus',name:'Vénus',sub:'Sonde atmosphérique et descente',level:'Intermédiaire',dv:4.3,days:150,maxDays:400,opsDays:60,budget:800,baseMass:1150,baseCost:220,flux:1.9,sci:60,highThrust:false,arrP:.93,commF:2,thermal:'xhot',radF:.8,type:'landing',dist:'41 millions de km',lt:'2 min',
  cruiseName:'Croisière',arrive:'Entrée atmosphérique',ops:'Descente et mesures',arriveOk:'La sonde survit à l\'entrée et ouvre ses parachutes.',ops1Ok:'La sonde descend en transmettant des mesures.',opsOk:'Les données de l\'atmosphère sont livrées avant la perte du signal.',
  story:'Une planète où il fait 460 °C et où la pression écrase tout. Le défi : la thermique, une énergie abondante, et une entrée atmosphérique sans droit à l\'erreur.'},
 mars:{key:'mars',name:'Mars',sub:'Mise en orbite et cartographie',level:'Intermédiaire',dv:5.0,days:250,maxDays:800,opsDays:686,budget:750,baseMass:1000,baseCost:200,flux:.43,sci:50,highThrust:false,arrP:.95,commF:6,thermal:'cold',radF:1,type:'orbit',dist:'55 à 400 millions de km',lt:'3 à 22 min',
  cruiseName:'Croisière',arrive:'Insertion en orbite',ops:'Cartographie',arriveOk:'Insertion en orbite martienne réussie.',ops1Ok:'Les premières cartes de la surface arrivent.',opsOk:'Une année martienne de cartographie est livrée.',
  story:'Huit mois de voyage, un soleil deux fois plus faible et une liaison radio lente. L\'antenne et l\'énergie décident de tout.'},
 ast:{key:'ast',name:'Astéroïde',sub:'Prélèvement et retour d\'échantillon',level:'Avancé',dv:5.8,days:500,maxDays:1500,opsDays:90,budget:700,baseMass:800,baseCost:170,flux:.7,sci:55,highThrust:false,arrP:.92,commF:5,thermal:'temp',radF:1,type:'landing',dist:'type Bennu, proche de la Terre',lt:'8 min',
  cruiseName:'Croisière',arrive:'Prélèvement',ops:'Retour d\'échantillons',arriveOk:'Prélèvement réussi, l\'échantillon est stocké.',ops1Ok:'Le vaisseau se détache et lance le retour.',opsOk:'La capsule d\'échantillons est renvoyée vers la Terre.',
  story:'Toucher un astéroïde presque sans gravité, prélever, repartir. Peu de poussée mais beaucoup de précision : le moteur ionique est tentant.'},
 jup:{key:'jup',name:'Lunes de Jupiter',sub:'Orbiteur autour d\'une lune glacée',level:'Expert',dv:5.8,days:2000,maxDays:3200,opsDays:700,budget:1250,baseMass:1500,baseCost:340,flux:.037,sci:75,highThrust:false,arrP:.9,commF:20,thermal:'xcold',radF:2.5,type:'orbit',dist:'630 à 930 millions de km',lt:'35 à 52 min',
  cruiseName:'Croisière',arrive:'Insertion en orbite',ops:'Survol des lunes glacées',arriveOk:'Insertion réussie dans le système de Jupiter.',ops1Ok:'Les premiers survols de la lune glacée sont réalisés.',opsOk:'La cartographie de la croûte de glace est livrée.',
  story:'Cinq ans et demi de voyage, un Soleil 25 fois plus faible, des radiations mortelles et une antenne qui doit se faire entendre à 700 millions de km.'}
};
var LAUN={
 light:{id:'light',name:'Lanceur léger',cap:2000,cost:60,rel:.93,desc:'Peu cher, très limité en masse.'},
 med:{id:'med',name:'Lanceur moyen',cap:8000,cost:120,rel:.96,desc:'Le compromis habituel.'},
 heavy:{id:'heavy',name:'Lanceur lourd',cap:22000,cost:250,rel:.97,desc:'Beaucoup de marge, budget serré.'},
 super:{id:'super',name:'Lanceur super-lourd',cap:60000,cost:600,rel:.94,desc:'Capacité énorme, peu de vols à son actif.'}
};
var PROP={
 chem:{id:'chem',name:'Chimique stockable',isp:320,mass:400,cost:40,time:1,fuel:.004,cryo:false,ion:false,thrust:'forte',desc:'Fiable et puissant, mais gourmand en ergols.'},
 cryo:{id:'cryo',name:'Chimique cryogénique',isp:450,mass:500,cost:70,time:1,fuel:.005,cryo:true,ion:false,thrust:'forte',desc:'Meilleur rendement. L\'hydrogène s\'évapore en voyage.'},
 ion:{id:'ion',name:'Ionique (xénon)',isp:3000,mass:250,cost:150,time:3,fuel:.04,cryo:false,ion:true,thrust:'très faible',desc:'Très économe, très lent. Demande 3 000 W.'}
};
var POWER={
 solar:{id:'solar',name:'Panneaux solaires',watts:2000,mass:180,cost:20,rtg:false,desc:'2 000 W à la distance de la Terre.'},
 solarXL:{id:'solarXL',name:'Grands panneaux solaires',watts:4000,mass:360,cost:60,rtg:false,desc:'4 000 W à la distance de la Terre.'},
 rtg:{id:'rtg',name:'Générateur nucléaire',watts:400,mass:110,cost:90,rtg:true,desc:'400 W partout, même loin du Soleil.'},
 rtg2:{id:'rtg2',name:'Générateurs nucléaires doubles',watts:1000,mass:260,cost:190,rtg:true,desc:'1 000 W partout. Pour les missions très lointaines.'}
};
var THERM={
 mli:{id:'mli',name:'Isolation multicouche',mass:40,cost:8,power:0,cover:['temp'],part:['cold','hot'],desc:'Léger et simple. Pour les environnements tempérés.'},
 rad:{id:'rad',name:'Radiateurs et volets',mass:90,cost:25,power:40,cover:['hot','temp'],part:['xhot'],desc:'Évacue la chaleur. Pour les zones chaudes.'},
 heat:{id:'heat',name:'Chauffage et RHU',mass:70,cost:35,power:120,cover:['cold','temp'],part:['xcold'],desc:'Garde l\'électronique au chaud. Pour le froid.'},
 heatXL:{id:'heatXL',name:'Chauffage renforcé',mass:130,cost:60,power:160,cover:['xcold','cold'],part:['temp'],desc:'Pour le froid extrême du système solaire externe.'},
 tshield:{id:'tshield',name:'Bouclier thermique',mass:260,cost:90,power:60,cover:['xhot','hot'],part:[],desc:'Survit à la fournaise. Lourd et cher.'}
};
var ENVN={temp:'tempéré',cold:'froid',xcold:'glacial',hot:'chaud',xhot:'brûlant'};
var ANT={
 lga:{id:'lga',name:'Antenne faible gain',gain:1,mass:8,cost:4,power:30,desc:'Légère et simple, débit minime.'},
 mga:{id:'mga',name:'Antenne moyen gain',gain:5,mass:35,cost:15,power:60,desc:'Un bon compromis proche de la Terre.'},
 hga:{id:'hga',name:'Grande antenne parabolique',gain:20,mass:95,cost:42,power:120,desc:'Pour les missions lointaines.'},
 opt:{id:'opt',name:'Parabole et liaison optique',gain:60,mass:170,cost:90,power:220,desc:'Débit maximal, lourd et gourmand.'}
};
var PROT={
 shield:{n:'Blindage anti-radiations',mass:80,cost:15,desc:'Réduit les radiations de plus de moitié.'},
 hard:{n:'Électronique durcie',mass:20,cost:40,desc:'Composants résistants : radiations divisées par deux.'},
 red:{n:'Redondance des systèmes critiques',mass:120,cost:60,desc:'Doublez les pièces clés : les pannes sont moins graves.'}
};
var INST={
 cam:{id:'cam',name:'Caméra haute résolution',mass:40,cost:25,power:80,sci:15,data:40,rel:{leo:1,moon:1,venus:.6,mars:1,ast:1,jup:1},desc:'Images de la surface.'},
 spec:{id:'spec',name:'Spectromètre infrarouge',mass:30,cost:30,power:60,sci:20,data:12,rel:{leo:.8,moon:1,venus:1,mars:1,ast:1,jup:1},desc:'Composition des roches, de la glace et des gaz.'},
 radar:{id:'radar',name:'Radar sondeur',mass:80,cost:55,power:400,sci:25,data:60,rel:{leo:1,moon:.8,venus:1,mars:1,ast:.6,jup:.9},desc:'Sonde le sous-sol ou la glace.'},
 drill:{id:'drill',name:'Foreuse et échantillons',mass:120,cost:70,power:300,sci:35,data:6,rel:{leo:0,moon:1,venus:0,mars:0,ast:1,jup:0},desc:'Exige un contact avec la surface.'},
 seis:{id:'seis',name:'Sismomètre',mass:50,cost:35,power:40,sci:15,data:8,rel:{leo:0,moon:1,venus:.3,mars:0,ast:.2,jup:0},desc:'Mesure les secousses, depuis le sol.'},
 rad:{id:'rad',name:'Détecteur de radiations',mass:15,cost:12,power:20,sci:10,data:2,rel:{leo:1,moon:1,venus:1,mars:1,ast:1,jup:1},desc:'Utile partout, très léger.'},
 mag:{id:'mag',name:'Magnétomètre',mass:12,cost:15,power:15,sci:12,data:5,rel:{leo:.8,moon:.4,venus:.7,mars:.8,ast:.5,jup:1},desc:'Mesure les champs magnétiques.'},
 laser:{id:'laser',name:'Altimètre laser',mass:35,cost:40,power:70,sci:18,data:25,rel:{leo:.6,moon:1,venus:.2,mars:1,ast:1,jup:.8},desc:'Relief précis de la surface.'},
 atmo:{id:'atmo',name:'Analyseur de gaz',mass:45,cost:45,power:90,sci:22,data:15,rel:{leo:.8,moon:.1,venus:1,mars:1,ast:0,jup:.5},desc:'Compose l\'atmosphère.'},
 therm:{id:'therm',name:'Imageur thermique',mass:28,cost:28,power:50,sci:14,data:30,rel:{leo:1,moon:1,venus:.9,mars:1,ast:.8,jup:.7},desc:'Cartes de température.'}
};
var WIN={
 prime:{id:'prime',name:'Fenêtre optimale',dv:1,time:1,cost:8,pl:0,desc:'Alignement idéal des planètes. Réservation de la rampe : +8 M$.'},
 early:{id:'early',name:'Fenêtre précoce',dv:1.05,time:1,cost:0,pl:0,desc:'Départ plus tôt : +5 % de Δv requis, aucun surcoût.'},
 late:{id:'late',name:'Fenêtre tardive',dv:1.03,time:1.1,cost:-5,pl:-.01,desc:'Rampe bradée (−5 M$), trajet 10 % plus long, un peu plus de risque au décollage.'}
};
var TRAJ={
 fast:{id:'fast',name:'Directe rapide',dv:1.15,time:.7,h:34,desc:'15 % de Δv en plus, voyage 30 % plus court.'},
 std:{id:'std',name:'Transfert standard',dv:1,time:1,h:62,desc:'Le compromis classique.'},
 eco:{id:'eco',name:'Trajectoire économe',dv:.92,time:1.6,h:96,desc:'8 % de Δv en moins, voyage 60 % plus long.'},
 grav:{id:'grav',name:'Assistance gravitationnelle',dv:.82,time:1.9,h:120,desc:'18 % de Δv en moins, voyage presque deux fois plus long.',min:100}
};
var SIDE={
 cubesat:{id:'cubesat',name:'CubeSats d\'étudiants',mass:30,cost:10,power:20,data:6,pts:6,phase:6,desc:'Largués à l\'arrivée par des équipes d\'étudiants.',r:'Étudiants ravis'},
 edu:{id:'edu',name:'Caméra des écoles',mass:6,cost:4,power:8,data:12,pts:4,phase:7,desc:'Des images diffusées dans les écoles.',r:'Écoles connectées'},
 relay:{id:'relay',name:'Relais de communication',mass:70,cost:32,power:60,data:0,pts:8,phase:8,desc:'Améliore la liaison radio (+25 %).',r:'Liaison renforcée',comm:1.25},
 tech:{id:'tech',name:'Démonstrateur technologique',mass:45,cost:28,power:50,data:5,pts:9,phase:3,desc:'Une technologie testée en vol.',r:'Technologie validée'},
 cap:{id:'cap',name:'Capsule d\'échantillon partenaire',mass:60,cost:30,power:15,data:3,pts:8,phase:8,desc:'Rapporte un échantillon pour un laboratoire partenaire.',r:'Échantillon livré',dests:['moon','mars','ast']}
};
var UPG=[
 {id:'lab',n:'Laboratoire d\'essais',d:'+1 % de fiabilité du lanceur par niveau.',cost:[6,8,10]},
 {id:'budget',n:'Dotation du programme',d:'+5 % de budget par niveau.',cost:[6,8,10]},
 {id:'ground',n:'Stations au sol',d:'+15 % de débit de liaison par niveau.',cost:[5,7,9]},
 {id:'reuse',n:'Lanceurs réutilisables',d:'−8 % sur le coût des lanceurs par niveau.',cost:[6,8,10]},
 {id:'mat',n:'Matériaux avancés',d:'−3 % de masse structurale par niveau.',cost:[6,8,10]},
 {id:'bay',n:'Baie de charges utiles',d:'Une charge annexe en plus.',cost:[8]},
 {id:'sim',n:'Simulations numériques',d:'Affiche le détail des risques de chaque phase.',cost:[7]}
];
var DIFF={
 easy:{id:'easy',name:'Découverte',desc:'Budget et lanceurs généreux, peu d\'incidents en vol, aucune contrainte surprise.',budget:1.2,cap:1.1,p:.03,events:1,sev:.7,credit:.8,cons:0,hints:true},
 normal:{id:'normal',name:'Normal',desc:'Les règles du jeu : deux incidents en vol et une contrainte surprise.',budget:1,cap:1,p:0,events:2,sev:1,credit:1,cons:1,hints:true},
 hard:{id:'hard',name:'Expert',desc:'Budget serré, trois incidents plus graves et deux contraintes surprises.',budget:.93,cap:.95,p:-.02,events:3,sev:1.3,credit:1.4,cons:2,hints:false}
};
var CONS={
 cut:{id:'cut',n:'Coupe budgétaire',d:'Le budget maximum baisse de 8 %.'},
 sun:{id:'sun',n:'Activité solaire intense',d:'Les radiations augmentent de 50 %.'},
 mass:{id:'mass',n:'Structure plus lourde',d:'La masse de base du vaisseau augmente de 6 %.'},
 delay:{id:'delay',n:'Fenêtre de lancement tardive',d:'Le Δv requis augmente de 5 %.'},
 sci:{id:'sci',n:'Objectif scientifique relevé',d:'La cible de science augmente de 12 %.'},
 noheavy:{id:'noheavy',n:'Lanceur super-lourd indisponible',d:'Le lanceur super-lourd n\'est plus disponible.'},
 cheap:{id:'cheap',n:'Hausse du prix des lancements',d:'Tous les lanceurs coûtent 15 % de plus.'}
};
function sum(a,f){return a.reduce(function(s,x){return s+f(x)},0)}
function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
function pickCons(df){var k=Object.keys(CONS),out=[];for(var i=0;i<df.cons;i++){var j=Math.floor(Math.random()*k.length);out.push(k.splice(j,1)[0])}return out}
function trajOk(d,k){var T=TRAJ[k];return !T.min||d.days>=T.min}

function calc(c,ctx){
  var d0=DEST[c.dest],df=ctx.df,up=ctx.up,cons=ctx.cons;
  var has=function(k){return cons.indexOf(k)>=0};
  var d=Object.assign({},d0);
  d.budget=Math.round(d0.budget*df.budget*(1+.05*up.budget)*(has('cut')?.92:1));
  d.sci=Math.round(d0.sci*(has('sci')?1.12:1));
  d.baseMass=Math.round(d0.baseMass*(has('mass')?1.06:1)*(1-.03*up.mat));
  d.dv=d0.dv*(has('delay')?1.05:1);
  var L=Object.assign({},LAUN[c.launcher]);
  L.cap=Math.round(L.cap*df.cap);L.cost=Math.round(L.cost*(has('cheap')?1.15:1)*(1-.08*up.reuse));L.rel=Math.min(.995,L.rel+.01*up.lab);
  var WN=WIN[c.win||'prime'];var P=PROP[c.prop],W=POWER[c.power],TH=THERM[c.therm],AN=ANT[c.ant],T=TRAJ[c.traj];
  var ins=Array.from(c.inst).map(function(k){return INST[k]});
  var sds=c.sides.map(function(k){return SIDE[k]});
  var dry=d.baseMass+P.mass+W.mass+TH.mass+AN.mass+(c.shield?PROT.shield.mass:0)+(c.hard?PROT.hard.mass:0)+(c.red?PROT.red.mass:0)+sum(ins,function(i){return i.mass})+sum(sds,function(s){return s.mass});
  var ve=P.isp*G0/1000,cap=L.cap,room=Math.max(0,cap-dry),req=d.dv*T.dv*WN.dv;
  var need=Math.ceil(dry*(Math.exp(req*1.05/ve)-1)/10)*10;
  var fuel=c.fuelAuto?Math.min(need,Math.floor(room/10)*10):Math.min(c.fuel,Math.floor(room/10)*10);
  var m0=dry+fuel,dv=fuel>0?ve*Math.log(m0/dry):0;
  var days=d.days*P.time*T.time*WN.time;
  var cost=d.baseCost+P.cost+W.cost+TH.cost+AN.cost+(c.shield?PROT.shield.cost:0)+(c.hard?PROT.hard.cost:0)+(c.red?PROT.red.cost:0)+sum(ins,function(i){return i.cost})+sum(sds,function(s){return s.cost})+L.cost+WN.cost+fuel*P.fuel;
  var supply=W.rtg?W.watts:W.watts*d.flux;
  var pneed=250+TH.power+AN.power+sum(ins,function(i){return i.power})+sum(sds,function(s){return s.power});
  var ionOk=P.ion?W.watts>=3000:true,thrustOk=!(d.highThrust&&P.ion);
  var sci=sum(ins,function(i){return i.sci*i.rel[d.key]}),minSci=Math.ceil(d.sci/2);
  var tstate=TH.cover.indexOf(d.thermal)>=0?'full':TH.part.indexOf(d.thermal)>=0?'partial':'none';
  var relay=sds.some(function(s){return s.comm});
  var gs=(1+.15*up.ground)*(relay?1.25:1);
  var rate=AN.gain*60*gs/d.commF,dneed=sum(ins,function(i){return i.data})+sum(sds,function(s){return s.data});
  var lm=dneed>0?rate/dneed-1:1;
  var fullCap=Math.floor(room/10)*10;
  var checks=[
   {id:'mass',name:'Masse au lancement',go:m0<=cap,det:fmt(m0)+' / '+fmt(cap)+' kg',fix:'Choisissez un lanceur plus puissant, un moteur plus efficace, ou retirez un équipement lourd.'},
   {id:'budget',name:'Budget',go:cost<=d.budget,det:fmt(cost)+' / '+fmt(d.budget)+' M$',fix:'Retirez un instrument ou une charge annexe, ou choisissez un lanceur moins cher.'},
   {id:'power',name:'Énergie',go:supply>=pneed&&ionOk,det:ionOk?fmt(pneed)+' W requis, '+fmt(supply)+' W produits':'Moteur ionique sous-alimenté (3 000 W minimum)',fix:ionOk?(W.rtg?'Prenez des générateurs plus puissants, ou retirez un équipement gourmand en énergie.':'Prenez de plus grands panneaux, ou retirez un équipement gourmand en énergie. Loin du Soleil, le nucléaire est plus sûr.'):'Le moteur ionique demande les grands panneaux solaires.'},
   {id:'dv',name:'Variation de vitesse (Δv)',go:dv>=req,det:fmt(dv,2)+' / '+fmt(req,2)+' km/s',fix:fuel>=fullCap?'Le lanceur est plein et le Δv reste trop faible. Prenez un lanceur plus puissant, un moteur plus efficace, une trajectoire économe, ou allégez le vaisseau.':'Ajoutez des ergols (Calcul auto), ou choisissez une trajectoire économe ou un moteur plus efficace.'},
   {id:'thrust',name:'Poussée du moteur',go:thrustOk,det:thrustOk?'Adaptée à la mission':'Atterrissage impossible avec un moteur ionique',fix:'Pour atterrir sur la Lune, choisissez un moteur chimique.'},
   {id:'time',name:'Durée du voyage',go:days<=d.maxDays,det:dur(days)+' (maximum '+dur(d.maxDays)+')',fix:'Choisissez un profil plus rapide, ou un moteur à poussée plus forte.'},
   {id:'sci',name:'Science minimale',go:sci>=minSci,det:fmt(sci)+' pts (minimum '+fmt(minSci)+')',fix:'Ajoutez un instrument utile à cette destination.'},
   {id:'therm',name:'Contrôle thermique',go:tstate!=='none',det:'Environnement '+ENVN[d.thermal]+' : '+(tstate==='full'?'système adapté':tstate==='partial'?'système limite (fiabilité réduite)':'système inadapté'),fix:'L\'environnement est '+ENVN[d.thermal]+'. '+(d.thermal==='temp'?'Une isolation multicouche suffit.':d.thermal==='cold'?'Il faut un chauffage.':d.thermal==='xcold'?'Il faut le chauffage renforcé.':d.thermal==='hot'?'Il faut des radiateurs.':'Il faut un bouclier thermique.')},
   {id:'comm',name:'Liaison radio',go:rate>=dneed,det:fmt(rate)+' / '+fmt(dneed)+' unités de débit',fix:'Le débit est trop faible pour la distance. Prenez une antenne plus grande, ou retirez un instrument qui produit beaucoup de données.'}
  ];
  var margin=req>0?dv/req-1:0,mg=Math.max(0,margin);
  var rawR=(days+d.opsDays*.5)*d.radF*(has('sun')?1.5:1)*.00008;
  var prot=(c.shield?.4:1)*(c.hard?.5:1);
  var rad=Math.min(.4,rawR*prot);
  var boil=P.cryo?Math.min(.5,Math.max(0,days-15)*.0015):0;
  var pT=tstate==='full'?1:.94,red=!!c.red;
  var rd=function(p){return red?1-(1-p)*.6:p};
  var pm=pneed>0?supply/pneed-1:1;
  var pL=L.rel+WN.pl;
  var pD=rd(.985*(tstate==='full'?1:.98));
  var pC=rd((1-rad)*(1-boil)*.99*pT);
  var pO=rd(clamp(.97-(pm<.1?(.1-Math.max(pm,0))*.8:0)-(lm<.15?(.15-Math.max(lm,0))*.5:0),.5,.99)*pT);
  var r={d:d,L:L,P:P,W:W,TH:TH,AN:AN,T:T,dry:dry,cap:cap,room:room,req:req,need:need,fuel:fuel,m0:m0,dv:dv,days:days,cost:cost,supply:supply,pneed:pneed,sci:sci,rate:rate,dneed:dneed,lm:lm,tstate:tstate,
   cfg:c,checks:checks,nogo:checks.filter(function(k){return !k.go}),margin:margin,rad:rad,boil:boil,pL:pL,pD:pD,pC:pC,pO:pO,pm:pm,red:red,sides:sds};
  var F0={mar:margin};
  r.pSteps=[];for(var i=0;i<9;i++)r.pSteps.push(baseP(i,r,F0));
  r.pTotal=r.pSteps.reduce(function(a,b){return a*b},1);
  return r;
}
var STEPK=['launch','deploy','cruise','cruise','corr','appr','arrive','ops','ops'];
function baseP(i,r,F){
  var k=STEPK[i],mg=F?F.mar:r.margin,p;
  if(k==='launch')p=r.pL;
  else if(k==='deploy')p=r.pD;
  else if(k==='cruise')p=Math.sqrt(r.pC);
  else if(k==='corr')p=clamp(.97+Math.min(.025,Math.max(0,mg)*.3)-(mg<.03?(.03-mg)*2:0),.5,.995);
  else if(k==='appr'||k==='arrive'){var pa=clamp(r.d.arrP+Math.min(.04,Math.max(0,mg)*.4)-(mg<.05?(.05-mg)*2:0),.5,.995);p=k==='appr'?Math.pow(pa,.35):Math.pow(pa,.65)}
  else p=Math.sqrt(r.pO);
  return p;
}
function starter(dest){
  var d=DEST[dest];
  return {dest:dest,launcher:dest==='leo'?'light':'med',prop:'chem',power:d.flux<.2?'rtg2':d.flux<.6?'solarXL':'solar',therm:d.thermal==='temp'?'mli':d.thermal==='cold'?'heat':d.thermal==='xcold'?'heatXL':d.thermal==='hot'?'rad':'tshield',ant:d.commF>15?'hga':d.commF>3?'hga':d.commF>1.1?'mga':'lga',shield:false,hard:false,red:false,inst:new Set(['cam','spec']),traj:'std',win:'prime',fuel:0,fuelAuto:true,sides:[]};
}

/* ===== VOL : phases, décisions, effets ===== */
var PH=['Lancement','Déploiement','Croisière (1)','Croisière (2)','Correction de trajectoire','Approche','Arrivée','Opérations (1)','Opérations (2)'];
var BEATSLOT=[2,4,6,8];
function phName(d,i){return i===6?d.arrive:i===7?d.ops+' (1)':i===8?d.ops+' (2)':PH[i]}
function phDay(r,i){var D=r.days,o=r.d.opsDays;return [0,.3,.25*D,.55*D,.7*D,.92*D,D,D+o*.5,D+o][i]}
function effTxt(e){
  var s;
  if(e.k==='mar')s='Marge de Δv '+(e.v>0?'+':'−')+fmt(Math.abs(e.v)*100,1)+' %';
  else if(e.k==='pm')s='Fiabilité '+(e.v>0?'+':'−')+fmt(Math.abs(e.v)*100,0)+' %'+(e.t?' ('+e.t+' phase'+(e.t>1?'s':'')+')':'');
  else if(e.k==='sci')s='Science ×'+fmt(e.v,2)+(e.t?' ('+e.t+' phases)':'');
  else if(e.k==='res')s='Réserve '+(e.v>0?'+':'−')+fmt(Math.abs(e.v),0)+' M$';
  else if(e.k==='lose')s='Mission perdue';
  else s=e.n||'';
  return {t:s,g:e.k==='lose'?-1:e.k==='sci'?(e.v>=1?1:-1):e.k==='flag'?1:(e.v>0?1:-1),n:e.n||''};
}
function sevScale(e,sev){
  var o=Object.assign({},e);
  if(e.k==='pm'&&e.v<0)o.v=e.v*sev;
  else if(e.k==='mar'&&e.v<0)o.v=e.v*sev;
  else if(e.k==='res'&&e.v<0)o.v=Math.round(e.v*sev);
  else if(e.k==='sci'&&e.v<1)o.v=1-(1-e.v)*sev;
  return o;
}
function modsum(F,k){return F.mods.filter(function(m){return m.k===k}).reduce(function(s,m){return s+m.v},0)}
function sciMul(F){return F.mods.filter(function(m){return m.k==='sci'}).reduce(function(s,m){return s*m.v},1)}
function applyEff(F,e){
  e=sevScale(e,F.df.sev);
  if(e.k==='mar')F.mar+=e.v;
  else if(e.k==='res')F.res=Math.max(0,F.res+e.v);
  else if(e.k==='lose'){F.lostBy=e.v}
  else if(e.k==='flag')F.flags[e.n]=1;
  else if(e.k==='pm'||e.k==='sci')F.mods.push({k:e.k,v:e.v,t:e.t||2,n:e.n||''});
  return effTxt(e);
}
function phaseP(F,i){
  var p=baseP(i,F.r,{mar:F.mar})+F.df.p*.3+modsum(F,'pm');
  if(F.flags.techok&&i===2)p+=.01;
  return clamp(p,.2,.995);
}
function newFlight(r,df,cons){
  var F={cfgShield:!!r.cfg.shield,cfgHard:!!r.cfg.hard,cfgRed:!!r.cfg.red,r:r,df:df,cons:cons,i:0,mar:r.margin,mods:[],flags:{},res:Math.max(0,Math.floor(r.d.budget-r.cost)),res0:Math.max(0,Math.floor(r.d.budget-r.cost)),spent:0,alive:true,lostBy:null,okp:[],sciAcc:0,delivered:[],good:0,bad:0,nb:0,beats:[]};
  var slots=BEATSLOT.slice(),inc={};
  for(var n=0;n<df.events;n++){inc[slots.splice(Math.floor(Math.random()*slots.length),1)[0]]=1}
  BEATSLOT.forEach(function(s){F.beats.push(pickEvent(F,s,!!inc[s]))});
  return F;
}
function pickEvent(F,slot,isInc){
  var r=F.r,list=EVENTS.filter(function(e){return e.slot===slot&&(isInc?e.kind==='inc':e.kind==='opp')&&(!e.when||e.when(r,F))});
  if(!list.length)list=EVENTS.filter(function(e){return e.slot===slot&&e.kind==='opp'&&(!e.when||e.when(r,F))});
  var tot=sum(list,function(e){return e.w||1}),x=Math.random()*tot,ev=list[0];
  for(var i=0;i<list.length;i++){x-=list[i].w||1;if(x<=0){ev=list[i];break}}
  return ev.build(F);
}
function rp(F,p){return clamp(p-(F.df.sev-1)*.2+F.df.p,.15,.97)}
/* choisit une option : renvoie {txt, effs, roll:{ok,p}} */
function chooseOpt(F,beat,k){
  var o=beat.opts[k],out={effs:[],roll:null,txt:''};
  if(o.cost){if(F.res<o.cost)return null;F.res-=o.cost;F.spent+=o.cost;out.effs.push({t:'Réserve −'+o.cost+' M$',g:-1})}
  (o.fx||[]).forEach(function(e){out.effs.push(applyEff(F,e))});
  var q=0;
  if(o.roll){
    var p=rp(F,o.roll.p),ok=Math.random()<p;out.roll={ok:ok,p:p};
    (ok?o.roll.ok:o.roll.ko||[]).forEach(function(e){out.effs.push(applyEff(F,e))});
    out.txt=ok?o.roll.okT:o.roll.koT;q=ok?1:-1;
  }else{out.txt=o.res||'';q=o.q||0}
  if(q>0)F.good++;else if(q<0)F.bad++;
  F.nb++;
  return out;
}
function runPhase(F,i){
  var p=phaseP(F,i),ok=Math.random()<p;
  F.okp[i]=ok;
  if(F.lostBy){ok=false;F.okp[i]=false}
  if(ok){
    if(i===7)F.sciAcc+=.5*sciMul(F);
    if(i===8)F.sciAcc+=.5*sciMul(F);
    F.r.sides.forEach(function(s){if(s.phase===i&&F.delivered.indexOf(s.id)<0)F.delivered.push(s.id)});
  }else F.alive=false;
  F.mods.forEach(function(m){m.t--});F.mods=F.mods.filter(function(m){return m.t>0});
  return {ok:ok,p:p};
}
function score(F){
  var r=F.r,d=r.d,okc=F.okp.filter(Boolean).length,full=okc===9;
  var mission=full?30:Math.round(30*okc/9*.8);
  var sciDel=r.sci*F.sciAcc,sc=Math.round(30*clamp(sciDel/d.sci,0,1));
  var spent=r.cost+F.spent,slack=(d.budget-spent)/d.budget,bud=Math.round(15*clamp(slack/.12,0,1));
  var dec=F.nb?Math.round(15*clamp(.7+.12*(F.good-F.bad),0,1)):10;
  var side=Math.min(10,sum(F.delivered,function(id){return SIDE[id].pts}));
  var tot=mission+sc+bud+dec+side;if(!full)tot=Math.min(tot,60);
  return {mission:mission,sci:sc,bud:bud,dec:dec,side:side,total:tot,full:full,sciDel:sciDel,spent:spent};
}
function bonuses(F,S){
  var r=F.r,b=[];
  b.push({n:'Réserve de budget conservée (≥ 10 %)',ok:S.full&&(F.d0budget||r.d.budget)-S.spent>=.1*r.d.budget});
  b.push({n:'Science à 130 % de la cible',ok:S.full&&S.sciDel>=1.3*r.d.sci});
  b.push({n:'Marge de Δv finale ≥ 8 %',ok:S.full&&F.mar>=.08});
  b.push({n:'Aucune décision mal tournée',ok:S.full&&F.bad===0});
  return b;
}
var EVENTS=[];
function E(o){EVENTS.push(o)}
function fx(k,v,t,n){return {k:k,v:v,t:t,n:n}}
/* --- Créneau 2 : début de croisière --- */
E({slot:2,kind:'inc',w:3,build:function(F){var r=F.r,pr=.62+(r.d.key&&F.cfgShield?.12:0)+(F.cfgHard?.12:0);return {id:'storm',scene:'storm',title:'Tempête solaire',text:'Une éruption solaire envoie des particules vers le vaisseau. Les instruments sont exposés.',opts:[
 {t:'Mise en veille sécurisée',d:'Moins de données, électronique protégée.',fx:[fx('sci',.85,2,'Instruments en veille'),fx('pm',.01,2,'Protégé')],res:'Les instruments dorment pendant le passage de la tempête.',q:0},
 {t:'Maintenir les mesures',d:'Des données rares, mais un vrai risque.',roll:{p:pr,ok:[fx('sci',1.15,2,'Données de tempête')],ko:[fx('pm',-.07,2,'Électronique dégradée'),fx('res',-4)],okT:'Les mesures tiennent et la tempête est enregistrée.',koT:'Des composants sont touchés par les particules.'}},
 {t:'Cap protégé vers le Soleil',d:'Consomme un peu de Δv.',fx:[fx('mar',-.012),fx('pm',.02,2,'Cap protégé')],res:'Le corps du vaisseau sert de bouclier.',q:0}]}}});
E({slot:2,kind:'inc',w:4,when:function(r){return r.P.cryo&&r.days>20},build:function(F){return {id:'cryo',scene:'alert',title:'Hydrogène qui s\'évapore',text:'Le réservoir cryogénique chauffe. Une partie de l\'hydrogène s\'échappe.',opts:[
 {t:'Réduire les poussées',d:'Moins de pertes, trajectoire plus prudente.',fx:[fx('pm',.02,2,'Réservoir ménagé')],res:'Le réservoir refroidit.',q:0},
 {t:'Refroidissement actif',d:'Coûte 6 M$ et de l\'énergie.',cost:6,fx:[fx('pm',.03,3,'Réservoir refroidi')],res:'Le refroidisseur reprend la main.',q:1},
 {t:'Accepter les pertes',d:'On perd du Δv.',fx:[fx('mar',-.03)],res:'Une partie des ergols est perdue.',q:-1}]}}});
E({slot:2,kind:'inc',w:4,when:function(r){return r.P.ion},build:function(F){return {id:'ion',scene:'cruise',title:'Poussée ionique',text:'Le moteur ionique pousse doucement. Il faut choisir son rythme.',opts:[
 {t:'Poussée continue',d:'Gagne de la trajectoire, chauffe le système.',roll:{p:.7,ok:[fx('mar',.02)],ko:[fx('pm',-.04,2,'Moteur surchauffé'),fx('res',-3)],okT:'La poussée continue gagne du Δv.',koT:'Le moteur surchauffe et doit être réparé.'}},
 {t:'Poussée par cycles',d:'Plus lent, plus sûr.',fx:[fx('mar',.005),fx('pm',.01,2,'Moteur ménagé')],res:'Le moteur alterne poussée et repos.',q:0}]}}});
E({slot:2,kind:'inc',w:4,when:function(r){return r.pm<.15},build:function(F){return {id:'power',scene:'alert',title:'Énergie juste',text:'La production électrique frôle la consommation. Un pic peut tout couper.',opts:[
 {t:'Délester un instrument',d:'Moins de science, plus de marge.',fx:[fx('sci',.9,3,'Instrument délesté'),fx('pm',.03,3,'Énergie respectée')],res:'Un instrument passe en veille.',q:0},
 {t:'Réorienter les panneaux',d:'Peut échouer.',roll:{p:.65,ok:[fx('pm',.03,3,'Panneaux orientés')],ko:[fx('pm',-.04,2,'Orientation ratée')],okT:'Les panneaux captent plus de lumière.',koT:'La manœuvre fait perdre un peu de puissance.'}},
 {t:'Ne rien changer',d:'Risqué.',fx:[fx('pm',-.02,3,'Énergie tendue')],res:'Le système tient en limite.',q:-1}]}}});
E({slot:2,kind:'inc',w:4,when:function(r){return r.tstate!=='full'},build:function(F){return {id:'therm',scene:'alert',title:'Alerte thermique',text:'Le contrôle thermique n\'est pas idéal : des capteurs chauffent ou gèlent.',opts:[
 {t:'Réorienter le vaisseau',d:'Un peu de Δv.',fx:[fx('mar',-.008),fx('pm',.02,3,'Température régulée')],res:'Le vaisseau tourne pour équilibrer la température.',q:0},
 {t:'Couper des appareils',d:'Moins de science.',fx:[fx('sci',.85,2,'Appareils coupés'),fx('pm',.015,3,'Température régulée')],res:'Des appareils sont éteints.',q:0},
 {t:'Ignorer',d:'Pari.',roll:{p:.5,ok:[],ko:[fx('pm',-.08,3,'Dégâts thermiques')],okT:'Les températures reviennent à la normale.',koT:'Des composants souffrent.'}}]}}});
E({slot:2,kind:'opp',w:3,build:function(F){return {id:'cal',scene:'cruise',title:'Étalonnage en route',text:'Les premières semaines de croisière sont idéales pour régler les instruments.',opts:[
 {t:'Étalonner les instruments',d:'3 M$ : meilleure qualité de données.',cost:3,fx:[fx('sci',1.12,4,'Instruments étalonnés')],res:'Les mesures seront plus précises.',q:1},
 {t:'Tester la liaison radio',d:'2 M$ : fiabilité des communications.',cost:2,fx:[fx('pm',.012,4,'Liaison testée')],res:'La liaison est vérifiée.',q:1},
 {t:'Économiser',d:'Rien à payer.',fx:[],res:'On garde les crédits en réserve.',q:0}]}}});
E({slot:2,kind:'opp',w:3,when:function(r){return r.sides.some(function(s){return s.id==='tech'})},build:function(F){return {id:'tech',scene:'cruise',title:'Test du démonstrateur',text:'Le démonstrateur technologique peut être testé en pleine croisière.',opts:[
 {t:'Test complet',d:'Peut échouer.',roll:{p:.7,ok:[fx('sci',1.1,4,'Technologie validée'),fx('flag',0,0,'techok')],ko:[fx('pm',-.02,1,'Panne brève')],okT:'La technologie est validée en vol.',koT:'Le test s\'interrompt et gêne le vaisseau.'}},
 {t:'Test réduit',d:'Résultat modeste.',fx:[fx('flag',0,0,'techok')],res:'Un test limité est réalisé.',q:0}]}}});
/* --- Créneau 4 : navigation --- */
E({slot:4,kind:'inc',w:3,build:function(F){return {id:'nav',scene:'corr',title:'Erreur de navigation',text:'La trajectoire dérive légèrement. Il faut décider de corriger ou non.',opts:[
 {t:'Correction complète',d:'Brûle du Δv, trajectoire propre.',fx:[fx('mar',-.03),fx('pm',.025,3,'Trajectoire propre')],res:'La trajectoire est ramenée dans le couloir.',q:1},
 {t:'Correction partielle',d:'Moins de Δv.',fx:[fx('mar',-.015),fx('pm',.01,3,'Trajectoire améliorée')],res:'Une partie de l\'erreur est corrigée.',q:0},
 {t:'Ne pas corriger',d:'On économise le Δv.',roll:{p:.55,ok:[fx('res',2)],ko:[fx('pm',-.07,3,'Dérive de trajectoire')],okT:'La dérive reste dans les marges.',koT:'La dérive s\'aggrave.'}}]}}});
E({slot:4,kind:'inc',w:3,build:function(F){return {id:'meteor',scene:'meteor',title:'Micrométéoroïdes',text:'Un nuage de poussières traverse la trajectoire.',opts:[
 {t:'Orienter le bouclier',d:'Un peu de Δv.',fx:[fx('mar',-.01),fx('pm',.01,2,'Bouclier orienté')],res:'Le vaisseau présente sa face protégée.',q:0},
 {t:'Continuer tel quel',d:'Peut abîmer le vaisseau.',roll:{p:.7,ok:[],ko:[fx('pm',-.06,3,'Impacts'),fx('sci',.9,3,'Capteurs abîmés')],okT:'Le nuage passe sans dégât.',koT:'Plusieurs impacts abîment la structure.'}},
 {t:'Mettre en sécurité',d:'Moins de science.',fx:[fx('sci',.9,2,'Mise en sécurité')],res:'Le vaisseau se met en sécurité.',q:0}]}}});
E({slot:4,kind:'inc',w:4,when:function(r){return r.rad>.1},build:function(F){return {id:'dose',scene:'storm',title:'Radiations cumulées',text:'La dose reçue grimpe. L\'électronique commence à montrer des erreurs.',opts:[
 {t:'Mettre l\'électronique en veille',d:'Moins de science.',fx:[fx('pm',.03,3,'Électronique en veille'),fx('sci',.85,2,'Veille')],res:'L\'électronique est protégée.',q:0},
 {t:'Continuer',d:'Pari.',roll:{p:.6+(F.cfgHard?.15:0),ok:[],ko:[fx('pm',-.08,3,'Électronique dégradée')],okT:'Les composants encaissent.',koT:'Des composants lâchent.'}}]}}});
E({slot:4,kind:'inc',w:4,when:function(r){return r.lm<.25},build:function(F){return {id:'comm',scene:'alert',title:'Liaison saturée',text:'Le volume de données dépasse ce que la liaison peut envoyer.',opts:[
 {t:'Compresser les données',d:'Moins de précision.',fx:[fx('sci',.88,4,'Données compressées'),fx('pm',.02,3,'Liaison soulagée')],res:'Les données sont compressées.',q:0},
 {t:'Prioriser les caméras',d:'Pari sur les images.',roll:{p:.6,ok:[fx('sci',1.1,3,'Images prioritaires')],ko:[fx('pm',-.05,3,'Liaison engorgée')],okT:'Les images passent.',koT:'La liaison déborde.'}}]}}});
E({slot:4,kind:'opp',w:3,build:function(F){return {id:'dsn',scene:'cruise',title:'Fenêtre radio',text:'Le réseau d\'antennes au sol propose une fenêtre d\'écoute plus longue.',opts:[
 {t:'Réserver la longue fenêtre',d:'4 M$ : plus de données, plus de sûreté.',cost:4,fx:[fx('pm',.015,4,'Écoute prolongée'),fx('sci',1.06,4,'Plus de données')],res:'La longue fenêtre est réservée.',q:1},
 {t:'Fenêtre standard',d:'Rien à payer.',fx:[],res:'Rien ne change.',q:0}]}}});
/* --- Créneau 6 : arrivée --- */
E({slot:6,kind:'inc',w:3,when:function(r){return r.d.key==='moon'||r.d.key==='mars'||r.d.key==='venus'},build:function(F){var k=F.r.d.key,nm=k==='moon'?'poussière lunaire':k==='mars'?'tempête de poussière':'nuages d\'acide';return {id:'weather',scene:'storm',title:'Conditions locales',text:'Des '+nm+' compliquent l\'arrivée.',opts:[
 {t:'Attendre un peu',d:'3 M$ : décalage de quelques jours.',cost:3,fx:[fx('pm',.03,2,'Conditions calmes')],res:'L\'arrivée est décalée.',q:1},
 {t:'Foncer',d:'Peut mal tourner.',roll:{p:.65,ok:[fx('sci',1.1,3,'Données rares')],ko:[fx('pm',-.08,2,'Arrivée difficile')],okT:'L\'arrivée passe sans encombre.',koT:'Les conditions compliquent la manœuvre.'}}]}}});
E({slot:6,kind:'inc',w:3,build:function(F){return {id:'sensor',scene:'alert',title:'Capteur d\'approche',text:'Un capteur de navigation envoie des mesures étranges juste avant l\'arrivée.',opts:[
 {t:'Mode automatique',d:'Faire confiance au logiciel.',roll:{p:.75,ok:[],ko:[fx('pm',-.1,2,'Navigation faussée')],okT:'Le logiciel fait le tri.',koT:'Le logiciel se trompe.'}},
 {t:'Mode sécurisé',d:'Moins de science.',fx:[fx('pm',.02,2,'Mode sécurisé'),fx('sci',.9,2,'Mode sécurisé')],res:'Le vaisseau passe en mode sécurisé.',q:0},
 {t:'Caméra de secours',d:'Utilise un système redondant.',roll:{p:.8+(F.cfgRed?.1:0),ok:[fx('pm',.02,2,'Caméra de secours')],ko:[fx('pm',-.04,2,'Secours défaillant')],okT:'La caméra de secours prend le relais.',koT:'La caméra de secours échoue.'}}]}}});
E({slot:6,kind:'inc',w:5,when:function(r,F){return F.mar<.04},build:function(F){return {id:'burn',scene:'alert',title:'Marge de Δv trop mince',text:'Il reste très peu de Δv pour freiner à l\'arrivée.',opts:[
 {t:'Freinage serré',d:'Peut gagner une marge.',roll:{p:.55,ok:[fx('mar',.02)],ko:[fx('pm',-.1,2,'Freinage raté')],okT:'Le freinage est parfait.',koT:'Le freinage est trop tendu.'}},
 {t:'Réserves d\'attitude',d:'On puise dans les petites réserves.',fx:[fx('mar',.01),fx('pm',-.02,2,'Contrôle affaibli')],res:'Un peu de Δv est récupéré.',q:0}]}}});
E({slot:6,kind:'opp',w:3,build:function(F){var land=F.r.d.type==='landing';return {id:'site',scene:'cruise',title:land?'Choix du site':'Choix de l\'orbite',text:land?'Deux zones sont possibles : une plaine sûre et un site plus riche en science.':'Deux orbites sont possibles : une orbite basse très riche en images, ou une orbite haute plus stable.',opts:land?[
 {t:'Site sûr',d:'Peu de science, grande sûreté.',fx:[fx('pm',.03,2,'Site sûr'),fx('sci',.9,3,'Site banal')],res:'Le site sûr est retenu.',q:0},
 {t:'Site scientifique',d:'Plus de science, plus de risque.',roll:{p:.6,ok:[fx('sci',1.3,3,'Site riche')],ko:[fx('pm',-.07,2,'Terrain difficile')],okT:'Le site se révèle riche en science.',koT:'Le terrain est piégeux.'}},
 {t:'Site intermédiaire',d:'Équilibre.',fx:[fx('sci',1.1,3,'Site correct'),fx('pm',-.01,2,'Terrain varié')],res:'Un compromis est retenu.',q:0}]:[
 {t:'Orbite basse',d:'Images fines, un peu plus risquée.',fx:[fx('pm',-.02,2,'Orbite basse'),fx('sci',1.2,3,'Images fines')],res:'L\'orbite basse promet des images fines.',q:0},
 {t:'Orbite haute',d:'Plus stable.',fx:[fx('pm',.02,2,'Orbite stable'),fx('sci',.95,3,'Orbite haute')],res:'L\'orbite haute est prudente.',q:0},
 {t:'Orbite polaire',d:'4 M$ : couverture globale.',cost:4,fx:[fx('sci',1.1,3,'Couverture globale')],res:'L\'orbite polaire couvre toute la surface.',q:1}]}}});
/* --- Créneau 8 : opérations --- */
E({slot:8,kind:'inc',w:3,build:function(F){return {id:'fail',scene:'alert',title:'Panne d\'un équipement',text:'Un équipement important cesse de répondre.',opts:[
 {t:'Basculer sur le secours',d:F.cfgRed?'Vous avez la redondance.':'Sans redondance, risqué.',roll:{p:F.cfgRed?.92:.6,ok:[fx('pm',.01,2,'Secours actif')],ko:[fx('sci',.8,2,'Équipement perdu'),fx('pm',-.05,2,'Panne')],okT:'Le secours prend le relais.',koT:'Le secours ne démarre pas.'}},
 {t:'Redémarrer à distance',d:'Peut échouer.',roll:{p:.7,ok:[],ko:[fx('sci',.8,2,'Équipement perdu')],okT:'L\'équipement repart.',koT:'L\'équipement reste muet.'}},
 {t:'Couper l\'équipement',d:'Moins de science.',fx:[fx('sci',.85,2,'Équipement coupé')],res:'L\'équipement est coupé.',q:0}]}}});
E({slot:8,kind:'opp',w:3,when:function(r,F){return F.res>=8},build:function(F){return {id:'extend',scene:'cruise',title:'Prolonger la mission',text:'Les instruments sont en bonne forme. Une prolongation est possible.',opts:[
 {t:'Prolonger de trois mois',d:'8 M$ : plus de science, plus de risque.',cost:8,fx:[fx('sci',1.25,2,'Mission prolongée'),fx('pm',-.02,2,'Usure')],res:'La mission est prolongée.',q:1},
 {t:'Conclure à temps',d:'Rien à payer.',fx:[],res:'La mission se termine à la date prévue.',q:0}]}}});
E({slot:8,kind:'opp',w:3,build:function(F){return {id:'partner',scene:'cruise',title:'Offre d\'une agence partenaire',text:'Une agence partenaire propose d\'échanger ses données contre les vôtres.',opts:[
 {t:'Accepter',d:'Plus de science, un peu de travail.',fx:[fx('sci',1.12,2,'Données partagées'),fx('res',-2)],res:'L\'échange est conclu.',q:1},
 {t:'Décliner',d:'Rien ne change.',fx:[],res:'Vous restez indépendant.',q:0}]}}});
E({slot:8,kind:'opp',w:2,when:function(r){return r.lm<.4},build:function(F){return {id:'prio',scene:'cruise',title:'Débit radio limité',text:'La liaison ne passera pas toutes les données. Que privilégier ?',opts:[
 {t:'Images',d:'Plus de science visible.',fx:[fx('sci',1.1,2,'Images prioritaires')],res:'Les images partent en premier.',q:1},
 {t:'Mesures compactes',d:'Plus de fiabilité.',fx:[fx('pm',.02,2,'Mesures compactes')],res:'Les mesures compactes passent d\'abord.',q:0}]}}});

/* ===== INTERFACE ===== */
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var P=SH.store.ao;
Object.defineProperty(P,'credits',{get:function(){return SH.store.credits},set:function(v){SH.store.credits=v},enumerable:false,configurable:true});
Object.defineProperty(P,'df',{get:function(){return SH.store.df},set:function(v){SH.store.df=v},enumerable:false,configurable:true});
function saveP(){SH.save()}
var say=SH.say,flash=SH.flash,confetti=SH.confetti,countUp=SH.countUp;
function shakeScreen(){var el=$('#a-s-fly');el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake')}
var S={screen:'hub',dest:null,cfg:null,r:null,cons:[],F:null,fl:null,prev:'home',last:null};
function ctx(){return {df:DIFF[P.df],up:P.up,cons:S.cons}}
function unlocked(k){var i=ORDER.indexOf(k);if(i<=0||P.open)return true;var p=P.done[ORDER[i-1]];return !!(p&&p.best>=45)}
function cfgPlain(c){return JSON.parse(JSON.stringify(c,function(k,v){return v instanceof Set?Array.from(v):v}))}

/* ---------- visuels ---------- */
function glyph(k,cx,cy,r){
  var c={leo:'#3f8fd6',moon:'#bcc5d6',venus:'#e3b878',mars:'#c4573a',ast:'#8d8176',jup:'#cfae8a'}[k];
  if(k==='leo')return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#3f8fd6"/><path d="M'+(cx-r*.6)+' '+(cy-r*.2)+' Q'+(cx-r*.1)+' '+(cy-r*.7)+' '+(cx+r*.3)+' '+(cy-r*.3)+' T'+(cx+r*.6)+' '+(cy+r*.3)+'" stroke="#bfe0ff" stroke-width="'+r*.16+'" fill="none" opacity=".75"/><ellipse cx="'+cx+'" cy="'+cy+'" rx="'+r*1.35+'" ry="'+r*.4+'" fill="none" stroke="#ff7b3a" stroke-width="'+Math.max(1,r*.05)+'" transform="rotate(-20 '+cx+' '+cy+')"/>';
  if(k==='moon')return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+c+'"/><circle cx="'+(cx-r*.3)+'" cy="'+(cy-r*.25)+'" r="'+r*.22+'" fill="#9aa5b9"/><circle cx="'+(cx+r*.35)+'" cy="'+(cy+r*.3)+'" r="'+r*.3+'" fill="#9aa5b9"/><circle cx="'+(cx+r*.1)+'" cy="'+(cy-r*.5)+'" r="'+r*.12+'" fill="#9aa5b9"/>';
  if(k==='venus')return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+c+'"/><path d="M'+(cx-r*.9)+' '+(cy-r*.3)+' Q'+cx+' '+(cy-r*.1)+' '+(cx+r*.9)+' '+(cy-r*.4)+'" stroke="#c99a58" stroke-width="'+r*.16+'" fill="none"/><path d="M'+(cx-r*.9)+' '+(cy+r*.3)+' Q'+cx+' '+(cy+r*.55)+' '+(cx+r*.9)+' '+(cy+r*.2)+'" stroke="#f3d7a2" stroke-width="'+r*.14+'" fill="none"/>';
  if(k==='mars')return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+c+'"/><path d="M'+(cx-r*.9)+' '+(cy-r*.2)+' Q'+cx+' '+(cy-r*.55)+' '+(cx+r*.9)+' '+(cy-r*.1)+'" stroke="#8f3a24" stroke-width="'+r*.14+'" fill="none"/><ellipse cx="'+cx+'" cy="'+(cy-r*.9)+'" rx="'+r*.38+'" ry="'+r*.12+'" fill="#f1e3da"/>';
  if(k==='jup')return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+c+'"/><path d="M'+(cx-r*.95)+' '+(cy-r*.35)+' H'+(cx+r*.95)+'" stroke="#b07f54" stroke-width="'+r*.2+'"/><path d="M'+(cx-r*.95)+' '+(cy+r*.3)+' H'+(cx+r*.95)+'" stroke="#e9dcc8" stroke-width="'+r*.16+'"/><circle cx="'+(cx+r*.35)+'" cy="'+(cy+r*.5)+'" r="'+r*.16+'" fill="#c0522a"/>';
  var p=[[-.9,-.2],[-.5,-.8],[.2,-.95],[.85,-.4],[.9,.35],[.3,.9],[-.45,.75]].map(function(q){return (cx+q[0]*r).toFixed(1)+','+(cy+q[1]*r).toFixed(1)}).join(' ');
  return '<polygon points="'+p+'" fill="var(--rock)"/><circle cx="'+(cx-r*.2)+'" cy="'+(cy-r*.1)+'" r="'+r*.2+'" fill="#6f655c"/>';
}
function earth(cx,cy,r){return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="var(--earth)"/><path d="M'+(cx-r*.6)+' '+(cy-r*.2)+' Q'+(cx-r*.1)+' '+(cy-r*.7)+' '+(cx+r*.3)+' '+(cy-r*.3)+' T'+(cx+r*.6)+' '+(cy+r*.3)+'" stroke="#bfe0ff" stroke-width="'+r*.16+'" fill="none" opacity=".75"/>'}
function drawTrajectory(svg,c){
  var d=DEST[c.dest],T=TRAJ[c.traj],x0=100,x1=c.dest==='leo'?260:c.dest==='moon'?300:c.dest==='ast'?540:575,y=118,dx=x1-x0,h=T.h;
  var pd='M'+x0+','+y+' C'+(x0+dx*.28)+','+(y-h*1.5)+' '+(x1-dx*.28)+','+(y-h*1.5)+' '+(x1-26)+','+y;
  svg.innerHTML='<circle cx="60" cy="40" r="1" fill="var(--dim)"/><circle cx="360" cy="30" r="1" fill="var(--dim)"/><circle cx="620" cy="60" r="1.2" fill="var(--dim)"/>'+earth(70,118,26)+'<text class="svt" x="70" y="166" text-anchor="middle">TERRE</text>'+glyph(d.key==='leo'?'leo':d.key,x1,y,d.key==='leo'?14:d.key==='jup'?20:14)+'<text class="svt" x="'+x1+'" y="166" text-anchor="middle">'+d.name.toUpperCase()+'</text><path class="path-line" d="'+pd+'"/>';
}

/* ---------- navigation ---------- */
function go(n){
  S.screen=n;
  ['fly','res'].forEach(function(k){$('#a-s-'+k).hidden=n!==k});$('#a-s-inter').hidden=true;
  var work=n==='lab'||n==='traj';
  $('#a-work').hidden=!work;$('#a-s-lab').hidden=n!=='lab';$('#a-s-traj').hidden=n!=='traj';
  SH.showMod('ao');
  var d=S.cfg?DEST[S.cfg.dest].name:'';
  SH.setStep(n,{lab:'Atelier · '+d,traj:'Trajectoire · '+d,fly:'Vol · '+d,res:'Bilan du vol · '+d}[n]||'');
  if(n==='lab')renderLab();
  if(work)update();
  window.scrollTo(0,0);
}
function pollHtml(r){return r.checks.map(function(k){return '<li class="'+(k.go?'go':'nogo')+'"><span class="tag">'+(k.go?'GO':'NO-GO')+'</span><span class="p-name">'+k.name+'</span><span class="p-det">'+k.det+'</span></li>'}).join('')}
function demo(){
  var c=starter('moon');c.launcher='heavy';c.prop='cryo';c.power='solar';c.therm='heat';c.ant='mga';c.inst=new Set(['cam','spec','drill']);c.traj='eco';
  var r=calc(c,{df:DIFF.normal,up:P.up,cons:[]});
  return {title:'Lune · lanceur lourd · cryogénique',poll:pollHtml(r),foot:'Réussite estimée : '+Math.round(r.pTotal*100)+' %. Ce dossier est un exemple calculé par le moteur du jeu.'};
}
function chapters(){return ORDER.map(function(k){var d=DEST[k],rec=P.done[k];return {key:k,name:d.name,sub:d.sub,level:d.level,dv:d.dv,days:d.days,budget:d.budget,sci:d.sci,best:rec?rec.best:0,runs:rec?rec.runs:0,medal:rec?rec.medal||0:0,unlocked:unlocked(k),glyph:glyph(k,50,50,k==='leo'?28:40)}})}

/* ---------- relais Atelier <-> Cadet ---------- */
var CREWCH={moon:1,mars:1,ast:1};
var CHKEY={moon:'lune',mars:'mars',ast:'ast'};
function crewBeat(F,i){
  var bad=F.bad>0||F.mods.some(function(m){return m.k==='pm'&&m.v<0});
  var hard=F.cfgHard?.08:0;
  if(bad)return {id:'crew_eva',crew:true,scene:'eva',title:'Sortie de réparation',text:'Un incident a fragilisé le vaisseau. L\'équipage propose de sortir pour inspecter et réparer la coque.',opts:[
    {t:'Sortie extravéhiculaire',d:'Une vraie réparation, mais la sortie est risquée.',roll:{p:.6+hard,ok:[fx('pm',.04,3,'Coque réparée')],ko:[fx('pm',-.03,2,'Équipier blessé'),fx('res',-3)],okT:'La coque est réparée : le vaisseau est plus fiable.',koT:'La sortie tourne mal : une réparation incomplète et du matériel perdu.'}},
    {t:'Réparer de l\'intérieur',d:'Sans danger, mais le résultat est modeste.',fx:[fx('pm',.015,2,'Réparation interne'),fx('sci',.93,1,'Équipe mobilisée')],res:'Une réparation de fortune tient le temps du voyage.',q:0},
    {t:'Reporter à plus tard',d:'On garde le cap sans rien toucher.',fx:[fx('pm',-.02,2,'Défaut non réparé')],res:'Le défaut reste là, sous surveillance.',q:-1}]};
  if(i===8)return {id:'crew_sci',crew:true,scene:'sci',title:'Observation de dernière minute',text:'L\'équipage repère une occasion rare d\'observation avant la fin du voyage. Il demande l\'autorisation d\'y consacrer du temps.',opts:[
    {t:'Observation intensive',d:'Gros gain de science si tout se passe bien.',roll:{p:.68,ok:[fx('sci',1.18,2,'Données rares')],ko:[fx('sci',.9,2,'Équipe épuisée')],okT:'Les mesures sont excellentes.',koT:'L\'équipe est trop fatiguée : les mesures sont médiocres.'}},
    {t:'Observation prudente',d:'Un petit gain, sans effort particulier.',fx:[fx('sci',1.06,2,'Observation prudente')],res:'Quelques données de plus, sans risque.',q:1},
    {t:'Laisser l\'équipe se reposer',d:'Moral en hausse, un peu plus de fiabilité.',fx:[fx('pm',.012,2,'Équipe reposée')],res:'L\'équipage récupère avant les opérations.',q:0}]};
  return {id:'crew_moral',crew:true,scene:'moral',title:'Moral de l\'équipage',text:'Le voyage est long. L\'équipe demande comment occuper la prochaine journée.',opts:[
    {t:'Appel à la famille',d:'Moral en hausse, un peu moins de science.',fx:[fx('pm',.015,2,'Moral au beau fixe'),fx('sci',.96,1,'Journée écourtée')],res:'Tout le monde repart de bonne humeur.',q:1},
    {t:'Séance de sport et de réglages',d:'Équipe en forme, vaisseau mieux réglé.',fx:[fx('pm',.02,2,'Équipe en forme')],res:'L\'équipe est en pleine forme.',q:1},
    {t:'Continuer le programme',d:'Plus de science, mais l\'équipe fatigue.',fx:[fx('sci',1.05,2,'Programme chargé'),fx('pm',-.01,1,'Fatigue')],res:'Le programme avance, au prix de la fatigue.',q:0}]};
}
function pickCore(k){
  var F=S.F,b=S.fl.cur,i=F.i;
  var out=chooseOpt(F,b,k);if(!out)return null;
  S.fl.beatDone[i]=true;
  var o=b.opts[k];
  S.fl.hist.push({phase:phName(S.r.d,i),title:b.title,choice:o.t,res:out.txt,roll:out.roll,effs:out.effs});
  logAdd('Effet',o.t+' — '+(out.effs.map(function(e){return e.t}).join(' ; ')||'aucun effet'),out.roll&&!out.roll.ok);
  S.fl.last={o:o,out:out};
  return S.fl.last;
}
function relayCrew(b,i){
  var F=S.F,hints=DIFF[P.df].hints;
  $('#a-nextBtn').hidden=true;logAdd('Relais équipage',b.title);
  var sp={scene:CHKEY[S.r.d.key],kind:b.id,step:'Équipage en vol · '+S.r.d.name,eyebrow:'Relais · Mission Cadet',tag:'Équipage en vol',title:b.title,text:b.text,cine:'Équipage · '+b.title,say:'L\'équipage a besoin d\'une décision !',back:'Retour au vol',
    opts:b.opts.map(function(o,k){var p=o.roll?rp(F,o.roll.p):null,meta=[];if(o.cost)meta.push('Réserve −'+o.cost+' M$');if(o.roll)meta.push(hints?'≈ '+Math.round(p*100)+' % de réussite':'Résultat incertain');
      return {n:o.t,d:o.d,meta:meta,disabled:!!(o.cost&&F.res<o.cost),run:function(){var r=pickCore(k);return {title:o.t,txt:r.out.txt,roll:r.out.roll,effs:r.out.effs}}}}),
    done:function(){backToFlight(i)}};
  SH.transit('Équipage','Mission Cadet',function(){SH.MC.interlude(sp)});
}
function backToFlight(i){
  SH.transit('Atelier','Retour au vol',function(){
    go('fly');
    if(SH.S3&&SH.S3.ok){SH.S3.mount($('#a-scene'));SH.S3.scene('a:'+S.r.d.key,{land:S.r.d.type==='landing'})}
    var r=S.fl.last,o=r.o,out=r.out;
    showCard('<div class="beat'+(out.roll&&!out.roll.ok?' alert':' opp')+'"><span class="kind">Décision de l\'équipage</span><h3>'+esc(o.t)+'</h3><p>'+(out.roll?(out.roll.ok?'<span class="res-ok">Réussi.</span> ':'<span class="res-ko">Raté.</span> '):'')+esc(out.txt||'')+'</p>'+(out.effs.length?effChips(out.effs):'<p class="fine">Aucun effet durable.</p>')+'</div>');
    $('#a-stages').innerHTML=stagesHtml();sceneSet(Math.max(0,i-1),{});
    $('#a-nextBtn').hidden=false;$('#a-nextBtn').textContent='Lancer : '+phName(S.r.d,i);$('#a-nextBtn').dataset.mode='phase';
    update2();
  });
}
/* interlude d'ingénierie (écran Atelier ouvert depuis Mission Cadet) */
var IA=null;
function iArt(kind){
  var base='<rect width="600" height="160" fill="#050a1c"/>';
  return base;
}
function interlude(sp){
  IA=sp;sp.sel=-1;sp.done_=false;
  ['fly','res'].forEach(function(k){$('#a-s-'+k).hidden=true});$('#a-work').hidden=true;
  var sec=$('#a-s-inter');sec.hidden=false;SH.showMod('ao');
  SH.setStep('fly',sp.step||'Atelier');
  $('#a-iEye').textContent=sp.eyebrow||'Relais · Atelier Orbital';
  $('#a-iTitle').textContent=sp.title;$('#a-iLead').textContent=sp.text;$('#a-iTag').textContent=sp.tag||'Atelier';
  $('#a-iPick').hidden=false;$('#a-iRes').hidden=true;
  $('#a-iOpts').innerHTML=sp.opts.map(function(o,k){
    return '<button type="button" class="opt" role="radio" aria-checked="false" data-iopt="'+k+'"'+(o.disabled?' disabled':'')+'><span class="o-top"><span class="o-name">'+esc(o.n)+'</span><span class="o-state"></span></span>'+(o.meta&&o.meta.length?'<span class="o-meta">'+o.meta.map(esc).join(' · ')+'</span>':'')+'<span class="o-desc">'+esc(o.d)+'</span></button>'}).join('');
  $('#a-iPoll').innerHTML='<li class="go"><span class="tag">…</span><span class="p-name">Choisissez une option</span><span class="p-det">Le contrôle Go / No-Go s\'affiche ici.</span></li>';
  $('#a-iPct').textContent='';
  var g=$('#a-iGo');g.disabled=true;g.textContent='Choisissez une option';
  sec.classList.remove('enter');void sec.offsetWidth;sec.classList.add('enter');
  if(SH.S3&&SH.S3.ok){SH.S3.mount($('#a-iArt'));SH.S3.scene('i:'+sp.kind,{dest:sp.scene||'moon',land:sp.scene==='moon'||sp.scene==='ast'});SH.S3.sync($('#a-iArt'))}
  SH.say(sp.say||'L\'Atelier prend le relais !','happy',3200);
  window.scrollTo(0,0);
}
function iSelect(k){
  var sp=IA;if(!sp||sp.done_)return;var o=sp.opts[k];if(!o||o.disabled)return;
  sp.sel=k;
  $$('#a-iOpts .opt').forEach(function(b,j){var on=j===k;b.setAttribute('aria-checked',on?'true':'false');b.querySelector('.o-state').textContent=on?'Choisi':''});
  $('#a-iPoll').innerHTML=(o.checks||[]).map(function(c){return '<li class="'+(c.go?'go':'nogo')+'"><span class="tag">'+(c.go?'GO':'NO-GO')+'</span><span class="p-name">'+esc(c.n)+'</span><span class="p-det">'+esc(c.t)+'</span></li>'}).join('');
  $('#a-iPct').textContent=o.pct!=null?'Fiabilité ≈ '+Math.round(o.pct*100)+' %':'';
  var g=$('#a-iGo');g.disabled=false;g.textContent='Valider : '+o.n;
  if(SH.S3&&SH.S3.pulse)SH.S3.pulse(o.fx||sp.kind);
}
function iGo(){
  var sp=IA;if(!sp||sp.done_||sp.sel<0)return;sp.done_=true;
  var r=sp.opts[sp.sel].run();
  $('#a-iPick').hidden=true;var rb=$('#a-iRes');rb.hidden=false;rb.className='beat'+(r.roll&&!r.roll.ok?' alert':' opp');
  rb.innerHTML='<span class="kind">'+(r.roll?(r.roll.ok?'Réussi':'Raté'):'Décision prise')+'</span><h3>'+esc(r.title)+'</h3><p>'+esc(r.txt||'')+'</p>'+(r.effs&&r.effs.length?'<ul class="fxl">'+r.effs.map(function(e){return '<li class="fxc '+(e.g>0?'gd':e.g<0?'bd':'')+'">'+esc(e.t)+'</li>'}).join('')+'</ul>':'')+'<div class="row"><button class="btn pri" data-iback="1">'+esc(sp.back||'Retour à la mission')+'</button></div>';
  if(r.roll&&!r.roll.ok){say('Aïe… ça ne s\'est pas passé comme prévu.','hurt',3200);flash()}
  else{say('Manœuvre validée !','cheer',2600);flash('good')}
  if(SH.S3&&SH.S3.burst)SH.S3.burst(r.roll&&!r.roll.ok?'bad':'good');
}

/* ---------- atelier ---------- */
function optB(grp,id,name,meta,desc,on,extra,dis){
  return '<button class="opt" role="'+(grp==='inst'||grp==='side'||grp==='prot'?'checkbox':'radio')+'" aria-checked="'+on+'" data-grp="'+grp+'" data-id="'+id+'"'+(dis?' disabled':'')+'><span class="o-top"><span class="o-name">'+name+'</span><span class="o-state">'+(on?(grp==='inst'||grp==='side'||grp==='prot'?'Embarqué':'Choisi'):'')+'</span></span><span class="o-meta">'+meta+'</span><span class="o-desc">'+desc+'</span>'+(extra?'<span class="o-warn">'+extra+'</span>':'')+'</button>';
}
function renderLab(){
  var c=S.cfg,d=DEST[c.dest],df=DIFF[P.df],x=ctx();
  $('#a-labEyebrow').textContent='Atelier · '+d.name+' · '+df.name;
  $('#a-labLead').textContent=d.story;
  var cb=$('#a-consBox');
  if(S.cons.length){cb.hidden=false;cb.innerHTML='<span class="eyebrow">Contraintes surprises de ce niveau</span><ul>'+S.cons.map(function(k){return '<li><b>'+CONS[k].n+'.</b> '+CONS[k].d+'</li>'}).join('')+'</ul>'}else cb.hidden=true;
  $('#a-g-launcher').innerHTML=Object.keys(LAUN).map(function(k){var L=LAUN[k],dis=k==='super'&&S.cons.indexOf('noheavy')>=0,cp=Math.round(L.cap*df.cap),co=Math.round(L.cost*(S.cons.indexOf('cheap')>=0?1.15:1)*(1-.08*P.up.reuse));
    return optB('launcher',k,L.name,fmt(cp)+' kg · '+co+' M$ · fiabilité '+Math.round(Math.min(.995,L.rel+.01*P.up.lab)*100)+' %',L.desc,c.launcher===k,dis?'Indisponible ce niveau':'',dis)}).join('');
  $('#a-g-prop').innerHTML=Object.keys(PROP).map(function(k){var p=PROP[k];return optB('prop',k,p.name,'Isp '+p.isp+' s · '+p.mass+' kg · '+p.cost+' M$',p.desc+' Poussée '+p.thrust+'.',c.prop===k,k==='ion'&&d.highThrust?'Impossible pour atterrir ici':'')}).join('');
  $('#a-g-power').innerHTML=Object.keys(POWER).map(function(k){var w=POWER[k];return optB('power',k,w.name,fmt(w.rtg?w.watts:w.watts*d.flux)+' W ici · '+w.mass+' kg · '+w.cost+' M$',w.desc,c.power===k)}).join('');
  $('#a-envNote').textContent='Environnement '+ENVN[d.thermal]+' · liaison '+d.lt;
  $('#a-g-therm').innerHTML=Object.keys(THERM).map(function(k){var t=THERM[k],st=t.cover.indexOf(d.thermal)>=0?'adapté':t.part.indexOf(d.thermal)>=0?'limite':'inadapté';return optB('therm',k,t.name,t.mass+' kg · '+t.cost+' M$ · '+t.power+' W',t.desc,c.therm===k,df.hints?'Ici : '+st:'')}).join('');
  $('#a-g-ant').innerHTML=Object.keys(ANT).map(function(k){var a=ANT[k];return optB('ant',k,a.name,a.mass+' kg · '+a.cost+' M$ · '+a.power+' W',a.desc,c.ant===k)}).join('');
  $('#a-g-prot').innerHTML=['shield','hard','red'].map(function(k){var p=PROT[k];return optB('prot',k,p.n,p.mass+' kg · '+p.cost+' M$',p.desc,!!c[k])}).join('');
  $('#a-sciTarget').textContent='Cible '+Math.round(d.sci*(S.cons.indexOf('sci')>=0?1.12:1))+' pts · minimum '+Math.ceil(d.sci/2);
  $('#a-g-inst').innerHTML=Object.keys(INST).map(function(k){var i=INST[k],rel=i.rel[c.dest];return optB('inst',k,i.name,i.mass+' kg · '+i.cost+' M$ · '+i.power+' W · '+Math.round(i.sci*rel)+' pts ici',i.desc,c.inst.has(k),rel===0?'Sans effet ici':rel<.5?'Peu utile ici':'')}).join('');
  var cap=1+P.up.bay;
  $('#a-sideNote').textContent=c.sides.length+' / '+cap+' emplacement'+(cap>1?'s':'');
  $('#a-g-side').innerHTML=Object.keys(SIDE).map(function(k){var s=SIDE[k],bad=s.dests&&s.dests.indexOf(c.dest)<0,full=c.sides.length>=cap&&c.sides.indexOf(k)<0;
    return optB('side',k,s.name,s.mass+' kg · '+s.cost+' M$ · +'+s.pts+' pts',s.desc,c.sides.indexOf(k)>=0,bad?'Pas adaptée à cette mission':full?'Emplacements pleins':'',bad||full)}).join('');
}
function meterH(m){var cls=m.bad?'m-bad':m.warn?'m-warn':'';return '<div class="meter '+cls+'"><div class="m-head"><span class="m-k">'+m.k+'</span><span class="m-v">'+m.v+'</span><span class="m-p">'+Math.round(m.p*100)+'%</span></div><div class="m-bar"><i style="width:'+clamp(m.p*100,3,100)+'%"></i></div></div>'}
function meters(r){
  return [
   {k:'Masse',p:r.m0/r.cap,v:fmt(r.m0)+' / '+fmt(r.cap)+' kg',bad:r.m0>r.cap,warn:r.m0/r.cap>.93},
   {k:'Budget',p:r.cost/r.d.budget,v:fmt(r.cost)+' / '+fmt(r.d.budget)+' M$',bad:r.cost>r.d.budget,warn:r.cost/r.d.budget>.93},
   {k:'Énergie',p:r.supply>0?r.pneed/r.supply:1,v:fmt(r.pneed)+' / '+fmt(r.supply)+' W',bad:r.supply<r.pneed||!(r.P.ion?r.W.watts>=3000:true),warn:r.pneed/Math.max(1,r.supply)>.85},
   {k:'Δv',p:r.req>0?Math.min(1,r.dv/r.req):1,v:fmt(r.dv,2)+' / '+fmt(r.req,2)+' km/s',bad:r.dv<r.req,warn:r.dv/r.req<1.04},
   {k:'Durée',p:r.days/r.d.maxDays,v:dur(r.days),bad:r.days>r.d.maxDays,warn:r.days/r.d.maxDays>.85},
   {k:'Science',p:Math.min(1,r.sci/Math.ceil(r.d.sci/2)),v:fmt(r.sci)+' pts (min '+Math.ceil(r.d.sci/2)+')',bad:r.sci<Math.ceil(r.d.sci/2),warn:r.sci<r.d.sci*.7},
   {k:'Thermique',p:r.tstate==='full'?1:r.tstate==='partial'?.6:.15,v:r.tstate==='full'?'adapté':r.tstate==='partial'?'limite':'inadapté',bad:r.tstate==='none',warn:r.tstate==='partial'},
   {k:'Radio',p:r.dneed>0?Math.min(1,r.rate/r.dneed):1,v:fmt(r.rate)+' / '+fmt(r.dneed),bad:r.rate<r.dneed,warn:r.lm<.15},
   {k:'Radiations',p:Math.min(1,r.rad/.2),v:'risque '+fmt(r.rad*100,1)+' %',bad:false,warn:r.rad>.1}
  ].map(meterH).join('');
}
function advice(r){
  var df=DIFF[P.df];
  var el=$$('[data-advice]');
  var h,ok=!r.nogo.length;
  if(ok)h='<span class="eyebrow">Sondage Go/No-Go</span><span>Les neuf vérifications sont au vert. Réussite estimée du vol : '+Math.round(r.pTotal*100)+' %.</span>';
  else{var k=r.nogo[0];h='<span class="eyebrow">À corriger ('+r.nogo.length+' point'+(r.nogo.length>1?'s':'')+' No-Go)</span><span><b>'+k.name+'.</b> '+(df.hints?k.fix:k.det)+'</span>'}
  el.forEach(function(e){e.className='callout'+(ok?' okc':'');e.innerHTML=h});
}
function update(){
  var r=calc(S.cfg,ctx());S.r=r;
  $('#a-mgrid').innerHTML=meters(r);
  advice(r);
  if(S.screen==='traj'){
    $('#a-poll').innerHTML=pollHtml(r);
    $('#a-pollCount').textContent=(r.checks.length-r.nogo.length)+' / '+r.checks.length+' au vert';
    $('#a-pTotal').textContent=Math.round(r.pTotal*100)+' %';
    var st=$('#a-fuel');st.max=Math.max(10,Math.floor(r.room/10)*10);st.value=r.fuel;
    $('#a-fuelVal').textContent=fmt(r.fuel)+' kg d\'ergols';
    $('#a-fuelShare').textContent=r.m0>0?Math.round(r.fuel/r.m0*100)+' % de la masse au lancement':'';
    $('#a-trajStats').innerHTML='<span>Δv <b>'+fmt(r.dv,2)+'</b> / '+fmt(r.req,2)+' km/s</span><span>Durée <b>'+dur(r.days)+'</b></span><span>Coût <b>'+fmt(r.cost)+'</b> M$</span><span>Masse <b>'+fmt(r.m0)+'</b> kg</span>';
    var rk='';
    if(P.up.sim){var lab=['Lancement','Déploiement','Croisière 1','Croisière 2','Correction','Approche','Arrivée','Ops 1','Ops 2'];rk=r.pSteps.map(function(p,i){return '<div><span>'+lab[i]+'</span><span>'+Math.round(p*100)+' %</span></div>'}).join('')}
    $('#a-risk').innerHTML=rk;
    var b=$('#a-launchBtn');b.disabled=r.nogo.length>0;b.textContent=r.nogo.length?'Lancement bloqué ('+r.nogo.length+' No-Go)':'Lancer la mission';
    drawTrajectory($('#a-trajSvg'),S.cfg);
    $('#a-trajEyebrow').textContent='Trajectoire · '+r.d.name;
    $('#a-g-win').innerHTML=Object.keys(WIN).map(function(k){var w=WIN[k];return optB('win',k,w.name,'Δv ×'+fmt(w.dv,2)+' · '+(w.cost>=0?'+':'−')+Math.abs(w.cost)+' M$',w.desc,(S.cfg.win||'prime')===k)}).join('');
    $('#a-trajOpts').innerHTML=Object.keys(TRAJ).map(function(k){var t=TRAJ[k],dis=t.min&&r.d.days<t.min;return optB('traj',k,t.name,'Δv ×'+fmt(t.dv,2)+' · durée ×'+fmt(t.time,1),t.desc,S.cfg.traj===k,dis?'Réservée aux voyages de plus de '+t.min+' jours':'',dis)}).join('');
  }
}
function startMission(k){
  S.dest=k;S.cons=pickCons(DIFF[P.df]);S.cfg=starter(k);
  // si une contrainte rend le lanceur indisponible
  if(S.cons.indexOf('noheavy')>=0&&S.cfg.launcher==='super')S.cfg.launcher='heavy';
  go('lab');
}
function start(k){startMission(k)}

/* ---------- SCÈNE DE VOL ---------- */
var SCX=[[80,150,-90],[170,70,0],[265,92,0],[360,100,0],[430,86,0],[500,92,0],[520,150,0],[528,150,0],[528,150,0]];
function sceneBuild(r){
  var d=r.d,dk=d.key,land=d.type==='landing',rnd=(function(s){return function(){s=(s*16807)%2147483647;return s/2147483647}})(11);
  var st='';for(var i=0;i<70;i++){st+='<circle cx="'+(rnd()*1280).toFixed(0)+'" cy="'+(rnd()*220).toFixed(0)+'" r="'+(rnd()<.1?1.6:.9).toFixed(1)+'" fill="#d7e3ff" opacity="'+(.3+rnd()*.6).toFixed(2)+'"/>'}
  var st2='';for(var j=0;j<30;j++){st2+='<circle cx="'+(rnd()*1280).toFixed(0)+'" cy="'+(rnd()*220).toFixed(0)+'" r="1.8" fill="#fff" opacity=".8"/>'}
  var storm='';for(var k=0;k<14;k++){storm+='<line x1="'+(30+k*45)+'" y1="'+(-10+(k%3)*20)+'" x2="'+(40+k*45)+'" y2="'+(10+(k%3)*20)+'"/>'}
  var gcol={leo:'#294a7a',moon:'#9aa5b9',venus:'#c99a58',mars:'#8f3a24',ast:'#6f655c',jup:'#7a6652'}[dk];
  return '<defs><linearGradient id="gsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050a1c"/><stop offset="1" stop-color="#101b44"/></linearGradient></defs><rect width="640" height="220" fill="url(#gsky)"/>'+
  '<g class="sc-s">'+st+'</g><g class="sc-s sc-s2">'+st2+'</g>'+
  '<g id="scEarth" class="sc-mv" style="transform:translate(70px,225px) scale(3.2)">'+earth(0,0,30)+'</g>'+
  '<g id="scDest" class="sc-mv" style="transform:translate(590px,110px) scale(.4)">'+glyph(dk,0,0,30)+'</g>'+
  (land?'<g class="sc-ground"><rect x="0" y="182" width="640" height="40" fill="'+gcol+'"/><circle cx="90" cy="200" r="10" fill="rgba(0,0,0,.18)"/><circle cx="300" cy="206" r="14" fill="rgba(0,0,0,.18)"/><circle cx="500" cy="198" r="9" fill="rgba(0,0,0,.18)"/></g>':'')+
  '<g class="sc-ground" id="scPad"><rect x="30" y="196" width="100" height="24" fill="#33405f"/><rect x="60" y="188" width="40" height="8" fill="#4a5a82"/></g>'+
  (!land?'<g id="scOrbit" style="opacity:0;transition:opacity .6s"><ellipse cx="450" cy="110" rx="100" ry="34" fill="none" stroke="#6fd3e8" stroke-width="1" stroke-dasharray="3 5" opacity=".6"/></g>':'')+
  '<g id="scShip" class="sc-mv sc-hide" style="transform:translate(80px,175px) rotate(-90deg)"><g class="sc-flame"><path d="M-12 0 L-34 -5 L-26 0 L-34 5Z" fill="#ffc12e"/><path d="M-12 0 L-26 -2 L-22 0 L-26 2Z" fill="#cc2f2a"/></g>'+
    '<rect class="sc-panel" x="-10" y="-17" width="14" height="6"/><rect class="sc-panel" x="-10" y="11" width="14" height="6"/>'+
    '<path class="sc-hull" d="M-12 -6 H8 L18 0 L8 6 H-12Z"/><circle class="sc-light" cx="2" cy="0" r="2.2"/>'+
    '<g class="sc-smoke"><circle cx="-14" cy="-6" r="4"/><circle cx="-10" cy="-8" r="4"/><circle cx="-18" cy="-4" r="4"/></g>'+
    '<g class="sc-comms"><circle cx="0" cy="0" r="14"/><circle cx="0" cy="0" r="14"/><circle cx="0" cy="0" r="14"/></g></g>'+
  '<g class="sc-boom" id="scBoom" style="transform:translate(300px,100px)"><circle r="20" fill="#ffc12e"/><circle r="14" fill="#ff7b3a"/></g>'+
  '<line id="scBeam" class="sc-beam" x1="520" y1="150" x2="70" y2="130"/>'+
  '<g class="sc-rock"><circle cx="600" cy="60" r="4"/><circle cx="640" cy="110" r="3"/><circle cx="660" cy="160" r="5"/></g>'+
  '<g class="sc-storm">'+storm+'</g><rect class="sc-alert" width="640" height="220"/>';
}
function sceneSet(i,o){
  o=o||{};var r=S.r,d=r.d,sc=$('#a-scene'),land=d.type==='landing',S_=$('#scShip');
  var x=SCX[i];
  var xx=x[0],yy=x[1],rot=x[2];
  if(i===6&&land){xx=530;yy=95;rot=90}
  if(i>=7&&land){xx=528;yy=170;rot=-90}
  if(i>=6&&!land){xx=450+100*0;yy=110-34;rot=0}
  S_.style.transform='translate('+xx+'px,'+yy+'px) rotate('+rot+'deg)';
  var es=[3.2,1.7,1,.7,.55,.45,.4,.4,.4][i],ex=[70,60,50,44,40,38,36,36,36][i],ey=[225,150,130,120,118,116,116,116,116][i];
  $('#scEarth').style.transform='translate('+ex+'px,'+ey+'px) scale('+es+')';
  var dsx,dsy,dsc;
  if(i<=2){dsx=590;dsy=110;dsc=.4}else if(i===3){dsx=590;dsy=110;dsc=.5}else if(i===4){dsx=585;dsy=112;dsc=.7}else if(i===5){dsx=575;dsy=118;dsc=1.1}
  else if(land){dsx=560;dsy=360;dsc=6.2}else{dsx=450;dsy=110;dsc=2.2}
  if(i===5&&!land){dsx=500;dsy=110;dsc=1.6}
  $('#scDest').style.transform='translate('+dsx+'px,'+dsy+'px) scale('+dsc+')';
  sc.setAttribute('data-ground',(i===0||(land&&i>=6))?'1':'0');
  var pad=$('#scPad');pad.style.opacity=i===0?1:0;
  var orb=$('#scOrbit');if(orb)orb.style.opacity=(!land&&i>=6)?1:0;
  sc.setAttribute('data-burn',(i===0||i===4||i===6)&&!o.fail?'1':'0');
  sc.setAttribute('data-comms',(i>=7&&!o.fail)?'1':'0');
  var bm=$('#scBeam');bm.setAttribute('x1',xx);bm.setAttribute('y1',yy);
  sc.setAttribute('data-storm',o.storm?'1':'0');
  sc.setAttribute('data-meteor',o.meteor?'1':'0');
  sc.setAttribute('data-alert',o.alert?'1':'0');
  sc.setAttribute('data-dmg',o.dmg?'1':'0');
  sc.setAttribute('data-fail',o.fail?'1':'0');
  var bo=$('#scBoom');
  if(o.fail){bo.style.transform='translate('+xx+'px,'+yy+'px)';sc.setAttribute('data-boom','1')}else sc.setAttribute('data-boom','0');
  if(SH.S3&&SH.S3.ok){SH.S3.sync(sc);SH.S3.phase(i,o)}
}
function cine(title,ms){
  var sc=$('#a-scene');if(!SH.fx){$('#a-scTitle').textContent='';return}
  $('#a-scTitle').textContent=title;sc.classList.remove('cine');void sc.offsetWidth;sc.classList.add('cine');
  clearTimeout(cine.t);cine.t=setTimeout(function(){sc.classList.remove('cine')},ms||2800);
}
function warp(){if(!SH.fx)return;if(SH.S3&&SH.S3.ok)SH.S3.cut();var sc=$('#a-scene');sc.classList.remove('warp');void sc.offsetWidth;sc.classList.add('warp');setTimeout(function(){sc.classList.remove('warp')},1100)}

/* ---------- VOL ---------- */
var flTimers=[];
function later(fn,ms){if(!SH.fx){fn();return}var o={fn:fn};o.t=setTimeout(function(){flTimers=flTimers.filter(function(x){return x!==o});fn()},ms);flTimers.push(o)}
function clearFl(){flTimers.forEach(function(o){clearTimeout(o.t)});flTimers=[]}
function flushFl(){var p=flTimers;flTimers=[];p.forEach(function(o){clearTimeout(o.t);o.fn()})}
function stagesHtml(){
  var F=S.F,r=S.r;
  return PH.map(function(_,i){var st=F.okp[i]===true?'ok':F.okp[i]===false?'ko':i===F.i&&F.alive?'run':'';
    return '<li class="stage '+st+'"><span class="st">'+(st==='ok'?'RÉUSSI':st==='ko'?'ÉCHEC':st==='run'?'EN COURS':'À VENIR')+'</span><span class="sn">'+phName(r.d,i)+'</span></li>'}).join('');
}
function logAdd(t,txt,bad){var li=document.createElement('li');li.innerHTML='<span class="t">'+esc(t)+'</span><span'+(bad?' class="bad"':'')+'>'+esc(txt)+'</span>';var L=$('#a-log');L.insertBefore(li,L.firstChild)}
function startFlight(){
  var r=S.r;
  S.F=newFlight(r,DIFF[P.df],S.cons);
  if(CREWCH[r.d.key]){S.F.beats[1]={crew:true,slot:4};S.F.beats[3]={crew:true,slot:8}}
  S.fl={beatDone:{},hist:[],busy:false};
  clearFl();
  $('#a-log').innerHTML='';$('#a-card').innerHTML='';
  $('#a-scSvg').innerHTML=sceneBuild(r);syncFx();
  if(SH.S3&&SH.S3.ok){SH.S3.mount($('#a-scene'));SH.S3.scene('a:'+r.d.key,{land:r.d.type==='landing'})}
  sceneSet(0,{});
  $('#a-flEyebrow').textContent='Vol · '+r.d.name+' · '+DIFF[P.df].name;
  $('#a-count').textContent='';
  $('#a-stages').innerHTML=stagesHtml();
  $('#a-scCap').textContent='Sur la rampe de lancement';
  $('#a-nextBtn').textContent='Lancer : '+phName(r.d,0);$('#a-nextBtn').hidden=false;$('#a-skipBtn').hidden=false;
  $('#a-nextBtn').dataset.mode='phase';
  go('fly');
  say('Tous les systèmes sont prêts. À toi de jouer, chef de mission !','happy',3600);
  $('#a-card').innerHTML='<div class="callout"><span class="eyebrow">Briefing</span><span>Le vol compte 9 phases. Avant les phases 3, 5, 7 et 9, une décision vous attend : chaque choix laisse un effet durable.'+(CREWCH[r.d.key]?' Deux de ces décisions sont prises par l\'équipage : le jeu passe alors en mode Mission Cadet.':'')+'</span></div>';
}
function showCard(html){$('#a-card').innerHTML=html}
function effChips(effs){return '<ul class="fxl">'+effs.map(function(e){return '<li class="fxc '+(e.g>0?'gd':e.g<0?'bd':'')+'">'+esc(e.t)+'</li>'}).join('')+'</ul>'}
function showBeat(i){
  var F=S.F,b=F.beats[BEATSLOT.indexOf(i)];
  if(b.crew){if(!b.title)b=F.beats[BEATSLOT.indexOf(i)]=crewBeat(F,i);S.fl.cur=b;relayCrew(b,i);return}
  S.fl.cur=b;
  var hints=DIFF[P.df].hints;
  var html='<div class="beat '+(b.id&&['storm','cryo','ion','power','therm','nav','meteor','dose','comm','weather','sensor','burn','fail'].indexOf(b.id)>=0?'':'opp')+(b.scene==='alert'?' alert':'')+'"><span class="kind">'+(['storm','cryo','ion','power','therm','nav','meteor','dose','comm','weather','sensor','burn','fail'].indexOf(b.id)>=0?'Imprévu':'Décision')+' · avant '+phName(S.r.d,i)+'</span><h3>'+esc(b.title)+'</h3><p>'+esc(b.text)+'</p><div class="group" id="beatOpts">'+
   b.opts.map(function(o,k){var dis=o.cost&&F.res<o.cost,p=o.roll?rp(F,o.roll.p):null;
     return '<button class="opt" data-beat="'+k+'"'+(dis?' disabled':'')+'><span class="o-name">'+esc(o.t)+'</span><span class="o-desc">'+esc(o.d)+'</span>'+(o.roll&&hints?'<span class="o-meta">≈ '+Math.round(p*100)+' % de réussite</span>':o.roll?'<span class="o-meta">Résultat incertain</span>':'')+(dis?'<span class="o-warn">Réserve insuffisante</span>':'')+'</button>'}).join('')+
   '</div><span class="fine">Réserve de budget : '+fmt(F.res)+' M$</span></div>';
  showCard(html);
  var sev=['storm','cryo','ion','power','therm','nav','meteor','dose','comm','weather','sensor','burn','fail'].indexOf(b.id)>=0;
  sceneSet(i-1>=0?i-1:0,{alert:b.scene==='alert',storm:b.scene==='storm',meteor:b.scene==='meteor'});
  if(sev){say('Alerte ! '+b.title+'.','alert',3600);flash();shakeScreen()}else say(b.title+' : à toi de décider.','happy',3000);
  $('#a-nextBtn').hidden=true;
  logAdd('Décision',b.title);
}
function choose(k){
  var F=S.F,b=S.fl.cur,i=F.i;
  var out=chooseOpt(F,b,k);if(!out)return;
  S.fl.beatDone[i]=true;
  var o=b.opts[k];
  S.fl.hist.push({phase:phName(S.r.d,i),title:b.title,choice:o.t,res:out.txt,roll:out.roll,effs:out.effs});
  var good=out.roll?out.roll.ok:(o.q||0)>=0;
  var head=out.roll?(out.roll.ok?'<span class="res-ok">Réussi.</span> ':'<span class="res-ko">Raté.</span> '):'';
  showCard('<div class="beat'+(out.roll&&!out.roll.ok?' alert':' opp')+'"><span class="kind">Votre décision</span><h3>'+esc(o.t)+'</h3><p>'+head+esc(out.txt||'')+'</p>'+(out.effs.length?effChips(out.effs):'<p class="fine">Aucun effet durable.</p>')+'</div>');
  if(out.roll&&!out.roll.ok){say('Aïe, ça ne s\'est pas passé comme prévu.','hurt',3200);flash();shakeScreen()}
  else if(out.roll||(o.q||0)>0){say('Bon choix !','cheer',2600);flash('good')}
  else say('Compris, on avance.','happy',2200);
  logAdd('Effet',o.t+' — '+(out.effs.map(function(e){return e.t}).join(' ; ')||'aucun effet'),out.roll&&!out.roll.ok);
  $('#a-stages').innerHTML=stagesHtml();
  sceneSet(Math.max(0,i-1),{});
  $('#a-nextBtn').hidden=false;$('#a-nextBtn').textContent='Lancer : '+phName(S.r.d,i);$('#a-nextBtn').dataset.mode='phase';
  update2();
}
function update2(){/* jauges résumé du vol */
  var F=S.F,m=F.mods.map(function(x){return x.n+' ('+(x.t)+')'}).slice(0,3).join(' · ');
  $('#a-count').textContent='Δv '+fmt(Math.max(0,F.mar)*100,1)+' % · Réserve '+fmt(F.res)+' M$';
  $('#a-count').title=m;
}
function nextClick(){
  var F=S.F,fl=S.fl;if(!F||fl.busy)return;
  var mode=$('#a-nextBtn').dataset.mode;
  if(mode==='res'){finish();return}
  var i=F.i;
  if(BEATSLOT.indexOf(i)>=0&&!fl.beatDone[i]){showBeat(i);return}
  doPhase(i);
}
function doPhase(i){
  var F=S.F,fl=S.fl,r=S.r,d=r.d;
  fl.busy=true;$('#a-nextBtn').hidden=true;
  var recent=fl.hist.length?fl.hist[fl.hist.length-1]:null;
  var stormy=recent&&recent.phase&&false;
  sceneSet(i,{});
  // HUD cinématique : indications de phase en direct, sans modifier les calculs du simulateur.
  var cineScene=$('#a-scene');
  var flightHud=cineScene.querySelector('.ao-flight-hud');
  if(!flightHud){flightHud=document.createElement('div');flightHud.className='ao-flight-hud';flightHud.setAttribute('aria-live','polite');cineScene.appendChild(flightHud)}
  var phaseNames=['DÉCOLLAGE','SÉPARATION DES ÉTAGES','MISE EN ORBITE','CROISIÈRE','CORRECTION DE TRAJECTOIRE','APPROCHE FINALE','CONTACT / ATTERRISSAGE','OPÉRATIONS DE SURFACE','FIN DE MISSION'];
  var phaseName=phaseNames[i]||phName(d,i).toUpperCase();
  flightHud.innerHTML='<span class="ao-hud-live"><i></i> TÉLÉMÉTRIE ACTIVE</span><b>'+esc(phaseName)+'</b><span class="ao-hud-index">PHASE '+(i+1)+' / 9</span><span class="ao-hud-track"><i style="width:'+Math.round((i+1)/9*100)+'%"></i></span>';
  cineScene.setAttribute('data-flight-phase',String(i));
  cineScene.classList.remove('launch-sequence','approach-sequence','touchdown-sequence','return-burn-sequence');
  void cineScene.offsetWidth;
  if(i===0)cineScene.classList.add('launch-sequence');
  else if(i===5&&d.type==='landing')cineScene.classList.add('approach-sequence');
  else if(i===6&&d.type==='landing')cineScene.classList.add('touchdown-sequence');
  if(i===6&&d.type==='landing')say('Approche finale : surveille la vitesse verticale et le terrain.','alert',2600);
  setTimeout(function(){cineScene.classList.remove('launch-sequence','approach-sequence','touchdown-sequence','return-burn-sequence')},1900);
  warp();
  var day=phDay(r,i);
  var ttl=(i===0?'Décollage':phName(d,i))+' · J+'+(day<1?'0':Math.round(day));
  cine(ttl,2800);
  $('#a-scCap').textContent=ttl;
  $('#a-count').textContent='J+'+Math.round(day)+(day>200?' ('+dur(day)+')':'');
  $('#a-stages').innerHTML=stagesHtml();
  say(i===0?'Décollage !':'En route : '+phName(d,i)+'.','happy',2400);
  showCard('<div class="callout"><span class="eyebrow">Phase en cours</span><span>'+esc(phName(d,i))+'…</span></div>');
  later(function(){
    var rr=runPhase(F,i);
    sceneSet(i,rr.ok?{}:{fail:true,dmg:false});
    $('#a-stages').innerHTML=stagesHtml();
    var okTxt=i===6?d.arriveOk:i===7?d.ops1Ok:i===8?d.opsOk:['Le lanceur a fait son travail.','Le vaisseau déploie ses panneaux et son antenne.','Le voyage se déroule bien.','Le voyage se poursuit sans histoire.','La trajectoire est corrigée.','L\'approche est précise.'][i];
    var koTxt=['Le lanceur a échoué.','Le déploiement a échoué : panneaux ou antenne bloqués.','Une panne en croisière a mis fin à la mission.','Une panne en croisière a mis fin à la mission.','La correction de trajectoire a échoué.','L\'approche a échoué.','L\'arrivée a échoué.','Une panne a interrompu les opérations.','Une panne a interrompu la fin des opérations.'][i];
    logAdd(phName(d,i),(rr.ok?okTxt:koTxt)+' ('+Math.round(rr.p*100)+' % de chances)',!rr.ok);
    var delivered=F.delivered.filter(function(id){return SIDE[id].phase===i});
    var dtxt=delivered.map(function(id){return SIDE[id].r}).join(' · ');
    showCard('<div class="callout '+(rr.ok?'okc':'')+'"><span class="eyebrow">'+(rr.ok?'Phase réussie':'Phase manquée')+' · '+Math.round(rr.p*100)+' % de chances</span><span>'+esc(rr.ok?okTxt:koTxt)+(dtxt?' <b>Charge annexe : '+esc(dtxt)+'.</b>':'')+'</span></div>');
    if(rr.ok){
      if(dtxt){say(dtxt+' !','cheer',3000);flash('good')}else if(i===8||i===6){say('Magnifique !','cheer',3000);flash('good')}else say(null,'happy',1500);
      F.i=i+1;fl.busy=false;update2();
      if(i===8){$('#a-nextBtn').hidden=false;$('#a-nextBtn').textContent='Voir le bilan';$('#a-nextBtn').dataset.mode='res';confetti()}
      else{$('#a-nextBtn').hidden=false;$('#a-nextBtn').textContent='Phase suivante : '+phName(d,F.i);$('#a-nextBtn').dataset.mode='phase'}
    }else{
      say('Mission perdue…','hurt',4000);flash();shakeScreen();
      fl.busy=false;$('#a-nextBtn').hidden=false;$('#a-nextBtn').textContent='Voir le bilan';$('#a-nextBtn').dataset.mode='res';
    }
  },2300);
}
function finish(){
  var F=S.F,r=S.r,df=DIFF[P.df],sc=score(F),bo=bonuses(F,sc);
  F.d0budget=r.d.budget;
  var full=sc.full,nb=bo.filter(function(b){return b.ok}).length;
  var medal=!full?0:sc.total>=85?3:sc.total>=70?2:sc.total>=45?1:0;
  var cr=Math.round(sc.total/10*df.credit)+nb*2+(full?3:0);
  var rec=P.done[r.d.key]||{best:0,runs:0,medal:0};
  var newBest=sc.total>rec.best;
  rec.runs++;rec.best=Math.max(rec.best,sc.total);rec.medal=Math.max(rec.medal||0,medal);
  P.done[r.d.key]=rec;P.credits+=cr;saveP();
  var idx=ORDER.indexOf(r.d.key),unlock=full&&sc.total>=45&&idx<ORDER.length-1&&!(P.done[ORDER[idx+1]]);
  S.last={sc:sc,bo:bo,cr:cr,medal:medal,newBest:newBest,unlock:unlock};
  var vessel=null;
  if(full){
    var d=r.d.key;
    vessel={dest:d,isp:r.P.isp,name:r.d.name+' · '+r.L.name,summary:r.L.name+', '+r.P.name+', '+r.W.name+', '+r.TH.name+', '+r.AN.name+'. Score du vol : '+sc.total+' / 100.',supply:r.supply,pneed:r.pneed,mar:F.mar,shield:!!r.cfg.shield,hard:!!r.cfg.hard,red:!!r.cfg.red,tstate:r.tstate,sci:r.sci,dsci:r.d.sci,lm:r.lm,resPct:(r.d.budget-sc.spent)/r.d.budget,delivered:F.delivered.slice(),score:sc.total};
    P.vessel=P.vessel||{};P.vessel[d]=vessel;saveP();
  }
  S.vessel=vessel;
  SH.onFlightDone(r.d.key,sc.total,full,vessel);
  go('res');
  renderResult();
  endChain();
}
function renderResult(){
  var F=S.F,r=S.r,L=S.last,sc=L.sc,df=DIFF[P.df];
  $('#a-resEyebrow').textContent='Bilan du vol · '+r.d.name+' · '+df.name;
  var rating=!sc.full?'Mission perdue':sc.total>=85?'Mission exemplaire':sc.total>=70?'Mission réussie':sc.total>=45?'Mission acceptable':'Mission fragile';
  $('#a-rating').textContent=rating+(L.medal?'  '+'★'.repeat(L.medal):'');
  countUp($('#a-scoreBig'),sc.total);
  $('#a-resLead').textContent=sc.full?'Le vaisseau a mené sa mission jusqu\'au bout. La science rapportée atteint '+Math.round(sc.sciDel)+' pts pour une cible de '+r.d.sci+'.':'Le vol s\'est interrompu à la phase « '+phName(r.d,F.okp.indexOf(false))+' ». Les décisions de conception et de vol pèsent sur ce résultat.';
  var rows=[['Mission',sc.mission,30],['Science',sc.sci,30],['Budget',sc.bud,15],['Décisions',sc.dec,15],['Charges annexes',sc.side,10]];
  $('#a-brk').innerHTML=rows.map(function(x){return '<div class="brk-r"><span>'+x[0]+'</span><span>'+x[1]+' / '+x[2]+'</span><div class="m-bar"><i style="width:'+clamp(x[1]/x[2]*100,2,100)+'%"></i></div></div>'}).join('');
  $('#a-bonus').innerHTML=L.bo.map(function(b){return '<li class="'+(b.ok?'y':'n')+'">'+b.n+'</li>'}).join('');
  $('#a-rwd').textContent='+'+L.cr+' crédits';
  $('#a-rwdNote').textContent=(L.unlock?'Nouvelle mission débloquée : '+DEST[ORDER[ORDER.indexOf(r.d.key)+1]].name+'. ':'')+'Total : '+P.credits+' crédits à dépenser dans la recherche.';
  var good=[],bet=[];
  if(r.margin>=.08)good.push('Marge de Δv confortable de '+Math.round(r.margin*100)+' %.');else bet.push('Marge de Δv mince : une manœuvre ratée coûte cher.');
  if(r.cost<=r.d.budget*.9)good.push('Budget maîtrisé avec de la réserve.');else bet.push('Budget très serré, peu de marge pour les imprévus.');
  if(F.bad===0&&F.nb>0)good.push('Aucune décision mal tournée.');else if(F.bad>0)bet.push(F.bad+' décision'+(F.bad>1?'s':'')+' mal tournée'+(F.bad>1?'s':'')+'.');
  if(sc.sciDel>=r.d.sci)good.push('Cible scientifique atteinte.');else bet.push('Science sous la cible : ajoutez des instruments adaptés ou protégez les opérations.');
  if(r.rad>.1)bet.push('Radiations élevées : un blindage ou une électronique durcie aiderait.');
  if(r.tstate!=='full')bet.push('Contrôle thermique limite : pensez au système adapté.');
  if(r.lm<.15)bet.push('Liaison radio juste : une antenne plus grande évite les engorgements.');
  if(F.delivered.length)good.push('Charges annexes livrées : '+F.delivered.map(function(k){return SIDE[k].name}).join(', ')+'.');
  if(!good.length)good.push('Vous avez tenu jusqu\'au bout de la conception.');
  if(!bet.length)bet.push('Essayez le niveau Expert ou la mission suivante.');
  $('#a-good').innerHTML=good.map(function(t){return '<li>'+t+'</li>'}).join('');
  $('#a-better').innerHTML=bet.map(function(t){return '<li>'+t+'</li>'}).join('');
  $('#a-hist').innerHTML=S.fl.hist.length?S.fl.hist.map(function(h){return '<li><b>'+esc(h.title)+'</b> — '+esc(h.choice)+(h.roll?(h.roll.ok?' (réussi)':' (raté)'):'')+'<br>'+h.effs.map(function(e){return esc(e.t)}).join(' · ')+'</li>'}).join(''):'<li>Aucune décision prise.</li>';
  var rec=P.done[r.d.key];
  $('#a-best').textContent=(L.newBest?'Nouveau record : ':'Meilleur score : ')+rec.best+' / 100 · '+rec.runs+' essai'+(rec.runs>1?'s':'');
  if(sc.full&&L.medal){say('Mission accomplie !','cheer',4200);confetti();flash('good')}else if(!sc.full)say('On apprend de chaque échec.','hurt',4200);else say('Bien joué, on peut mieux faire.','happy',3600);
}
function summary(){
  var r=S.r,L=S.last;if(!L)return '';
  return 'Atelier Orbital — '+r.d.name+' ('+DIFF[P.df].name+')\nScore : '+L.sc.total+'/100'+(L.sc.full?'':' (mission perdue)')+'\nLanceur : '+r.L.name+' · Propulsion : '+r.P.name+'\nÉnergie : '+r.W.name+' · Thermique : '+r.TH.name+' · Antenne : '+r.AN.name+'\nBudget : '+fmt(L.sc.spent)+' / '+fmt(r.d.budget)+' M$ · Science : '+Math.round(L.sc.sciDel)+' / '+r.d.sci+' pts\nDécisions : '+S.F.good+' bonnes, '+S.F.bad+' mauvaises';
}
function copyText(t,msg){
  var done=function(){$('#a-copyMsg').textContent=msg||'Résumé copié.'};
  try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,fb);return}}catch(e){}
  fb();
  function fb(){var ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done()}catch(e){$('#a-copyMsg').textContent='Copie impossible : sélectionnez le texte manuellement.'}ta.remove()}
}

/* ---------- événements ---------- */
$('#aoRoot').addEventListener('click',function(e){
  var t=e.target.closest?e.target.closest('[data-shell],[data-go],.opt[data-grp],[data-beat],[data-iopt],[data-iback]'):null;if(!t)return;
  if(t.dataset.iopt!==undefined){iSelect(+t.dataset.iopt);return}
  if(t.dataset.iback){var sp=IA;IA=null;$('#a-s-inter').hidden=true;if(sp&&sp.done)sp.done();return}
  if(t.dataset.shell){SH.hub();return}
  if(t.dataset.go){go(t.dataset.go);return}
  if(t.dataset.beat!==undefined){choose(+t.dataset.beat);return}
  var g=t.dataset.grp,id=t.dataset.id,c=S.cfg,d=DEST[c.dest];
  if(t.disabled)return;
  if(g==='launcher')c.launcher=id;
  else if(g==='prop'){c.prop=id}
  else if(g==='power')c.power=id;
  else if(g==='therm')c.therm=id;
  else if(g==='ant')c.ant=id;
  else if(g==='win')c.win=id;
  else if(g==='traj')c.traj=id;
  else if(g==='prot'){c[id]=!c[id]}
  else if(g==='inst'){if(c.inst.has(id))c.inst.delete(id);else c.inst.add(id)}
  else if(g==='side'){var ix=c.sides.indexOf(id);if(ix>=0)c.sides.splice(ix,1);else if(c.sides.length<1+P.up.bay)c.sides.push(id)}
  if(S.screen==='lab')renderLab();
  var was=S.r?S.r.nogo.length:0;
  update();
  var n=S.r.nogo.length;
  if(n===0&&was>0){say('Les neuf voyants sont au vert !','cheer',3000);flash('good')}
  else if(n>was){say('Attention : '+S.r.nogo[0].name+' passe au rouge.','alert',3200)}
  else if(g==='side'||g==='inst')say('Bien vu, ça rapporte des points de science.','happy',2200);
});
$('#a-fuel').addEventListener('input',function(){S.cfg.fuelAuto=false;S.cfg.fuel=+this.value;update()});
$('#a-autoFuel').addEventListener('click',function(){S.cfg.fuelAuto=true;update()});
$('#a-launchBtn').addEventListener('click',function(){var r=S.r;if(r.nogo.length)return;SH.launch(startFlight,{name:DEST[S.cfg.dest].name+' · '+DIFF[P.df].name,words:['3','2','1','Décollage !']})});
$('#a-nextBtn').addEventListener('click',nextClick);
$('#a-iGo').addEventListener('click',iGo);
$('#a-skipBtn').addEventListener('click',function(){flushFl();$('#a-scene').classList.remove('cine','warp')});
$('#a-againBtn').addEventListener('click',function(){S.cons=pickCons(DIFF[P.df]);go('lab')});
$('#a-copyBtn').addEventListener('click',function(){copyText(summary())});

function syncFx(){var sv=$('#a-scSvg');try{if(sv&&sv.pauseAnimations){SH.fx?sv.unpauseAnimations():sv.pauseAnimations()}}catch(e){}}
function endChain(){
  var box=$('#a-endChain'),k=S.cfg.dest,nx=SH.nextAfterFlight(k,S.vessel);
  box.hidden=false;
  box.innerHTML='<div class="sec-h"><h3>Suite du programme</h3></div>'+(nx?'<p>'+nx.text+'</p><div class="row">'+nx.btn+'</div>':'<p class="fine">Retournez au programme pour choisir la prochaine mission.</p>');
}
return {interlude:interlude,dur:dur,start:start,demo:demo,chapters:chapters,UPG:UPG,upStore:function(){return P.up},unlocked:unlocked,ORDER:ORDER,DEST:DEST,syncFx:syncFx,glyph:glyph};
})();
var MC=(function(){var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var fmt=function(n,d){d=d||0;return Number(n).toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d})};
var clamp=function(v,a,b){return Math.min(b,Math.max(a,v))};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
function tagHtml(t){return '<span class="tagc">'+esc(t)+'</span>'}
var HPT=16;
var say=SH.say,flash=SH.flash,confetti=SH.confetti,countUp=SH.countUp;
function shakeScreen(){var el=$('#c-s-play');el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake')}
function critical(G,s){
  var m=G.m;
  if(s.bat<30)return 'Batterie basse ! Passe en mode Éco.';
  if(s.health<50)return 'La santé baisse. Plus d\'exercice !';
  if(s.moral<35)return 'Le moral est au plus bas…';
  if(s.integ<45)return 'Le vaisseau souffre. Maintenance !';
  if(s.dose/m.doseLimit>.85)return 'Radiations proches de la limite !';
  if(s.parts<=0)return 'Plus de pièces de rechange…';
  return null;
}
var MODES={
  eco:{id:'eco',name:'Éco',d:7,sci:.5,o:.2,w:.7,desc:'Économise l\'énergie. Le recyclage de l\'air et de l\'eau ralentit, la science aussi.'},
  std:{id:'std',name:'Standard',d:10,sci:1,o:.42,w:.9,desc:'Tout fonctionne normalement.'},
  sci:{id:'sci',name:'Science',d:15,sci:1.5,o:.42,w:.9,desc:'Les instruments tournent à fond. La demande dépasse souvent la production.'}
};
var DIFF={
  easy:{id:'easy',name:'Découverte',desc:'Réserves généreuses, peu d\'incidents, pardon pour les erreurs. Idéal pour apprendre.',stock:1.2,events:2,storms:1,sev:.7,wear:.8,credit:.8,sci:.85,doseAbort:false,hints:true},
  normal:{id:'normal',name:'Normal',desc:'Les règles du jeu telles quelles. Chaque mission demande des choix.',stock:1,events:4,storms:1,sev:1,wear:1,credit:1,sci:1,doseAbort:true,hints:true},
  hard:{id:'hard',name:'Expert',desc:'Réserves serrées, incidents plus fréquents et plus graves, deux éruptions solaires.',stock:.92,events:6,storms:2,sev:1.35,wear:1.25,credit:1.4,sci:1.1,doseAbort:true,hints:false}
};
var CREW=[
  {id:'eng',n:'Awa Traoré',r:'Ingénieure',d:'Maintenance 30 % plus efficace.'},
  {id:'med',n:'Koffi N\'Guessan',r:'Médecin',d:'+2 santé par tour. Radiations 25 % moins nocives. Soigne mieux.'},
  {id:'sci',n:'Léa Martin',r:'Scientifique',d:'Science +20 %.'},
  {id:'pil',n:'Samir Haddad',r:'Pilote',d:'+10 % de réussite aux manœuvres, 10 % d\'ergols en moins.'},
  {id:'bio',n:'Nina Petrova',r:'Biologiste',d:'Missions annexes 40 % plus rapides, nourriture −8 %.'},
  {id:'geo',n:'Yan Wei',r:'Géologue',d:'Science +30 % sur les missions de surface et d\'astéroïde.'}
];
var LOAD=[
  {id:'o2',n:'Bouteilles d\'oxygène',slots:1,max:3,d:'+8 % d\'oxygène par emplacement.'},
  {id:'water',n:'Réservoirs d\'eau',slots:1,max:3,d:'+8 % d\'eau par emplacement.'},
  {id:'food',n:'Rations',slots:1,max:3,d:'+8 % de nourriture par emplacement.'},
  {id:'parts',n:'Pièces de rechange',slots:1,max:4,d:'+2 pièces par emplacement.'},
  {id:'fuel',n:'Ergols supplémentaires',slots:1,max:3,d:'+10 % d\'ergols par emplacement.'},
  {id:'kit',n:'Instruments de précision',slots:2,max:2,d:'+10 % de science. Prend 2 emplacements.'},
  {id:'med',n:'Trousse médicale',slots:1,max:2,d:'+1 santé par tour par emplacement.'}
];
var LD_REC={o2:1,water:1,food:1,parts:2,fuel:1,kit:0,med:0};
var SIDE={
  farm:{id:'farm',n:'Serre expérimentale',d:'Faire pousser des plantes. Consomme un peu d\'eau.',target:16,kw:1,pts:6,r:'+10 % de nourriture, moral +8',fx:{foodPct:10,moral:8}},
  map:{id:'map',n:'Cartographie détaillée',d:'Photographier toute la zone. Demande 2 kW.',target:20,kw:2,pts:7,r:'+14 pts de science',fx:{sci:14}},
  school:{id:'school',n:'Cours en direct pour des écoles',d:'Un appel vidéo avec des élèves de la Terre.',target:10,kw:1,pts:5,r:'Moral +15',fx:{moral:15}},
  sample:{id:'sample',n:'Collecte d\'échantillons',d:'Remplir des conteneurs de roches. Surface et astéroïde uniquement.',target:18,kw:1,pts:8,r:'+16 pts de science',fx:{sci:16},surf:true},
  eva:{id:'eva',n:'Inspection extérieure',d:'Sorties pour inspecter la coque. Radiations et fatigue en plus.',target:14,kw:.5,pts:7,r:'Vaisseau +15 %, +1 pièce',fx:{integ:15,parts:1}}
};
var UP=[
  {id:'solar',n:'Panneaux améliorés',d:'+1 kW de production par niveau.',cost:[6,8,10]},
  {id:'recy',n:'Recycleur air et eau',d:'+4 % de récupération par niveau.',cost:[6,8,10]},
  {id:'shield',n:'Blindage renforcé',d:'−12 % de radiations par niveau.',cost:[5,7,9]},
  {id:'gym',n:'Salle de sport',d:'Besoin d\'exercice réduit d\'un quart d\'heure par niveau.',cost:[6,8]},
  {id:'repair',n:'Atelier de réparation',d:'+1 pièce au départ et maintenance 8 % plus efficace par niveau.',cost:[5,7,9]},
  {id:'store',n:'Soutes agrandies',d:'+1 emplacement de chargement par niveau.',cost:[7,9,11]}
];
var ORDER=['lune','sol','mars','base','ast'];
var MISSIONS={
  lune:{key:'lune',name:'Orbite lunaire',sub:'Dix jours autour de la Lune',level:'Initiation',surface:false,turns:10,dpt:1,unit:'Jour',unitL:'jour',
    story:'Votre premier vol habité. Le vaisseau tourne autour de la Lune pendant dix jours. Pas d\'atterrissage, mais déjà des pannes et le Soleil à surveiller.',
    notes:['Production solaire : 14 kW','Des débris peuvent croiser l\'orbite','Réponse du sol : 1,3 s'],
    val:'Valider le jour',valLast:'Valider le dernier jour',nextL:'Passer au jour suivant',
    solar:14,rate:.5,doseLimit:15,storm:9,sciRate:1.4,sciTarget:112,stock:{o2:26,water:24,food:28,fuel:100},parts:2,fuelBase:6,stormAt:[4,7],fixed:{},
    pool:['supply','scrubber','leak','opp','morale','debris','medical','software'],
    supply:{name:'Éclipse',text:'Le vaisseau passe derrière la Lune. Les panneaux solaires ne reçoivent presque plus de lumière.',mul:.55},
    opp:{title:'Cratère dans l\'ombre',text:'Un cratère jamais éclairé passe sous l\'orbite. Des instruments bien réglés pourraient y repérer de la glace d\'eau.'}},
  sol:{key:'sol',name:'Séjour sur la Lune',sub:'Douze jours à la surface',level:'Intermédiaire',surface:true,turns:12,dpt:1,unit:'Jour',unitL:'jour',
    story:'Atterrissage au pôle Sud lunaire, puis douze jours de travail au sol. La nuit tombe au huitième jour et la poussière use tout.',
    notes:['Atterrissage au jour 1, décollage au jour 12','Nuit lunaire du jour 8 au jour 11 : production solaire divisée par 4','La poussière lunaire use le matériel et fatigue l\'équipage'],
    val:'Valider le jour',valLast:'Valider le dernier jour',nextL:'Passer au jour suivant',
    solar:14,solarMul:{8:.25,9:.25,10:.25,11:.25},rate:.6,doseLimit:18,storm:9,sciRate:1.8,sciTarget:155,stock:{o2:30,water:27,food:33,fuel:200},parts:2,fuelBase:10,stormAt:[3,7],fixed:{1:'landing',last:'liftoff'},
    pool:['supply','scrubber','leak','opp','morale','medical','software','eva','dust'],
    supply:{name:'Panneau endommagé',text:'Un panneau solaire s\'est plié sous la contrainte thermique. La production chute.',mul:.65},
    opp:{title:'Roche inhabituelle',text:'Un rocher aux couleurs étranges se trouve à 200 mètres. Il pourrait venir des profondeurs de la Lune.'},
    land:{title:'Atterrissage',body:'Le module descend vers la plaine rocheuse du pôle Sud. Il faut choisir le mode d\'approche.'},
    lift:{title:'Décollage',body:'Les prélèvements sont chargés. Le module doit quitter la surface et rejoindre l\'orbite.'}},
  mars:{key:'mars',name:'Voyage vers Mars',sub:'Douze phases de vingt jours',level:'Intermédiaire',surface:false,turns:12,dpt:20,unit:'Phase',unitL:'phase',
    story:'Huit mois de voyage entre la Terre et Mars. Chaque phase dure vingt jours et chaque décision pèse deux fois plus lourd. Le sol répond avec plusieurs minutes de retard.',
    notes:['Insertion en orbite à la dernière phase','Radiations : 1,8 mSv par jour','Réponse du sol : 3 à 22 minutes'],
    val:'Valider la phase',valLast:'Valider la dernière phase',nextL:'Passer à la phase suivante',
    solar:12,rate:1.8,doseLimit:600,storm:70,sciRate:1.2,sciTarget:100,stock:{o2:540,water:400,food:620,fuel:250},parts:2,fuelBase:15,stormAt:[5,9],fixed:{last:'orbit'},
    pool:['supply','scrubber','leak','opp','morale','comms','debris','medical','software'],
    supply:{name:'Panneaux mal orientés',text:'Une manœuvre d\'antenne détourne les panneaux du Soleil pendant plusieurs jours.',mul:.6},
    opp:{title:'Alignement favorable',text:'Le vaisseau passe à portée d\'observation d\'une tempête de poussière martienne : une occasion rare d\'étudier l\'atmosphère.'},
    orb:{title:'Insertion en orbite martienne',body:'Mars est là. Il faut freiner au bon moment pour être capturé par sa gravité.'}},
  base:{key:'base',name:'Base martienne',sub:'Dix périodes de cinq jours sur Mars',level:'Avancée',surface:true,turns:10,dpt:5,unit:'Période',unitL:'période',
    story:'Cinquante jours sur Mars. Le Soleil est faible, les tempêtes de poussière imprévisibles et la maison est à des mois de voyage.',
    notes:['Atterrissage à la période 1, décollage à la période 10','Production solaire faible : 9 kW','Radiations au sol : environ 0,67 mSv par jour'],
    val:'Valider la période',valLast:'Valider la dernière période',nextL:'Passer à la période suivante',
    solar:9,rate:.67,doseLimit:60,storm:28,sciRate:1.7,sciTarget:145,stock:{o2:118,water:84,food:135,fuel:260},parts:2,fuelBase:14,stormAt:[3,8],fixed:{1:'landing',last:'liftoff'},
    pool:['supply','scrubber','leak','opp','morale','comms','medical','software','eva','dust'],
    supply:{name:'Tempête de poussière',text:'Le ciel devient orange et les panneaux ne reçoivent presque plus de lumière.',mul:.35},
    opp:{title:'Gisement de glace',text:'Le radar signale de la glace d\'eau à faible profondeur, à deux kilomètres de la base.'},
    land:{title:'Atterrissage sur Mars',body:'L\'atmosphère martienne est trop fine pour freiner seule. Le moteur doit finir le travail.'},
    lift:{title:'Décollage de Mars',body:'Il faut quitter la surface avec les échantillons et rejoindre le vaisseau en orbite.'}},
  ast:{key:'ast',name:'Astéroïde',sub:'Quatorze phases de dix jours',level:'Très avancée',surface:true,turns:14,dpt:10,unit:'Phase',unitL:'phase',
    story:'Rendez-vous avec un astéroïde proche de la Terre. Le Soleil est faible, la gravité presque nulle et il faut s\'amarrer sans rebondir.',
    notes:['Ancrage à la phase 3, retour à la phase 14','Lumière réduite : 9 kW seulement','Réponse du sol : plusieurs minutes'],
    val:'Valider la phase',valLast:'Valider la dernière phase',nextL:'Passer à la phase suivante',
    solar:9,rate:1.6,doseLimit:300,storm:35,sciRate:1.5,sciTarget:145,stock:{o2:320,water:230,food:380,fuel:300},parts:2,fuelBase:11,stormAt:[4,10],fixed:{3:'landing',last:'liftoff'},
    pool:['supply','scrubber','leak','opp','morale','comms','debris','medical','software','eva'],
    supply:{name:'Orientation défavorable',text:'Pour rester amarré, le vaisseau tourne ses panneaux loin du Soleil.',mul:.6},
    opp:{title:'Roche rare',text:'L\'astéroïde présente une zone très sombre, peut-être riche en carbone : c\'est exactement ce qu\'on est venu chercher.'},
    land:{title:'Ancrage sur l\'astéroïde',body:'La gravité est si faible qu\'un contact trop vif vous renvoie dans l\'espace. Il faut s\'amarrer en douceur.'},
    lift:{title:'Départ de l\'astéroïde',body:'Les échantillons sont dans les soutes. Il faut se détacher et lancer le retour vers la Terre.'}}
};
var FIXED_COST={landing:12,liftoff:15,orbit:14};

function crewK(ids){
  var K={maint:1,healthPlus:0,doseHealth:1,sci:1,rollBonus:0,fuelMul:1,sideMul:1,foodMul:1,surfSci:1,med:false};
  ids.forEach(function(id){
    if(id==='eng')K.maint*=1.3;
    if(id==='med'){K.healthPlus+=2;K.doseHealth*=.75;K.med=true}
    if(id==='sci')K.sci*=1.2;
    if(id==='pil'){K.rollBonus+=.1;K.fuelMul*=.9}
    if(id==='bio'){K.sideMul*=1.4;K.foodMul*=.92}
    if(id==='geo')K.surfSci*=1.3;
  });
  return K;
}
function vesselMods(v){
  var o={solar:0,fuel:1,parts:0,dose:1,wear:1,sci:1,roll:0,list:[]};
  if(!v)return o;
  var kw=clamp(Math.round((v.supply-v.pneed)/450),-2,3);
  if(kw){o.solar=kw;o.list.push('Énergie : '+(kw>0?'+':'−')+Math.abs(kw)+' kW de production')}
  var fm=clamp(v.mar,-.05,.3);
  if(Math.abs(fm)>=.01){o.fuel=1+fm;o.list.push('Ergols : '+(fm>0?'+':'−')+Math.round(Math.abs(fm)*100)+' % de réserve (marge de Δv du lanceur)')}
  if(v.shield){o.dose*=.8;o.list.push('Blindage : radiations −20 %')}
  if(v.hard){o.wear*=.95;o.list.push('Électronique durcie : usure −5 %')}
  if(v.red){o.parts+=1;o.list.push('Redondance : +1 pièce de rechange')}
  if(v.tstate==='full'){o.wear*=.92;o.list.push('Thermique adapté : usure −8 %')}
  else if(v.tstate==='none'){o.wear*=1.1;o.list.push('Thermique inadapté : usure +10 %')}
  var ratio=v.dsci>0?v.sci/v.dsci:1,sm=clamp(ratio-1,-.2,.35)*.5;
  if(Math.abs(sm)>=.02){o.sci=1+sm;o.list.push('Instruments : science × '+(1+sm).toFixed(2).replace('.',','))}
  if(v.lm>.5){o.roll+=.04;o.list.push('Liaison solide : manœuvres +4 %')}
  if(v.resPct>=.1){o.parts+=1;o.list.push('Réserve de budget : +1 pièce de rechange')}
  (v.delivered||[]).forEach(function(id){
    if(id==='relay'){o.roll+=.03;o.list.push('Relais de communication : manœuvres +3 %')}
    if(id==='tech'){o.wear*=.97;o.list.push('Démonstrateur validé : usure −3 %')}
    if(id==='cubesat'||id==='edu'||id==='cap')o.list.push('Charge annexe livrée : '+id)
  });
  return o;
}
function makeGame(key,dk,crew,ld,sides,up,vessel){
  var m=MISSIONS[key],df=DIFF[dk],K=crewK(crew),r1=function(x){return Math.round(x*10)/10},V=vesselMods(vessel);
  K.rollBonus+=V.roll;
  return {m:m,df:df,K:K,ld:ld,sides:sides,up:up,crew:crew,v:V,vessel:vessel||null,
    stock:{o2:r1(m.stock.o2*df.stock*(1+.08*ld.o2)),water:r1(m.stock.water*df.stock*(1+.08*ld.water)),food:r1(m.stock.food*df.stock*(1+.08*ld.food)),fuel:r1(m.stock.fuel*df.stock*(1+.1*ld.fuel)*V.fuel)},
    partsMax:m.parts+up.repair+2*ld.parts+V.parts,solar:m.solar+up.solar+V.solar,kit:(1+.1*ld.kit)*V.sci,target:Math.round(m.sciTarget*df.sci)};
}
function startState(G){
  return {t:1,o2:G.stock.o2,water:G.stock.water,food:G.stock.food,fuel:G.stock.fuel,parts:G.partsMax,bat:100,integ:100,health:100,moral:85,dose:0,sci:0,dust:0,black:false,sideP:{},sideDone:{},mods:[],flags:{},lastMode:null};
}
var MODS={
  calib:{n:'Instruments calibrés',good:1,t:3,fx:{sciMul:1.12},d:'science +12 %'},
  safeOrbit:{n:'Trajectoire dégagée',good:1,t:4,fx:{roll:.1},d:'manœuvres +10 %'},
  crewBond:{n:'Équipe soudée',good:1,t:3,fx:{moral:2,sciMul:1.05},d:'moral +2, science +5 %'},
  fit:{n:'Forme olympique',good:1,t:2,fx:{health:2},d:'santé +2 par tour'},
  reliable:{n:'Vaisseau bien entretenu',good:1,t:2,fx:{roll:.1},d:'réparations +10 %'},
  solarFix:{n:'Panneaux optimisés',good:1,t:5,fx:{solarMul:1.2},d:'production +20 %'},
  nightBat:{n:'Batteries d\'appoint',good:1,t:5,fx:{bat:5},d:'batterie +5 par tour'},
  warm:{n:'Instruments chauffés',good:1,t:4,fx:{integ:2},d:'vaisseau +2 par tour'},
  shieldW:{n:'Abri d\'eau',good:1,t:6,fx:{doseMul:.75},d:'radiations −25 %'},
  trained:{n:'Équipage entraîné',good:1,t:4,fx:{roll:.1},d:'manœuvres +10 %'},
  sealed:{n:'Joints neufs',good:1,t:3,fx:{dust:-6},d:'poussière −6 par tour'},
  prod:{n:'Production d\'oxygène',good:1,t:4,fx:{o2Pct:-2},d:'moins d\'oxygène consommé'},
  leak:{n:'Fuite lente',good:0,t:3,fx:{o2Pct:3},d:'oxygène −3 % par tour'},
  hot:{n:'Instruments en surchauffe',good:0,t:1,fx:{sciMul:.85,integ:-3},d:'science −15 %, vaisseau −3'},
  tired:{n:'Équipe fatiguée',good:0,t:1,fx:{moral:-2,roll:-.08},d:'moral −2, manœuvres −8 %'},
  sick:{n:'Équipier affaibli',good:0,t:3,fx:{health:-3,sciMul:.92},d:'santé −3 par tour'},
  jam:{n:'Liaison dégradée',good:0,t:2,fx:{sciMul:.9},d:'science −10 %'},
  fuelLeak:{n:'Fuite d\'ergols',good:0,t:3,fx:{fuelPct:1.5},d:'ergols −1,5 % par tour'},
  survival:{n:'Mode survie',good:0,t:3,fx:{moral:-2,bat:3},d:'moral −2, batterie +3'},
  dusty:{n:'Poussière dans les joints',good:0,t:3,fx:{dust:6},d:'poussière +6 par tour'},
  dim:{n:'Soleil faible au pôle',good:0,t:6,fx:{solarMul:.9},d:'production −10 %'}
};
var FLAGL={low:'Orbite basse',high:'Orbite haute',polar:'Orbite polaire',plain:'Plaine proche',crater:'Cratère visité',ice:'Glace repérée',drift:'Trajectoire dérivée',precise:'Trajectoire corrigée',sunny:'Camp en plaine',canyon:'Camp dans le canyon',polarcamp:'Camp polaire',heavy:'Charge lourde',dark:'Pôle sombre',flat:'Zone plate',cave:'Cavité explorée',ellip:'Orbite elliptique'};
function pr(p){return function(){return p}}
function mergeFx(a,fx,sev){
  if(!fx)return;
  for(var k in fx){
    var v=fx[k];
    if(k==='roll')continue;
    if(k==='sciMul'){a.sciMul*=v;continue}
    if(k==='solarMul'){a.supplyMul*=v;continue}
    if(k==='doseMul'){a.doseMul*=v;continue}
    if(k==='force'){a.force=v;continue}
    if((k==='integ'||k==='health'||k==='moral')&&v<0)v*=sev;
    if((k==='o2Pct'||k==='dust')&&v>0)v*=sev;
    a[k]=(a[k]||0)+v;
  }
}
function rollP(o,st,plan,G){
  var p=o.roll.p(st,plan,G);
  if(o.roll.skill)p+=G.K.rollBonus;
  (st.mods||[]).forEach(function(x){p+=MODS[x.id].fx.roll||0});
  return clamp(p,.05,.97);
}
function fuelCost(G,o){return o&&o.fuelPct?Math.round(o.fuelPct/100*G.stock.fuel*G.K.fuelMul*10)/10:0}
function sgn(v){return v>=0?'+':'−'}
function turnCalc(G,st,plan,picks){
  var m=G.m,K=G.K,df=G.df,up=G.up,h=plan.h,sev=df.sev;
  var a={sciMul:1,sciFlat:0,sciLost:0,o2Pct:0,fuelPct:0,integ:0,health:0,moral:0,bat:0,stormF:0,parts:0,dust:0,force:null,supplyMul:1,doseMul:1,waterAdd:0,o2Add:0,foodAdd:0};
  var flags={},k2,newMods={},eff=[];
  for(k2 in st.flags)flags[k2]=st.flags[k2];
  picks.forEach(function(p){
    var e=p.e,o=p.o;
    if(e&&e.supplyMul)a.supplyMul*=e.supplyMul;
    if(!o)return;
    mergeFx(a,o.fx,sev);
    if(o.fuelPct)a.fuelPct+=o.fuelPct*K.fuelMul;
    if(o.mod)newMods[o.mod]=1;
    if(o.flag)flags[o.flag]=true;
    if(o.unflag)delete flags[o.unflag];
    if(p.roll&&o.roll){
      mergeFx(a,p.roll.ok?o.roll.ok:o.roll.ko,sev);
      var mm=p.roll.ok?o.roll.okMod:o.roll.koMod,ff=p.roll.ok?o.roll.okFlag:o.roll.koFlag;
      if(mm)newMods[mm]=1;if(ff)flags[ff]=true;
    }
  });
  var active=[];
  (st.mods||[]).forEach(function(x){active.push(x.id)});
  for(k2 in newMods)if(active.indexOf(k2)<0)active.push(k2);
  active.forEach(function(id){mergeFx(a,MODS[id].fx,sev)});
  var mode=MODES[a.force||plan.mode];
  var sp={},sd={};
  for(k2 in st.sideP)sp[k2]=st.sideP[k2];
  for(k2 in st.sideDone)sd[k2]=st.sideDone[k2];
  var hh=G.sides.length?(h.annex||0):0,sideKw=0,evaH=0,farmH=0,newly=[];
  var rew={sci:0,moral:0,foodPct:0,integ:0,parts:0};
  G.sides.forEach(function(id){
    if(sd[id]||hh<=0)return;
    var s=SIDE[id],need=s.target-(sp[id]||0),use=Math.min(hh,need/K.sideMul);
    sp[id]=(sp[id]||0)+use*K.sideMul;hh-=use;sideKw=Math.max(sideKw,s.kw);
    if(id==='eva')evaH+=use;
    if(id==='farm')farmH+=use;
    if(sp[id]>=s.target-1e-9){sd[id]=true;newly.push(id);for(var q in s.fx)rew[q]=(rew[q]||0)+s.fx[q]}
  });
  var S=G.solar*((m.solarMul&&m.solarMul[st.t])||1)*a.supplyMul;
  var D=mode.d+sideKw;
  var rawBat=st.bat+(S-D)*2.8+a.bat,bat=clamp(rawBat,0,100),black=rawBat<=0;
  var recO=black?0:Math.min(.95,mode.o+.04*up.recy),recW=black?.3:Math.min(.97,mode.w+.04*up.recy);
  var o2Use=m.dpt*3.4*(1-recO)+a.o2Pct/100*G.stock.o2;
  var wUse=m.dpt*14*(1-recW)+farmH*.004*G.stock.water;
  var fUse=m.dpt*2.4*K.foodMul;
  var fuelUse=m.fuelBase+a.fuelPct/100*G.stock.fuel;
  var o2=clamp(st.o2-o2Use+a.o2Add,0,G.stock.o2*1.15),water=clamp(st.water-wUse+a.waterAdd,0,G.stock.water*1.2);
  var food=clamp(st.food-fUse+a.foodAdd+rew.foodPct/100*G.stock.food,0,G.stock.food*1.2);
  var fuel=Math.max(0,st.fuel-fuelUse),parts=clamp(st.parts+a.parts+rew.parts,0,G.partsMax+3);
  var shield=(1-.12*up.shield)*G.v.dose;
  var doseAdd=(m.rate*m.dpt+m.storm*a.stormF+evaH*m.doseLimit*.01)*shield*a.doseMul;
  var dust=m.surface?clamp(st.dust+10*df.wear*G.v.wear+a.dust-3*h.maint,0,100):0;
  var dustLoss=m.surface?dust*.05:0,dustHealth=m.surface?dust*.03:0;
  var doseHealth=doseAdd/m.doseLimit*40*K.doseHealth;
  var exNeed=2-.25*up.gym;
  var healthD=(Math.min(h.ex,4)-exNeed)*3.5-3-Math.max(0,h.sci-8)*2-(st.moral<25?4:0)-doseHealth-dustHealth+a.health+K.healthPlus+G.ld.med-evaH*.3-(o2<=0?30:0)-(water<=0?10:0);
  var moralD=-4.5+(h.rest-2)*1.5-Math.max(0,h.sci-7)*2+a.moral+rew.moral-(black?6:0);
  var sciH=Math.max(0,h.sci-a.sciLost);
  var moraleF=.6+.4*st.moral/100,integF=st.integ>=50?1:.6;
  var skill=(m.surface||m.key==='ast')?K.sci*K.surfSci:K.sci;
  var sciGain=sciH*m.sciRate*mode.sci*moraleF*integF*a.sciMul*skill*G.kit+a.sciFlat*G.target+rew.sci;
  var integ=clamp(st.integ-7*df.wear*G.v.wear*Math.min(1.5,1+.025*m.dpt)-dustLoss+1.8*h.maint*K.maint*(1+.08*up.repair)+a.integ-(black?5:0)+rew.integ,0,100);
  // effets durables pour les tours suivants
  var nm=[];
  (st.mods||[]).forEach(function(x){if(x.t-1>0&&!newMods[x.id])nm.push({id:x.id,t:x.t-1})});
  for(k2 in newMods)if(MODS[k2].t-1>0)nm.push({id:k2,t:MODS[k2].t-1});
  var auto=[];
  if(h.maint>=4)auto.push('reliable');
  if(mode.id==='sci'&&st.lastMode==='sci')auto.push('hot');
  if(h.rest>=6)auto.push('crewBond');
  if(h.ex>=3)auto.push('fit');
  if(h.sci>=9)auto.push('tired');
  var autoNew=[];
  auto.forEach(function(id){
    var f=nm.filter(function(x){return x.id===id})[0];
    if(f)f.t=Math.max(f.t,MODS[id].t);else nm.push({id:id,t:MODS[id].t});
    autoNew.push(id);
  });
  var next={t:st.t,o2:o2,water:water,food:food,fuel:fuel,parts:parts,bat:bat,integ:integ,health:clamp(st.health+healthD,0,100),moral:clamp(st.moral+moralD,0,100),dose:st.dose+doseAdd,sci:st.sci+sciGain,dust:dust,black:black,sideP:sp,sideDone:sd,mods:nm,flags:flags,lastMode:mode.id};
  // bilan des effets de vos choix
  var batD=bat-st.bat;
  eff.push({g:batD>=-1,t:'Mode '+mode.name+' : batterie '+sgn(batD)+Math.abs(Math.round(batD))+' %'+(mode.id==='eco'?', science réduite':mode.id==='sci'?', science renforcée':'')});
  if(h.sci>0)eff.push({g:true,t:'Science '+h.sci+' h : +'+Math.round(sciGain)+' pts'});
  var iD=integ-st.integ,hD=next.health-st.health,mD=next.moral-st.moral;
  eff.push({g:iD>=0,t:'Maintenance '+h.maint+' h : vaisseau '+sgn(iD)+Math.abs(Math.round(iD))+' %'});
  eff.push({g:hD>=0,t:'Exercice '+h.ex+' h : santé '+sgn(hD)+Math.abs(Math.round(hD))+' %'});
  eff.push({g:mD>=0,t:'Repos '+h.rest+' h : moral '+sgn(mD)+Math.abs(Math.round(mD))+' %'});
  active.forEach(function(id){eff.push({g:!!MODS[id].good,t:MODS[id].n+' : '+MODS[id].d})});
  autoNew.forEach(function(id){eff.push({g:!!MODS[id].good,t:'Conséquence pour les prochains tours : '+MODS[id].n+' ('+MODS[id].d+')'})});
  for(k2 in flags)if(!st.flags[k2])eff.push({g:null,t:'Cap de la mission modifié : '+FLAGL[k2]});
  return {next:next,mode:mode,S:S,D:D,black:black,use:{o2:o2Use,water:wUse,food:fUse,fuel:fuelUse},doseAdd:doseAdd,sciGain:sciGain,forced:a.force,newly:newly,rew:rew,eff:eff,active:active};
}
function status(G,s){
  if(s.o2<=0)return {k:'fail',why:'La réserve d\'oxygène est épuisée.'};
  if(s.health<=0)return {k:'fail',why:'L\'équipage n\'est plus en état de poursuivre la mission.'};
  if(s.integ<=0)return {k:'fail',why:'Le vaisseau a perdu son intégrité.'};
  if(G.df.doseAbort&&s.dose>G.m.doseLimit)return {k:'abort',why:'La dose de radiations dépasse la limite de la mission. Retour anticipé.'};
  return null;
}
function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
function beatTurns(m){
  var out=[];
  for(var t=2;t<=m.turns-1;t+=2){
    var fx=false;
    Object.keys(m.fixed).forEach(function(k){var tt=k==='last'?m.turns:Number(k);if(tt===t)fx=true});
    if(!fx)out.push(t);
  }
  return out;
}
function schedule(G){
  var m=G.m,df=G.df,s={},used={},t;
  Object.keys(m.fixed).forEach(function(k){var tt=k==='last'?m.turns:Number(k);s[tt]=m.fixed[k];used[tt]=1});
  var odd=[],even=[];
  for(t=2;t<=m.turns;t++)if(!used[t]){(t%2?odd:even).push(t)}
  shuffle(odd);shuffle(even);
  var free=odd.concat(even);
  var inR=free.filter(function(x){return x>=m.stormAt[0]&&x<=m.stormAt[1]});
  for(var i=0;i<df.storms&&inR.length;i++){var ts=inR.shift();s[ts]='storm';free.splice(free.indexOf(ts),1)}
  var pool=shuffle(m.pool.slice());
  for(var j=0;j<df.events&&j<pool.length&&free.length;j++){s[free.shift()]=pool[j]}
  return s;
}
function EV(G){
  var m=G.m;
  var e={};
  e.storm={id:'storm',tag:'Alerte',title:'Éruption solaire en approche',body:'Le Soleil vient d\'expulser un nuage de particules chargées. Elles atteindront le vaisseau dans quelques heures.',
    edu:'Pendant une éruption, les particules traversent facilement une cabine mince. Les équipages se réfugient dans la zone la mieux protégée, souvent entourée de réserves d\'eau et de nourriture qui servent de blindage.',
    opts:[
      {id:'shelter',n:'Abri tempête',d:'Tout l\'équipage s\'abrite. Les expériences sont suspendues.',fx:{stormF:.08,sciMul:0,moral:-2}},
      {id:'partial',n:'Zone protégée, tâches internes',d:'Travail réduit à l\'intérieur de la zone la plus protégée.',fx:{stormF:.35,sciMul:.6}},
      {id:'ignore',n:'Continuer comme prévu',d:'Aucune précaution. Le risque porte sur les personnes et l\'électronique.',fx:{stormF:1,integ:-10}}]};
  e.supply={id:'supply',tag:'Énergie',title:m.supply.name,body:m.supply.text,supplyMul:m.supply.mul,
    edu:'Quand la production solaire chute, il faut choisir : réduire la consommation ou vider la batterie. Les machines de recyclage sont de gros consommateurs, donc l\'économie se paie ailleurs.',
    opts:[
      {id:'eco',n:'Passer en mode Éco',d:'La demande tombe à 7 kW. Le recyclage ralentit ce tour.',fx:{force:'eco'}},
      {id:'battery',n:'Puiser dans la batterie',d:'Le mode choisi continue. La batterie encaisse la différence.',fx:{}}]};
  e.scrubber={id:'scrubber',tag:'Panne',title:'Filtre à CO₂ en panne',body:'Le CO₂ monte dans la cabine. Il faut agir avant que l\'équipage ne ressente des maux de tête.',
    edu:'Le CO₂ est dangereux avant même que l\'oxygène ne manque. Les vaisseaux emportent des cartouches de secours, mais elles se consomment aussi. Sans pièce de rechange, la réparation est bien moins sûre.',
    opts:[
      {id:'repair',n:'Réparer le filtre',d:'Utilise une pièce de rechange. Plus de maintenance prévue, plus de chances.',fx:{parts:-1},roll:{p:function(st,pl){return .5+.1*pl.h.maint+st.integ/400-(st.parts<=0?.25:0)},ok:{moral:2},ko:{health:-5,o2Pct:4},okT:'Le filtre est réparé.',koT:'La réparation échoue. L\'équipage bascule sur les cartouches de secours et subit des maux de tête.'}},
      {id:'cart',n:'Cartouches de secours',d:'Sans risque, mais elles puisent dans l\'air disponible.',fx:{o2Pct:8}},
      {id:'ignore',n:'Attendre',d:'Le CO₂ continue de monter.',fx:{health:-8,moral:-3}}]};
  e.leak={id:'leak',tag:'Panne',title:'Petite fuite après un impact',body:'Une micrométéorite a percé une cloison. La pression baisse doucement.',
    edu:'Les vaisseaux sont conçus avec plusieurs couches. Une petite fuite se répare avec un kit, à condition d\'avoir le temps et le matériel.',
    opts:[
      {id:'patch',n:'Poser un patch',d:'Utilise une pièce. Réussite plus probable si la maintenance est élevée.',fx:{parts:-1},roll:{p:function(st,pl){return .45+.1*pl.h.maint+st.integ/400-(st.parts<=0?.25:0)},ok:{integ:-3},ko:{integ:-12,o2Pct:5},okT:'Le patch tient. La pression se stabilise.',koT:'Le patch cède. Il faut réparer une seconde fois et de l\'air s\'échappe.'}},
      {id:'iso',n:'Isoler le module',d:'Sûr, mais les expériences du module sont coupées ce tour.',fx:{integ:-6,sciMul:.6}},
      {id:'ignore',n:'Ignorer',d:'La fuite empire.',fx:{o2Pct:8,integ:-10}}]};
  e.opp={id:'opp',tag:'Occasion',title:m.opp.title,body:m.opp.text,
    edu:'La science en vol profite des occasions rares. Mais chaque observation intensive consomme de l\'énergie et de l\'énergie humaine.',
    opts:[
      {id:'big',n:'Observation intensive',d:'Gros gain de science. La batterie et le moral en paient le prix.',fx:{sciFlat:.2,bat:-15,moral:-2}},
      {id:'norm',n:'Observation normale',d:'Un gain modeste sans effort particulier.',fx:{sciFlat:.08}},
      {id:'skip',n:'Passer son tour',d:'Rien ne change.',fx:{}}]};
  e.morale={id:'morale',tag:'Équipage',title:'Anniversaire à bord',body:'Un équipier fête son anniversaire loin de chez lui. Tout le monde y pense.',
    edu:'Dans les missions longues, les petits rituels comptent. Les agences prévoient des appels, des repas spéciaux et du temps libre pour protéger le moral.',
    opts:[
      {id:'party',n:'Soirée de détente',d:'Le moral remonte, une partie du travail est repoussée.',fx:{moral:10,sciMul:.8}},
      {id:'work',n:'Continuer le travail',d:'Le planning est tenu, l\'ambiance baisse un peu.',fx:{moral:-3}}]};
  e.comms={id:'comms',tag:'Communication',title:'Décision autonome',body:'Un capteur de pression affiche une valeur étrange. Le centre de contrôle répondra dans plusieurs minutes, et la réponse mettra autant de temps à revenir.',
    edu:'Loin de la Terre, le temps de réponse oblige l\'équipage à décider seul. Les astronautes s\'entraînent à gérer des pannes sans attendre le sol.',
    opts:[
      {id:'wait',n:'Attendre la réponse du sol',d:'Prudent, mais 4 heures de science sont perdues.',fx:{sciLost:4}},
      {id:'act',n:'Agir tout de suite',d:'Une chance sur deux de bien deviner.',roll:{p:function(){return .5},ok:{},ko:{integ:-8},okT:'Votre intuition était bonne. Le capteur était simplement mal calibré.',koT:'Mauvaise décision : un équipement a surchauffé avant la correction.'}},
      {id:'check',n:'Vérifier soi-même',d:'Demande de la maintenance. Fiable si l\'équipe a le temps.',roll:{p:function(st,pl){return .4+.1*pl.h.maint},ok:{},ko:{integ:-4,moral:-2},okT:'Le diagnostic est correct, le capteur est remplacé.',koT:'Le diagnostic prend trop de temps et une pièce est abîmée.'}}]};
  e.debris={id:'debris',tag:'Manœuvre',title:'Débris sur la trajectoire',body:'Le suivi radar détecte un fragment de débris qui croisera la trajectoire à quelques centaines de mètres.',
    edu:'Un fragment de la taille d\'un caillou file à plusieurs km/s. On évite les collisions par une petite poussée, qui coûte des ergols. Les pilotes entraînés réussissent mieux ces manœuvres.',
    opts:[
      {id:'dodge',n:'Manœuvre d\'évitement',d:'Une poussée pour s\'écarter. Consomme des ergols.',fuelPct:12,roll:{skill:true,p:function(){return .95},ok:{},ko:{integ:-5},okT:'Le vaisseau s\'écarte. Le débris passe loin.',koT:'L\'évitement est imprécis, un petit impact abîme la coque.'}},
      {id:'hide',n:'S\'abriter et espérer',d:'Aucune poussée. L\'équipage se met à l\'abri.',roll:{p:function(){return .8},ok:{},ko:{integ:-18,health:-4},okT:'Le débris passe sans toucher le vaisseau.',koT:'Le débris frappe le module. Gros dégâts.'}}]};
  e.medical={id:'medical',tag:'Équipage',title:'Un équipier est malade',body:'Fièvre et vertiges. L\'équipier ne peut plus travailler normalement.',
    edu:'Un équipage de quatre ne peut pas évacuer un malade. C\'est pourquoi les missions longues embarquent un médecin et une trousse complète.',
    opts:[
      {id:'treat',n:'Soigner à bord',d:'Plus efficace avec un médecin ou une trousse médicale.',roll:{p:function(st,pl,G){return .65+(G.K.med?.2:0)+G.ld.med*.06},ok:{health:2,moral:1},ko:{health:-8,moral:-3},okT:'Le traitement fonctionne. L\'équipier récupère vite.',koT:'Le traitement est insuffisant. L\'état de l\'équipier se dégrade.'}},
      {id:'rest',n:'Repos forcé et charge réduite',d:'La science ralentit, mais personne n\'est mis en danger.',fx:{health:-2,sciMul:.85}},
      {id:'ignore',n:'Ignorer',d:'L\'équipier continue de travailler.',fx:{health:-9,moral:-4}}]};
  e.software={id:'software',tag:'Panne',title:'Le logiciel de bord plante',body:'L\'ordinateur central redémarre en boucle et coupe les instruments.',
    edu:'Un vaisseau a plusieurs ordinateurs identiques. Quand l\'un plante, on peut basculer sur un autre, mais ils consomment plus et demandent un temps de configuration.',
    opts:[
      {id:'reboot',n:'Redémarrer le système',d:'Sûr mais lent : 4 heures de science perdues.',fx:{sciLost:4}},
      {id:'patch',n:'Corriger à la main',d:'Plus de maintenance, plus de chances.',roll:{p:function(st,pl){return .5+.1*pl.h.maint},ok:{},ko:{integ:-5,sciLost:3},okT:'Le correctif tient. Les instruments redémarrent.',koT:'Le correctif aggrave la panne. Il faut redémarrer en plus.'}},
      {id:'backup',n:'Basculer sur l\'ordinateur de secours',d:'Fiable, mais la batterie baisse.',fx:{bat:-10}}]};
  e.dust={id:'dust',tag:'Matériel',title:'Poussière dans les joints',body:'La fine poussière a pénétré les joints des sas et des combinaisons. Elle abîme tout ce qu\'elle touche.',
    edu:'Les astronautes d\'Apollo ont vu la poussière lunaire user des joints en quelques jours. Elle est fine, abrasive et colle aux tissus.',
    opts:[
      {id:'clean',n:'Nettoyer à fond',d:'Quatre heures de science perdues, la poussière diminue.',fx:{sciLost:4,dust:-25}},
      {id:'seals',n:'Remplacer les joints',d:'Utilise une pièce de rechange. Efficace.',fx:{parts:-1,dust:-40}},
      {id:'leave',n:'Laisser faire',d:'La poussière continue de s\'accumuler.',fx:{dust:20}}]};
  e.eva={id:'eva',tag:'Sortie',title:'Instrument extérieur endommagé',body:'Un instrument monté sur la coque ne répond plus. Le réparer demande une sortie extravéhiculaire.',
    edu:'Une sortie extravéhiculaire expose aux radiations et aux micrométéorites. Elle se prépare avec soin et se limite aux urgences.',
    opts:[
      {id:'out',n:'Sortie extravéhiculaire',d:'Réparation sur place. Dose de radiations et risque en plus.',fx:{stormF:.05},roll:{p:function(st,pl){return .7+.05*pl.h.maint},ok:{sciFlat:.08},ko:{health:-6,integ:-5},okT:'L\'instrument est réparé. La science reprend.',koT:'La sortie tourne mal : un astronaute se blesse et la réparation échoue.'}},
      {id:'tele',n:'Reprogrammer à distance',d:'Pas de risque, mais 4 heures de science perdues.',fx:{sciLost:4}},
      {id:'leave',n:'Laisser l\'instrument éteint',d:'Moins de données ce tour.',fx:{sciMul:.7}}]};
  var land=m.land||{title:'Atterrissage',body:''};
  e.landing={id:'landing',tag:'Manœuvre',title:land.title,body:land.body,
    edu:'Poser un engin consomme plus d\'ergols que presque toute autre manœuvre. Les pilotes arbitrent entre sécurité, carburant et temps.',
    opts:[
      {id:'auto',n:'Approche automatique',d:'Fiable et économe.',fuelPct:12,roll:{skill:true,p:function(){return .9},ok:{},ko:{integ:-12},okT:'Le module se pose en douceur.',koT:'L\'atterrissage est brutal : des dégâts sur la structure.'}},
      {id:'manual',n:'Pilotage manuel',d:'Économise des ergols, plus risqué.',fuelPct:8,roll:{skill:true,p:function(){return .7},ok:{moral:4},ko:{integ:-20,health:-6},okT:'Atterrissage parfait, le moral de l\'équipe monte.',koT:'L\'approche dévie, le module touche trop fort.'}},
      {id:'careful',n:'Seconde passe de repérage',d:'Choisir un site sûr. Consomme beaucoup d\'ergols.',fuelPct:18,roll:{skill:true,p:function(){return .97},ok:{},ko:{integ:-5},okT:'Le site est parfait, le module se pose sans problème.',koT:'Le site cache un petit rocher, quelques dégâts.'}},
      {id:'crash',n:'Descente d\'urgence',d:'Sans ergols, dernier recours.',roll:{p:function(){return .45},ok:{integ:-5},ko:{integ:-30,health:-12},okT:'Le module se pose, abîmé mais intact.',koT:'Le module percute le sol à grande vitesse.'}}]};
  var lift=m.lift||{title:'Décollage',body:''};
  e.liftoff={id:'liftoff',tag:'Manœuvre',title:lift.title,body:lift.body,
    edu:'Le décollage est l\'autre moment critique. La moindre réserve d\'ergols peut décider de l\'issue.',
    opts:[
      {id:'full',n:'Poussée nominale',d:'Trajectoire sûre, consomme les ergols prévus.',fuelPct:15,roll:{skill:true,p:function(){return .95},ok:{},ko:{integ:-12},okT:'Décollage nominal, rendez-vous réussi.',koT:'Le décollage s\'écarte de la trajectoire et abîme le module.'}},
      {id:'econ',n:'Poussée économe',d:'Moins d\'ergols, trajectoire moins sûre.',fuelPct:10,roll:{skill:true,p:function(){return .78},ok:{},ko:{integ:-15,health:-8},okT:'La trajectoire économe fonctionne.',koT:'Le module manque la trajectoire et subit de gros dégâts.'}},
      {id:'emerg',n:'Décollage de secours',d:'Presque sans ergols, dernier recours.',roll:{p:function(){return .4},ok:{integ:-5},ko:{integ:-35,health:-15},okT:'Le module décolle de justesse.',koT:'Le module ne parvient pas à la bonne orbite.'}}]};
  var orb=m.orb||{title:'Insertion en orbite',body:''};
  e.orbit={id:'orbit',tag:'Manœuvre',title:orb.title,body:orb.body,
    edu:'L\'insertion se fait en un seul passage : trop tard ou trop court, et le vaisseau file sans être capturé.',
    opts:[
      {id:'burn',n:'Freinage au moteur',d:'Fiable. Consomme beaucoup d\'ergols.',fuelPct:14,roll:{skill:true,p:function(){return .95},ok:{},ko:{integ:-12},okT:'Capture réussie, le vaisseau est en orbite.',koT:'Le freinage est imprécis. L\'orbite est mauvaise et le moteur chauffe.'}},
      {id:'aero',n:'Freinage dans l\'atmosphère',d:'Utilise l\'atmosphère pour freiner. Peu d\'ergols, plus risqué.',fuelPct:6,roll:{skill:true,p:function(){return .75},ok:{},ko:{integ:-18},okT:'L\'atmosphère freine le vaisseau juste comme prévu.',koT:'Le bouclier chauffe plus que prévu et se déforme.'}},
      {id:'emerg',n:'Insertion de secours',d:'Presque sans ergols, dernier recours.',roll:{p:function(){return .5},ok:{integ:-5},ko:{integ:-25},okT:'Capture de justesse.',koT:'Le vaisseau est capturé trop haut et abîmé.'}}]};
  return e;
}
var BEATS={
lune:[
 function(st){return {id:'b0',tag:'Décision de mission',scene:'Jour 2 · Choix de l\'orbite',title:'Quelle orbite d\'observation ?',
  body:'Le centre de contrôle vous laisse choisir l\'altitude pour les prochains jours.',
  edu:'Plus une orbite est basse, plus les images sont fines, mais plus le vaisseau est exposé aux débris et aux irrégularités de la gravité lunaire. Changer d\'orbite coûte des ergols.',
  opts:[
   {id:'low',n:'Orbite basse',d:'Images fines. Ergols en plus.',fuelPct:5,mod:'calib',flag:'low'},
   {id:'high',n:'Orbite haute',d:'Orbite dégagée et sûre, mais science un peu réduite.',mod:'safeOrbit',flag:'high',fx:{sciMul:.9}},
   {id:'polar',n:'Orbite polaire',d:'Au-dessus des cratères du pôle. Un peu plus de radiations.',fuelPct:4,flag:'polar',fx:{stormF:.08,sciFlat:.06}}]}},
 function(st){return {id:'b1',tag:'Décision de mission',scene:'Jour 4 · Appel du sol',title:'Une classe d\'élèves vous appelle',
  body:'Des élèves d\'une école d\'Abidjan veulent poser leurs questions en direct.',
  edu:'Les agences spatiales organisent des appels avec des écoles. Pour l\'équipage, c\'est une pause qui remonte le moral, mais elle prend du temps de travail.',
  opts:[
   {id:'call',n:'Prendre l\'appel',d:'Moral en hausse, 2 h de science perdues.',fx:{moral:8,sciLost:2},mod:'crewBond'},
   {id:'later',n:'Reporter à plus tard',d:'Le planning est tenu, mais l\'équipe est déçue.',fx:{moral:-3}}]}},
 function(st){
  if(st.flags.low)return {id:'b2',tag:'Décision de mission',scene:'Jour 6 · Micro-impacts',title:'Micro-impacts en orbite basse',
   body:'De petits débris venus de la surface frappent la coque. Le capteur d\'impacts clignote.',
   edu:'Une orbite basse expose davantage aux débris. On remonte l\'orbite pour s\'en protéger, au prix d\'ergols.',
   opts:[
    {id:'up',n:'Remonter l\'orbite',d:'Évite les impacts. Coûte des ergols.',fuelPct:4,flag:'high',unflag:'low'},
    {id:'stay',n:'Rester en bas',d:'Garder les images fines, avec un risque d\'impact.',roll:{p:pr(.7),ok:{},ko:{integ:-12},okT:'Aucun impact notable. Les images restent superbes.',koT:'Un impact abîme un panneau.',okMod:'calib',koMod:'fuelLeak'}}]};
  if(st.flags.polar)return {id:'b2',tag:'Décision de mission',scene:'Jour 6 · Cratères polaires',title:'Zone glacée au pôle',
   body:'Les instruments détectent un signal étrange dans un cratère jamais éclairé.',
   edu:'Au fond de certains cratères polaires, la température ne dépasse jamais −200 °C. De la glace d\'eau pourrait s\'y être conservée pendant des milliards d\'années.',
   opts:[
    {id:'scan',n:'Scanner en détail',d:'Beaucoup de science si le signal est confirmé.',fx:{bat:-8},roll:{p:pr(.6),ok:{sciFlat:.12},ko:{sciLost:3},okT:'Le signal d\'eau gelée est confirmé.',koT:'Le signal était un artefact. Du temps perdu.',okFlag:'ice',okMod:'calib'}},
    {id:'note',n:'Noter et poursuivre',d:'Un peu de science, sans effort.',fx:{sciFlat:.03}}]};
  return {id:'b2',tag:'Décision de mission',scene:'Jour 6 · Cratère dans l\'ombre',title:'Un cratère dans l\'ombre',
   body:'Un cratère jamais éclairé passe sous l\'orbite. Une descente brève permettrait de mieux l\'observer.',
   edu:'Les cratères des pôles lunaires gardent peut-être de la glace d\'eau. Une descente en orbite demande une poussée supplémentaire.',
   opts:[
    {id:'dive',n:'Descendre brièvement',d:'Observation rapprochée. Ergols en plus.',fuelPct:4,roll:{p:pr(.8),ok:{sciFlat:.1},ko:{integ:-6},okT:'Les images sont excellentes.',koT:'La descente est instable, un panneau vibre.',okMod:'calib'}},
    {id:'far',n:'Observer de loin',d:'Sûr, mais peu précis.',fx:{sciFlat:.03}}]};
 },
 function(st){
  var o=[
   {id:'direct',n:'Retour direct',d:'Cap sur la Terre dès maintenant. Équipe détendue.',fx:{moral:3},mod:'trained'},
   {id:'last',n:'Dernier passage d\'observation',d:'Plus de science, au prix de la batterie.',fx:{sciFlat:.1,bat:-10}},
   {id:'tidy',n:'Ranger et réviser le vaisseau',d:'Le vaisseau est remis en état. Un peu de science en moins.',fx:{integ:6,moral:2,sciMul:.9},mod:'reliable'}];
  if(st.flags.ice)o.push({id:'ice',n:'Revoir la zone de glace',d:'Une dernière mesure sur le site repéré.',fuelPct:3,fx:{sciFlat:.12}});
  return {id:'b3',tag:'Décision de mission',scene:'Jour 8 · Préparer le retour',title:'Préparer le retour vers la Terre',
   body:'Il reste deux jours. Le centre de contrôle laisse l\'équipage choisir comment les employer.',
   edu:'Avant un retour, on contrôle le vaisseau et on prépare la rentrée atmosphérique. Chaque heure compte.',opts:o};
 }
],
sol:[
 function(st){return {id:'b0',tag:'Décision de mission',scene:'Jour 2 · Où explorer ?',title:'Où explorer en premier ?',
  body:'Le module est posé. Trois options s\'offrent à vous pour la première sortie.',
  edu:'Les zones proches du pôle Sud lunaire sont intéressantes : certains cratères y gardent de la glace d\'eau, mais le terrain est difficile.',
  opts:[
   {id:'plain',n:'Plaine proche',d:'Sûr, science modeste.',fx:{sciFlat:.04},flag:'plain'},
   {id:'crater',n:'Cratère éloigné',d:'Longue marche. Batterie et fatigue, mais riche en glace.',fx:{bat:-8},roll:{p:pr(.7),ok:{sciFlat:.12},ko:{integ:-6,dust:15,health:-3},okT:'Le cratère livre de la glace et de belles roches.',koT:'La marche est pénible, la poussière envahit les combinaisons.',okFlag:'ice',koFlag:'crater'}},
   {id:'stay',n:'Rester près du module',d:'Réglages et repos. Moral en hausse.',fx:{moral:4,sciMul:.9}}]}},
 function(st){
  if(st.flags.ice)return {id:'b1',tag:'Décision de mission',scene:'Jour 4 · Forage de la glace',title:'Forer la glace',
   body:'La glace repérée est à quelques dizaines de centimètres. Elle peut devenir de l\'eau potable.',
   edu:'La glace lunaire pourrait fournir de l\'eau, de l\'oxygène et du carburant aux futurs explorateurs. C\'est l\'une des raisons de retourner au pôle Sud.',
   opts:[
    {id:'deep',n:'Forage profond',d:'Beaucoup d\'eau si ça marche. Demande de l\'énergie.',fx:{bat:-8},roll:{p:pr(.7),ok:{waterAdd:8,sciFlat:.08},ko:{integ:-5,sciLost:3},okT:'Le forage rapporte de l\'eau et des échantillons.',koT:'Le foret se bloque. La poussière gêne les joints.',koMod:'dusty'}},
    {id:'surf',n:'Prélever en surface',d:'Peu d\'eau, aucun risque.',fx:{waterAdd:3,sciFlat:.03}},
    {id:'skip',n:'Laisser la glace',d:'Aucun effet.',fx:{}}]};
  return {id:'b1',tag:'Décision de mission',scene:'Jour 4 · Panne de rover',title:'Le rover refuse de démarrer',
   body:'Le rover d\'exploration ne répond plus. Il faudrait le réparer ou tout faire à pied.',
   edu:'Sur la Lune, la poussière abrasive est l\'ennemie des mécanismes. Les équipes d\'Apollo l\'ont appris à leurs dépens.',
   opts:[
    {id:'fix',n:'Réparer (1 pièce)',d:'Redémarre le rover.',fx:{parts:-1},roll:{p:pr(.8),ok:{sciFlat:.05},ko:{sciLost:3},okT:'Le rover repart.',koT:'La réparation prend trop de temps.',okMod:'reliable'}},
    {id:'walk',n:'Explorer à pied',d:'Fatigue, peu de science.',fx:{health:-3,sciFlat:.02}}]};
 },
 function(st){return {id:'b2',tag:'Décision de mission',scene:'Jour 6 · Avant la nuit',title:'La nuit lunaire approche',
  body:'Dans deux jours, le Soleil disparaît pour près de quatre jours de jeu. Il faut se préparer.',
  edu:'La nuit lunaire dure environ 14 jours terrestres. Les températures chutent à −170 °C et les panneaux solaires ne produisent plus rien.',
  opts:[
   {id:'batt',n:'Batteries d\'appoint',d:'Utilise 1 pièce. Batterie renforcée pendant la nuit.',fx:{parts:-1},mod:'nightBat'},
   {id:'heat',n:'Chauffer les instruments',d:'Coûte de l\'énergie, protège le vaisseau.',fx:{bat:-6},mod:'warm'},
   {id:'none',n:'Ne rien faire',d:'Le planning continue.',fx:{sciFlat:.02}}]}},
 function(st){return {id:'b3',tag:'Décision de mission',scene:'Jour 8 · Nuit lunaire',title:'Première nuit : −170 °C',
  body:'Le Soleil vient de disparaître. Le module craque sous le froid.',
  edu:'Sans soleil, il faut vivre sur la batterie. Réduire la consommation et chauffer ce qui compte permet de tenir.',
  opts:[
   {id:'survive',n:'Passer en mode survie',d:'Tout le monde se met à l\'abri. Économise la batterie.',fx:{force:'eco'},mod:'survival'},
   {id:'work',n:'Poursuivre les travaux',d:'Science maintenue, mais la batterie s\'épuise.',fx:{bat:-5,sciFlat:.04}},
   {id:'eva',n:'Sortie de nuit avec lampes',d:'Observations uniques, très risquées.',fx:{stormF:.04},roll:{p:pr(.6),ok:{sciFlat:.14},ko:{health:-6,integ:-8},okT:'Les lampes révèlent des cristaux de glace.',koT:'Le froid abîme une combinaison et un équipier est blessé.',koMod:'sick'}}]}},
 function(st){return {id:'b4',tag:'Décision de mission',scene:'Jour 10 · Dernier prélèvement',title:'Dernier prélèvement avant le départ',
  body:'Le décollage est dans deux jours. Une dernière sortie est possible.',
  edu:'Le module doit repartir léger : chaque kilo de roche supplémentaire se paie en ergols.',
  opts:[
   {id:'core',n:'Carotte profonde',d:'Gros gain de science. Risque.',roll:{p:pr(.7),ok:{sciFlat:.15},ko:{integ:-8,sciLost:4},okT:'La carotte est un trésor scientifique.',koT:'Le tube se bloque et le matériel est abîmé.'}},
   {id:'easy',n:'Échantillons faciles',d:'Un peu de science, sans risque.',fx:{sciFlat:.05}},
   {id:'prep',n:'Préparer le décollage',d:'Révision du module. Manœuvres plus sûres.',fx:{integ:4},mod:'trained'}]}}
],
mars:[
 function(st){return {id:'b0',tag:'Décision de mission',scene:'Phase 2 · Correction de trajectoire',title:'Corriger la trajectoire ?',
  body:'Le vaisseau s\'écarte légèrement de la trajectoire idéale. Une correction coûte des ergols.',
  edu:'Une petite erreur au départ devient une grande erreur à l\'arrivée. Les navigateurs corrigent régulièrement la trajectoire avec de très petites poussées.',
  opts:[
   {id:'fine',n:'Correction fine',d:'Trajectoire propre, manœuvres plus sûres.',fuelPct:4,mod:'safeOrbit',flag:'precise'},
   {id:'wide',n:'Correction large',d:'Plus d\'ergols, mais l\'arrivée est assurée.',fuelPct:8,mod:'safeOrbit',flag:'precise'},
   {id:'skip',n:'Laisser dériver',d:'Aucun ergol dépensé. L\'insertion en orbite coûtera plus cher.',flag:'drift'}]}},
 function(st){return {id:'b1',tag:'Décision de mission',scene:'Phase 4 · Passage près d\'un astéroïde',title:'Un astéroïde passe à proximité',
  body:'Un petit astéroïde croise la route à quelques milliers de kilomètres.',
  edu:'Observer un astéroïde de près est rare. Mais chaque observation rapprochée demande de l\'énergie et de l\'attention.',
  opts:[
   {id:'near',n:'Observation rapprochée',d:'Belle science, batterie sollicitée.',fx:{bat:-10},roll:{p:pr(.75),ok:{sciFlat:.12},ko:{sciLost:3},okT:'Les images de l\'astéroïde sont superbes.',koT:'Le pointage échoue.',okMod:'calib'}},
   {id:'far',n:'Photographier de loin',d:'Peu de science, aucun risque.',fx:{sciFlat:.03}},
   {id:'ignore',n:'Ne rien faire',d:'Le voyage continue.',fx:{}}]}},
 function(st){return {id:'b2',tag:'Décision de mission',scene:'Phase 6 · Mi-parcours',title:'La moitié du voyage',
  body:'Six mois de voyage devant vous encore. Le moral et la sécurité se jouent maintenant.',
  edu:'Les voyages vers Mars durent environ sept à huit mois. À mi-parcours, l\'équipage se prépare aux éruptions solaires et au besoin de souffler.',
  opts:[
   {id:'shelter',n:'Construire un abri d\'eau',d:'Les réserves d\'eau protègent des radiations. 2 h de science perdues.',fx:{sciLost:2,moral:-1},mod:'shieldW'},
   {id:'party',n:'Fête de mi-parcours',d:'Moral en hausse, travail un peu ralenti.',fx:{moral:10,sciMul:.85},mod:'crewBond'},
   {id:'science',n:'Poursuivre la science',d:'Le programme continue.',fx:{sciFlat:.04}}]}},
 function(st){return {id:'b3',tag:'Décision de mission',scene:'Phase 8 · Simulateur d\'insertion',title:'S\'entraîner à l\'arrivée',
  body:'L\'insertion en orbite se joue en un seul passage. Le simulateur de bord permet de la répéter.',
  edu:'Les astronautes répètent chaque manœuvre critique, même en plein voyage.',
  opts:[
   {id:'long',n:'Longue séance',d:'Équipage entraîné, mais fatigué.',fx:{moral:-2,sciLost:3},mod:'trained'},
   {id:'short',n:'Séance courte',d:'Un peu de préparation.',fx:{sciLost:1},mod:'safeOrbit'},
   {id:'skip',n:'Passer',d:'Aucune préparation.',fx:{sciFlat:.02}}]}},
 function(st){return {id:'b4',tag:'Décision de mission',scene:'Phase 10 · Choix de l\'orbite finale',title:'Quelle orbite autour de Mars ?',
  body:'Le sol vous laisse décider de l\'orbite d\'arrivée.',
  edu:'Une orbite basse permet de mieux observer Mars. Une orbite haute est plus facile à atteindre.',
  opts:[
   {id:'low',n:'Orbite basse scientifique',d:'Plus de science, un peu plus d\'ergols.',fuelPct:3,fx:{sciFlat:.08}},
   {id:'high',n:'Orbite haute',d:'Plus facile à atteindre. Manœuvres sûres.',mod:'safeOrbit'},
   {id:'ellip',n:'Orbite elliptique',d:'Un compromis économe.',fuelPct:1,flag:'ellip',fx:{sciFlat:.04}}]}}
],
base:[
 function(st){return {id:'b0',tag:'Décision de mission',scene:'Période 2 · Où installer le camp ?',title:'Où installer le camp ?',
  body:'Le module est posé. Il faut choisir l\'emplacement de la base pour les cinquante jours.',
  edu:'Les lieux d\'atterrissage sont choisis pour la glace, le soleil et la protection contre les radiations. Chacun a un coût.',
  opts:[
   {id:'polar',n:'Près du pôle',d:'Glace à portée, mais soleil faible.',fx:{waterAdd:6},flag:'polarcamp',mod:'dim'},
   {id:'sun',n:'Plaine ensoleillée',d:'Les panneaux produisent plus.',flag:'sunny',mod:'solarFix'},
   {id:'canyon',n:'Canyon abrité',d:'Moins de radiations, accès plus difficile.',fx:{sciFlat:.02},flag:'canyon',mod:'shieldW'}]}},
 function(st){
  var o=[
   {id:'electro',n:'Électrolyse de l\'eau',d:'Produire de l\'oxygène. Demande de l\'énergie.',fx:{bat:-12},roll:{p:pr(.8),ok:{o2Add:6},ko:{integ:-5},okT:'L\'électrolyse fonctionne. L\'air s\'enrichit en oxygène.',koT:'Une fuite d\'hydrogène force à tout couper.',okMod:'prod'}},
   {id:'save',n:'Économiser',d:'Aucune production. Rien ne change.',fx:{}}];
  if(st.flags.polarcamp)o.push({id:'melt',n:'Fondre la glace voisine',d:'De l\'eau en plus. Demande de l\'énergie.',fx:{bat:-8,waterAdd:10}});
  return {id:'b1',tag:'Décision de mission',scene:'Période 4 · Produire sur place',title:'Produire sur place',
   body:'Sur Mars, chaque kilo d\'oxygène ou d\'eau produit sur place est un kilo qu\'on n\'emporte pas.',
   edu:'L\'utilisation des ressources locales (ISRU) est une clé des futures bases : on fabrique air, eau et carburant à partir du sol et de l\'atmosphère.',opts:o};
 },
 function(st){return {id:'b2',tag:'Décision de mission',scene:'Période 6 · Tempête annoncée',title:'Une tempête de poussière se prépare',
  body:'Les satellites annoncent un mur de poussière. Il arrivera dans quelques heures.',
  edu:'Les tempêtes martiennes peuvent couvrir la planète entière et masquer le Soleil pendant des semaines.',
  opts:[
   {id:'clean',n:'Nettoyer et sceller',d:'Joints neufs. 3 h de science perdues.',fx:{sciLost:3},mod:'sealed'},
   {id:'survive',n:'Mode survie',d:'Équipe à l\'abri, batterie ménagée.',fx:{force:'eco'},mod:'survival'},
   {id:'work',n:'Continuer comme prévu',d:'La poussière s\'infiltre.',fx:{dust:10,sciFlat:.02},mod:'dusty'}]}},
 function(st){return {id:'b3',tag:'Décision de mission',scene:'Période 8 · Charger les échantillons',title:'Charger les échantillons',
  body:'Le décollage approche. Combien de roches rapporter ?',
  edu:'Chaque kilo ajouté se paie en ergols au décollage. Les équipes arbitrent entre science et marge de sécurité.',
  opts:[
   {id:'heavy',n:'Tout charger',d:'Beaucoup de science. Le décollage coûtera plus d\'ergols.',fx:{sciFlat:.1},flag:'heavy'},
   {id:'core',n:'Charger l\'essentiel',d:'Un compromis.',fx:{sciFlat:.04}},
   {id:'light',n:'Alléger au maximum',d:'Décollage plus sûr.',mod:'trained',fx:{sciFlat:.01}}]}}
],
ast:[
 function(st){return {id:'b0',tag:'Décision de mission',scene:'Phase 2 · Site d\'ancrage',title:'Où s\'ancrer ?',
  body:'L\'astéroïde est en vue. Deux zones sont possibles pour s\'amarrer.',
  edu:'Sur un astéroïde, la gravité est si faible qu\'un contact trop vif renvoie le vaisseau dans l\'espace. Le choix du site compte.',
  opts:[
   {id:'dark',n:'Pôle sombre (carbone)',d:'Riche en science, plus difficile.',roll:{p:pr(.75),ok:{sciFlat:.1},ko:{integ:-6},okT:'Le pôle sombre cache des roches rares.',koT:'Le site est plus rocailleux que prévu.',okFlag:'dark',koFlag:'dark'}},
   {id:'flat',n:'Zone plate',d:'Sûr. L\'ancrage sera plus facile.',flag:'flat',mod:'safeOrbit'}]}},
 function(st){return {id:'b1',tag:'Décision de mission',scene:'Phase 4 · Forage',title:'Forer l\'astéroïde',
  body:'Le vaisseau est amarré. Il est temps de prélever de la matière.',
  edu:'Les missions comme OSIRIS-REx et Hayabusa2 ont rapporté de la matière d\'astéroïdes. Chaque échantillon a demandé des mois de préparation.',
  opts:[
   {id:'deep',n:'Forer en profondeur',d:'Gros gain de science. Risque.',roll:{p:pr(.7),ok:{sciFlat:.12},ko:{integ:-6,dust:15},okT:'Un échantillon exceptionnel est dans le conteneur.',koT:'Le foret rebondit et projette de la poussière.'}},
   {id:'surf',n:'Prélèvement de surface',d:'Un peu de science, sans risque.',fx:{sciFlat:.04}}]}},
 function(st){return {id:'b2',tag:'Décision de mission',scene:'Phase 6 · Poussière en suspension',title:'Un nuage de poussière flotte',
  body:'Chaque contact avec l\'astéroïde soulève une poussière qui ne retombe presque pas.',
  edu:'Sans gravité notable, la poussière reste en suspension longtemps. Elle abîme les instruments et colle aux combinaisons.',
  opts:[
   {id:'clean',n:'Nettoyer les instruments',d:'3 h de science perdues, joints neufs.',fx:{sciLost:3},mod:'sealed'},
   {id:'ignore',n:'Poursuivre quand même',d:'La poussière s\'accumule.',fx:{sciFlat:.02},mod:'dusty'}]}},
 function(st){
  if(st.flags.dark)return {id:'b3',tag:'Décision de mission',scene:'Phase 8 · Cavité découverte',title:'Une cavité dans la roche',
   body:'Le radar révèle une cavité sous le pôle sombre. Elle pourrait contenir de la glace.',
   edu:'Les astéroïdes sont parfois creux. Une cavité révèle leur histoire et leur composition.',
   opts:[
    {id:'eva',n:'Y entrer en sortie extravéhiculaire',d:'Gros risque, gros gain.',fx:{stormF:.05},roll:{p:pr(.6),ok:{sciFlat:.15},ko:{health:-8,integ:-5},okT:'La cavité contient de la glace et des composés organiques.',koT:'Un équipier se blesse dans la cavité.',okFlag:'cave'}},
    {id:'probe',n:'Envoyer une sonde',d:'Moins risqué, moins de science.',fx:{sciFlat:.06,bat:-8}},
    {id:'skip',n:'Ignorer',d:'Rien ne change.',fx:{}}]};
  return {id:'b3',tag:'Décision de mission',scene:'Phase 8 · Sondage radar',title:'Sonder l\'astéroïde au radar',
   body:'Le radar du vaisseau pourrait cartographier l\'intérieur de la roche.',
   edu:'Un radar permet de « voir » à l\'intérieur d\'un astéroïde, comme une échographie.',
   opts:[
    {id:'radar',n:'Cartographier au radar',d:'Science et énergie dépensée.',fx:{sciFlat:.06,bat:-10}},
    {id:'skip',n:'Ignorer',d:'Rien ne change.',fx:{}}]};
 },
 function(st){return {id:'b4',tag:'Décision de mission',scene:'Phase 10 · Fenêtre de départ',title:'La fenêtre de départ approche',
  body:'Le retour doit partir à un moment précis. L\'équipe peut rester un peu plus longtemps.',
  edu:'Les trajectoires de retour sont calculées pour une fenêtre de quelques jours. Partir trop tard coûte des ergols.',
  opts:[
   {id:'stay',n:'Rester un jour de plus',d:'Un peu de science, moral en baisse.',fx:{sciFlat:.06,moral:-2}},
   {id:'optim',n:'Optimiser le départ',d:'Manœuvres plus sûres.',mod:'trained',fx:{sciLost:2}},
   {id:'go',n:'Partir à l\'heure',d:'Rien ne change.',fx:{}}]}},
 function(st){return {id:'b5',tag:'Décision de mission',scene:'Phase 12 · Alléger le vaisseau',title:'Alléger le vaisseau',
  body:'Avant le départ, il faut décider ce qu\'on emporte.',
  edu:'Moins de masse, moins d\'ergols consommés. Les équipes larguent tout ce qui n\'est pas indispensable.',
  opts:[
   {id:'drop',n:'Larguer le matériel inutile',d:'Départ plus sûr, moral un peu touché.',fx:{moral:-2},mod:'trained'},
   {id:'keep',n:'Tout garder',d:'Rien ne change.',fx:{sciFlat:.02}}]}}
]};
function beatFor(G,st){
  var bt=beatTurns(G.m),i=bt.indexOf(st.t),L=BEATS[G.m.key];
  return i>=0&&L&&L[i]?L[i](st):null;
}
function scoreOf(G,s,kind,done){
  var m=G.m;
  var crew=30*(s.health/100*.5+s.moral/100*.25+clamp(1-s.dose/m.doseLimit,0,1)*.25);
  var science=25*Math.min(1,s.sci/G.target);
  var left=(s.o2/G.stock.o2+s.water/G.stock.water+s.food/G.stock.food+s.fuel/G.stock.fuel)/4;
  var reserves=15*clamp(left/.3,0,1);
  var vessel=10*s.integ/100;
  var sidePts=0,sideMax=0,sideDone=[];
  G.sides.forEach(function(id){sideMax+=SIDE[id].pts;if(s.sideDone[id]){sidePts+=SIDE[id].pts;sideDone.push(id)}});
  var annex=sideMax?20*sidePts/sideMax:0;
  var raw=crew+science+reserves+vessel+annex;
  var total=sideMax?raw:raw/80*100;
  if(kind!=='complete')total=total*.4*done/m.turns;
  var parts=[['Équipage (santé, moral, dose)',crew,30],['Science récoltée',science,25],['Réserves restantes',reserves,15],['État du vaisseau',vessel,10]];
  if(sideMax)parts.push(['Missions annexes',annex,20]);
  else{parts=parts.map(function(p){return [p[0],p[1]/80*100,p[2]/80*100]})}
  return {total:Math.round(total),parts:parts,sideDone:sideDone,left:left};
}
var P=SH.store.mc,memOnly=SH.memOnly;
Object.defineProperty(P,'credits',{get:function(){return SH.store.credits},set:function(v){SH.store.credits=v},enumerable:false,configurable:true});
Object.defineProperty(P,'diff',{get:function(){return SH.store.df},set:function(v){SH.store.df=v},enumerable:false,configurable:true});
function saveP(){SH.save()}
function isUnlocked(key){
  if(P.open)return true;
  var i=ORDER.indexOf(key);if(i<=0)return true;
  var d=P.done[ORDER[i-1]];return !!(d&&d.best>=40);
}
function starsOf(sc){return sc>=85?3:sc>=65?2:sc>=40?1:0}

var S={vessel:null,screen:'brief',prep:null,mkey:'lune',G:null,st:null,plan:null,sched:null,EV:null,evtId:null,optId:null,prev:'home',final:null,endKind:null,endWhy:'',doneTurns:0,confirmReset:false};
function newPrep(){var dk=P.diff&&DIFF[P.diff]?P.diff:'normal';return {diff:dk,crew:['eng','med','sci','pil'],ld:Object.assign({},LD_REC),sides:[],hints:P.hints!==false}}
S.prep=newPrep();

var SL={ok:'OK',warn:'Attention',bad:'Critique'};
function levelOf(r){return r>=1.04?'ok':r>=.98?'warn':'bad'}
function pctState(v){return v>=50?'ok':v>=25?'warn':'bad'}
function meter(label,val,ratio,st){
  return '<div class="meter m-'+st+'"><div class="m-top"><span class="m-k">'+label+'</span><span class="m-s">'+SL[st]+'</span></div><span class="m-v">'+val+'</span><div class="m-bar"><i style="width:'+(clamp(ratio,0,1)*100).toFixed(1)+'%"></i></div></div>';
}
function fuelNeed(G,s){
  var m=G.m,need=m.fuelBase*(m.turns-s.t+1);
  Object.keys(m.fixed).forEach(function(k){var t=k==='last'?m.turns:Number(k);if(t>=s.t)need+=FIXED_COST[m.fixed[k]]/100*G.stock.fuel*G.K.fuelMul});
  return need;
}
function metersHtml(G,s){
  var m=G.m,rem=m.turns-s.t+1;
  var nO=m.dpt*3.4*.58*rem,nW=m.dpt*14*.1*rem,nF=m.dpt*2.4*G.K.foodMul*rem;
  var dr=s.dose/m.doseLimit,doseSt=dr>.97?'bad':dr>.85?'warn':'ok';
  var pr=s.parts/Math.max(1,G.partsMax),partSt=s.parts<=0?'bad':s.parts<=1?'warn':'ok';
  var out=meter('Oxygène',fmt(s.o2,s.o2<100?1:0)+' / '+fmt(G.stock.o2)+' kg',s.o2/G.stock.o2,levelOf(s.o2/Math.max(.001,nO)))+
    meter('Eau',fmt(s.water,s.water<100?1:0)+' / '+fmt(G.stock.water)+' L',s.water/G.stock.water,levelOf(s.water/Math.max(.001,nW)))+
    meter('Nourriture',fmt(s.food,s.food<100?1:0)+' / '+fmt(G.stock.food)+' kg',s.food/G.stock.food,levelOf(s.food/Math.max(.001,nF)))+
    meter('Ergols',fmt(s.fuel,s.fuel<100?1:0)+' / '+fmt(G.stock.fuel)+' kg',s.fuel/G.stock.fuel,levelOf(s.fuel/Math.max(.001,fuelNeed(G,s))*.8))+
    meter('Pièces',s.parts+' / '+G.partsMax,pr,partSt)+
    meter('Batterie',fmt(s.bat)+' %',s.bat/100,pctState(s.bat))+
    meter('Vaisseau',fmt(s.integ)+' %',s.integ/100,pctState(s.integ))+
    meter('Santé',fmt(s.health)+' %',s.health/100,pctState(s.health))+
    meter('Moral',fmt(s.moral)+' %',s.moral/100,pctState(s.moral))+
    meter('Dose',fmt(s.dose,m.doseLimit<100?1:0)+' / '+fmt(m.doseLimit)+' mSv',dr,doseSt);
  if(m.surface)out+=meter('Poussière',fmt(s.dust)+' %',s.dust/100,s.dust<40?'ok':s.dust<70?'warn':'bad');
  return out;
}

function go(n){
  S.screen=n;
  ['brief','play','end'].forEach(function(k){$('#c-s-'+k).hidden=n!==k});$('#c-s-inter').hidden=true;
  SH.showMod('mc');
  var c='';
  if(n==='brief')c='Briefing · '+MISSIONS[S.mkey].name;
  if(n==='play'&&S.G)c=S.G.m.name+' · '+S.G.df.name;
  if(n==='end'&&S.G)c='Bilan · '+S.G.m.name;
  SH.setStep(n==='end'?'end':'crew',c);
  var sec=$('#c-s-'+n);sec.classList.remove('enter');void sec.offsetWidth;sec.classList.add('enter');
  var lines={brief:'Équipage, soutes, annexes… prépare tout.'};
  if(lines[n])say(lines[n],'idle',3400);
  if(n==='brief')renderBrief();
  window.scrollTo(0,0);
}

function ldSlots(ld){return LOAD.reduce(function(s,i){return s+(ld[i.id]||0)*i.slots},0)}
function renderBrief(){
  var m=MISSIONS[S.mkey],p=S.prep;
  $('#c-bEyebrow').textContent='Équipage · mission '+(ORDER.indexOf(m.key)+1)+' sur 5 · '+m.level+' · '+DIFF[p.diff].name;
  var vb=$('#c-bVessel'),V=vesselMods(S.vessel);
  if(S.vessel){vb.hidden=false;vb.innerHTML='<div class="sec-h"><h3>Vaisseau conçu à l\'Atelier</h3><span class="eyebrow">'+esc(S.vessel.name)+'</span></div><div class="panel"><p class="fine">'+esc(S.vessel.summary)+'</p><div class="tags">'+(V.list.length?V.list.map(tagHtml).join(''):'<span class="tagc">Aucun bonus particulier</span>')+'</div></div>'}
  else{vb.hidden=false;vb.innerHTML='<div class="sec-h"><h3>Vaisseau standard</h3><span class="eyebrow">Aucun vaisseau conçu</span></div><div class="panel"><p class="fine">Concevez et lancez ce vaisseau à l\'Atelier pour gagner des bonus : énergie, ergols, blindage, science.</p></div>'}
  $('#c-bTitle').textContent=m.name;
  $('#c-bStory').textContent=m.story;
  $('#c-bNotes').innerHTML=m.notes.map(function(n){return '<span class="tagc">'+n+'</span>'}).join('');
  $('#c-bCrew').innerHTML=CREW.map(function(c){
    return '<button type="button" class="card" role="checkbox" aria-checked="false" data-crew="'+c.id+'"><span class="nm">'+c.n+'</span><span class="role">'+c.r+'</span><span class="ds">'+c.d+'</span></button>'}).join('');
  $('#c-bLoad').innerHTML=LOAD.map(function(i){
    return '<div class="stepper-row"><span style="font-weight:600">'+i.n+'</span><span class="step"><button type="button" data-ld="'+i.id+'" data-d="-1" aria-label="Retirer : '+i.n+'">−</button><output id="c-ld-'+i.id+'">0</output><button type="button" data-ld="'+i.id+'" data-d="1" aria-label="Ajouter : '+i.n+'">+</button></span><span class="d">'+i.d+'</span></div>'}).join('');
  var avail=Object.keys(SIDE).filter(function(id){return !SIDE[id].surf||m.surface});
  p.sides=p.sides.filter(function(id){return avail.indexOf(id)>=0});
  $('#c-bSide').innerHTML=avail.map(function(id){var s=SIDE[id];
    return '<button type="button" class="card" role="checkbox" aria-checked="false" data-side="'+id+'"><span class="nm">'+s.n+'</span><span class="ds">'+s.d+'</span><span class="role">'+s.target+' h · '+s.kw+' kW · '+s.r+'</span></button>'}).join('');
  refreshBrief();
}
function refreshBrief(){
  var p=S.prep,cap=8+P.up.store,used=ldSlots(p.ld);
  $$('#c-bCrew .card').forEach(function(b){b.setAttribute('aria-checked',p.crew.indexOf(b.dataset.crew)>=0?'true':'false')});
  $$('#c-bSide .card').forEach(function(b){var on=p.sides.indexOf(b.dataset.side)>=0;b.setAttribute('aria-checked',on?'true':'false');b.disabled=!on&&p.sides.length>=2});
  LOAD.forEach(function(i){var o=$('#c-ld-'+i.id);if(o)o.textContent=p.ld[i.id]||0});
  $$('#c-bLoad [data-ld]').forEach(function(b){
    var id=b.dataset.ld,it=LOAD.filter(function(x){return x.id===id})[0],d=Number(b.dataset.d);
    b.disabled=d>0?((p.ld[id]||0)>=it.max||used+it.slots>cap):(p.ld[id]||0)<=0;
  });
  var cc=$('#c-bCrewC');cc.textContent=p.crew.length+' / 4 choisis';cc.className='counter '+(p.crew.length===4?'ok':'bad');
  var lc=$('#c-bLoadC');lc.textContent=used+' / '+cap+' emplacements';lc.className='counter '+(used<=cap?'ok':'bad');
  $('#c-bSideC').textContent=p.sides.length+' / 2 choisies';
  $('#c-hintSwitch').setAttribute('aria-checked',p.hints?'true':'false');
  var why=p.crew.length!==4?'Choisissez exactement 4 équipiers.':used>cap?'Trop de chargement.':'';
  $('#c-bBlock').textContent=why;$('#c-startBtn').disabled=!!why;
}

function sidesLeft(){return S.G.sides.filter(function(id){return !S.st.sideDone[id]})}
function evtFor(id){
  var e=S.EV[id],fl=S.st.flags||{},add=0;
  if(id==='orbit'&&fl.drift)add=4;
  if(id==='liftoff'&&fl.heavy)add=3;
  if(!add)return e;
  var c=Object.assign({},e);
  c.opts=e.opts.map(function(o){return o.fuelPct?Object.assign({},o,{fuelPct:o.fuelPct+add}):o});
  return c;
}
function startMission(){
  var p=S.prep;
  var G=makeGame(S.mkey,p.diff,p.crew.slice(),Object.assign({},p.ld),p.sides.slice(),Object.assign({},P.up),S.vessel);
  S.G=G;S.st=startState(G);S.sched=schedule(G);S.EV=EV(G);
  S.plan={mode:'std',h:G.sides.length?{sci:5,maint:3,ex:2,rest:4,annex:2}:{sci:6,maint:3,ex:2,rest:5,annex:0}};
  S.final=null;S.evt=null;S.beat=null;S.eng={done:{},last:0,n:0};
  P.diff=p.diff;P.hints=p.hints;saveP();
  sceneInit(G.m.key);
  SH.launch(function(){go('play');beginTurn()},{name:MISSIONS[S.mkey].name+' · '+DIFF[p.diff].name,words:['Équipage à bord','3','2','1','Décollage !']});
}
function presets(){
  return S.G.sides.length?[['Équilibré',{sci:5,maint:3,ex:2,rest:4,annex:2}],['Focus science',{sci:7,maint:2,ex:2,rest:3,annex:2}],['Récupération',{sci:2,maint:3,ex:3,rest:5,annex:3}]]:
    [['Équilibré',{sci:6,maint:3,ex:2,rest:5,annex:0}],['Focus science',{sci:8,maint:3,ex:2,rest:3,annex:0}],['Récupération',{sci:3,maint:3,ex:3,rest:7,annex:0}]];
}
function evtHtml(e,G,st,att){
  return '<span class="tag">'+e.tag+'</span><h3>'+e.title+'</h3><p>'+e.body+'</p><div class="opts" role="radiogroup" aria-label="Votre décision">'+
    e.opts.map(function(o){
      var c=fuelCost(G,o),dis=c>0&&c>st.fuel-G.m.fuelBase,meta='';
      if(c>0)meta+='<span class="'+(dis?'o-w':'o-m')+'">Ergols : −'+fmt(c,c<100?1:0)+' kg'+(dis?' (insuffisants)':'')+'</span>';
      else if(o.fx&&o.fx.parts)meta+='<span class="o-m">Pièce de rechange : −1</span>';
      if(o.mod)meta+='<span class="o-m">Effet durable : '+MODS[o.mod].n+'</span>';
      if(o.flag)meta+='<span class="o-t">Change le cap : '+FLAGL[o.flag]+'</span>';
      if(o.roll)meta+='<span class="o-t">Réussite incertaine</span>';
      return '<button type="button" class="opt" role="radio" aria-checked="false" data-'+att+'="'+o.id+'"'+(dis?' disabled':'')+'><span class="o-n">'+o.n+'</span>'+meta+'<span class="o-d">'+o.d+'</span></button>'}).join('')+'</div>';
}
function beginTurn(){
  var G=S.G,m=G.m,st=S.st;
  if(SH.S3&&SH.S3.ok&&SH.S3.kind()!=='c:'+m.key){SH.S3.mount($('#c-scene'));SH.S3.scene('c:'+m.key,{});SH.S3.progress((st.t-1)/Math.max(1,m.turns-1))}else if(SH.S3&&SH.S3.ok)SH.S3.mount($('#c-scene'));
  S.evtId=S.sched[st.t]||null;S.evt=S.evtId?evtFor(S.evtId):null;S.optId=null;
  S.beat=beatFor(G,st);S.beatOptId=null;
  $('#c-reportView').hidden=true;$('#c-planView').hidden=false;
  $('#c-playEyebrow').textContent='Mission '+m.name+' · '+G.df.name;
  $('#c-dayTitle').textContent=m.unit+' '+st.t+' sur '+m.turns;
  var bts=beatTurns(m);
  $('#c-prog').innerHTML=Array.apply(null,Array(m.turns)).map(function(_,i){var t=i+1;return '<i class="'+(t<st.t?'done':t===st.t?'now':'')+((S.sched[t]||bts.indexOf(t)>=0)&&t>=st.t?' ev':'')+'"></i>'}).join('');
  var h=S.plan.h;
  if(!sidesLeft().length&&(h.annex||0)>0){h.rest+=h.annex;h.annex=0}
  $('#c-modes').innerHTML=Object.keys(MODES).map(function(k){var o=MODES[k];
    return '<button type="button" class="opt" role="radio" aria-checked="false" data-mode="'+k+'"><span class="o-n">'+o.name+'</span><span class="o-m">Demande '+o.d+' kW · science × '+fmt(o.sci,1)+' · air '+Math.round(o.o*100)+' % · eau '+Math.round(o.w*100)+' %</span><span class="o-d">'+o.desc+'</span></button>'}).join('');
  $('#c-presets').innerHTML=presets().map(function(p,i){return '<button type="button" class="chip" data-preset="'+i+'">'+p[0]+'</button>'}).join('');
  var rows=[['sci','Science','Produit des points de science.'],['maint','Maintenance','Répare le vaisseau, qui s\'use à chaque tour. Nettoie la poussière.'],['ex','Exercice','Garde muscles et os en état. Deux heures par jour au minimum.'],['rest','Repos et loisirs','Remonte le moral de l\'équipe.']];
  if(G.sides.length)rows.push(['annex','Missions annexes','Travaille sur : '+G.sides.map(function(id){return SIDE[id].n.toLowerCase()}).join(', ')+'.']);
  $('#c-hours').innerHTML=rows.map(function(r){
    return '<div class="hr"><span class="n">'+r[1]+'</span><span class="d">'+r[2]+'</span><span class="step"><button type="button" data-h="'+r[0]+'" data-d="-1" aria-label="Moins d\'une heure : '+r[1].toLowerCase()+'">−</button><output id="c-hv-'+r[0]+'">0 h</output><button type="button" data-h="'+r[0]+'" data-d="1" aria-label="Une heure de plus : '+r[1].toLowerCase()+'">+</button></span></div>'}).join('');
  var bbox=$('#c-beatBox');
  if(S.beat){bbox.hidden=false;bbox.className='evt beat';bbox.innerHTML=evtHtml(S.beat,G,st,'bopt')}else{bbox.hidden=true;bbox.innerHTML=''}
  var box=$('#c-evtBox');
  if(S.evt){box.hidden=false;box.className='evt'+(S.evtId==='storm'?' alert':'');box.innerHTML=evtHtml(S.evt,G,st,'opt')}else{box.hidden=true;box.innerHTML=''}
  refresh();
  window.scrollTo(0,0);
  if(st.t>1)warp();
  if(S.beat)cutscene(S.beat.scene);
  else if(st.t===1)cutscene(m.name+' · '+m.unit+' 1');
  else if(st.t===m.turns)cutscene(m.unit+' finale · cap sur la Terre');
  if(S.evtId==='storm'){flash();shakeScreen();say('Alerte ! Éruption solaire !','alert',3800)}
  else if(S.evtId==='landing'||S.evtId==='liftoff'||S.evtId==='orbit')say('Manœuvre critique. Concentre-toi !','alert',3200);
  else if(S.evtId)say('Un imprévu ! À toi de décider.','alert',3000);
  else if(S.beat)say('Décision de mission : ton choix changera la suite.','happy',3600);
  else{var cr=critical(G,st);
    if(cr)say(cr,'hurt',3200);
    else if(st.t===1)say('Premier tour. Garde un œil sur la batterie.','idle',3000);
    else if(Math.random()<.35)say(SH.FACTS[Math.floor(Math.random()*FACTS.length)],'idle',4200)}
}
function hoursUsed(){var h=S.plan.h;return h.sci+h.maint+h.ex+h.rest+(S.G.sides.length?(h.annex||0):0)}
function curOpt(){var e=S.evt;return e&&S.optId?e.opts.filter(function(x){return x.id===S.optId})[0]:null}
function curBeatOpt(){var e=S.beat;return e&&S.beatOptId?e.opts.filter(function(x){return x.id===S.beatOptId})[0]:null}
function picks(){
  var a=[];
  if(S.evt)a.push({e:S.evt,o:curOpt(),roll:null});
  if(S.beat)a.push({e:S.beat,o:curBeatOpt(),roll:null});
  return a;
}
function curProj(){return turnCalc(S.G,S.st,S.plan,picks())}
function rowHtml(k,cur,nxt,unit,d,better){
  var diff=nxt-cur,cls=Math.abs(diff)<.05?'':(better*diff>0?'up-c':'dn-c');
  var sign=diff>0?'+':diff<0?'−':'';
  return '<div class="pr"><span class="k">'+k+'</span><span class="v">'+fmt(cur,d)+' → '+fmt(nxt,d)+' '+unit+'</span><span class="dl '+cls+'">'+sign+fmt(Math.abs(diff),d)+' '+unit+'</span></div>';
}
function projRows(G,st,nx){
  return rowHtml('Oxygène',st.o2,nx.o2,'kg',1,1)+rowHtml('Eau',st.water,nx.water,'L',1,1)+rowHtml('Nourriture',st.food,nx.food,'kg',1,1)+rowHtml('Ergols',st.fuel,nx.fuel,'kg',1,1)+
    rowHtml('Pièces',st.parts,nx.parts,'',0,1)+rowHtml('Batterie',st.bat,nx.bat,'%',0,1)+rowHtml('Vaisseau',st.integ,nx.integ,'%',0,1)+rowHtml('Santé',st.health,nx.health,'%',0,1)+
    rowHtml('Moral',st.moral,nx.moral,'%',0,1)+rowHtml('Dose',st.dose,nx.dose,'mSv',1,-1)+rowHtml('Science',st.sci,nx.sci,'pts',0,1)+(G.m.surface?rowHtml('Poussière',st.dust,nx.dust,'%',0,-1):'');
}
function advice(G,st,pr){
  var m=G.m,nx=pr.next,rem=m.turns-st.t+1;
  if(m.solarMul){
    var tt=null;for(var t=st.t+1;t<=m.turns;t++)if(m.solarMul[t]&&m.solarMul[t]<.6){tt=t;break}
    if(m.solarMul[st.t]&&m.solarMul[st.t]<.6&&pr.D>pr.S)return 'C\'est la nuit : production '+fmt(pr.S,1)+' kW pour '+fmt(pr.D,1)+' kW demandés. Passez en mode Éco.';
    if(tt&&tt-st.t<=3&&st.bat<85)return 'La nuit tombe '+(tt-st.t===1?'au prochain tour':'dans '+(tt-st.t)+' tours')+'. Rechargez la batterie à fond avant, avec le mode Éco ou Standard.';
  }
  if(pr.black)return 'Panne d\'énergie prévue : le recyclage s\'arrête. Passez en mode Éco ou réduisez la demande.';
  if(nx.bat<25)return 'La batterie descend à '+Math.round(nx.bat)+' %. Le mode Éco la recharge plus vite.';
  if(st.o2<pr.use.o2*rem*.98)return 'À ce rythme, l\'oxygène ne durera pas jusqu\'au bout. Le mode Standard recycle mieux que le mode Éco.';
  if(st.water<pr.use.water*rem*.98)return 'L\'eau ne suffira pas à ce rythme. Le recycleur a besoin d\'énergie : évitez le mode Éco trop longtemps.';
  if(nx.health<60)return 'La santé de l\'équipage baisse. Ajoutez de l\'exercice : deux heures par jour au minimum.';
  if(nx.moral<40)return 'Le moral est bas. Prévoyez plus de repos, et évitez de dépasser 7 heures de science.';
  if(nx.integ<50)return 'Le vaisseau s\'use. Une heure de maintenance de plus rapporte environ 2 points.';
  if(m.surface&&nx.dust>60)return 'La poussière s\'accumule. La maintenance la retire et protège le vaisseau.';
  if(nx.dose/m.doseLimit>.85)return 'La dose de radiations approche de la limite. Protégez l\'équipage lors des éruptions.';
  if(st.parts<=0)return 'Plus de pièces de rechange : les réparations sont bien moins sûres.';
  return 'Tout est nominal. Gardez le cap'+(m.dpt>=5?' (message reçu avec quelques minutes de retard).':'.');
}
function fxBoxHtml(st){
  var chips=[];
  (st.mods||[]).forEach(function(x){var d=MODS[x.id];chips.push('<span class="fxc '+(d.good?'gd':'bd')+'">'+(d.good?'▲ ':'▼ ')+d.n+' · '+d.d+' · '+x.t+' tour'+(x.t>1?'s':'')+'</span>')});
  Object.keys(st.flags||{}).forEach(function(f){chips.push('<span class="fxc">'+FLAGL[f]+'</span>')});
  return chips.length?'<span class="eyebrow">Effets en cours et cap de la mission</span><div class="fxl">'+chips.join('')+'</div>':'';
}
function refresh(){
  var G=S.G,m=G.m,st=S.st,pl=S.plan,pr=curProj();
  $('#c-meters').innerHTML=metersHtml(G,st);
  $('#c-sciLine').textContent='Science '+fmt(st.sci)+' / '+G.target+' pts';
  var sb=$('#c-sideBox');
  if(G.sides.length){
    sb.hidden=false;
    sb.innerHTML='<span class="eyebrow">Missions annexes</span>'+G.sides.map(function(id){var s=SIDE[id],p=st.sideP[id]||0,d=st.sideDone[id];
      return '<div class="sd'+(d?' fin':'')+'"><div class="t"><span>'+s.n+'</span><span>'+(d?'Terminée · '+s.r:fmt(p,1)+' / '+s.target+' h')+'</span></div><div class="m-bar"><i style="width:'+(clamp(p/s.target,0,1)*100)+'%"></i></div></div>'}).join('');
  }else sb.hidden=true;
  var fb=$('#c-fxBox'),fh=fxBoxHtml(st);fb.hidden=!fh;fb.innerHTML=fh;
  $$('#c-modes .opt').forEach(function(b){var on=b.dataset.mode===(pr.forced||pl.mode);b.setAttribute('aria-checked',on?'true':'false');b.disabled=!!pr.forced&&b.dataset.mode!==pr.forced});
  $('#c-powerLine').textContent='Production '+fmt(pr.S,1)+' kW · demande '+fmt(pr.D,1)+' kW';
  ['sci','maint','ex','rest','annex'].forEach(function(k){var el=$('#c-hv-'+k);if(el)el.textContent=(pl.h[k]||0)+' h'});
  var left=HPT-hoursUsed();
  var hl=$('#c-hoursLeft');hl.textContent=left===0?'16 h réparties':left+' h à répartir';hl.className='left'+(left===0?' zero':'');
  var canAnnex=sidesLeft().length>0;
  $$('#c-hours [data-d]').forEach(function(b){var d=Number(b.dataset.d),k=b.dataset.h;b.disabled=d>0?(left<=0||(k==='annex'&&!canAnnex)):(pl.h[k]||0)<=0});
  if(S.evt)$$('#c-evtBox [data-opt]').forEach(function(b){b.setAttribute('aria-checked',b.dataset.opt===S.optId?'true':'false')});
  if(S.beat)$$('#c-beatBox [data-bopt]').forEach(function(b){b.setAttribute('aria-checked',b.dataset.bopt===S.beatOptId?'true':'false')});
  var o=curOpt(),bo=curBeatOpt();
  $('#c-projNote').textContent=(o&&o.roll)||(bo&&bo.roll)?'Le résultat d\'une décision reste incertain et n\'est pas inclus.':'Estimation pour ce tour';
  $('#c-proj').innerHTML=projRows(G,st,pr.next);
  var cap=$('#c-capcom');
  if(S.prep.hints){cap.hidden=false;$('#c-capText').textContent=advice(G,st,pr)}else cap.hidden=true;
  var why=left!==0?'Répartissez les 16 heures pour valider.':(S.beat&&!S.beatOptId?'Choisissez une décision de mission.':(S.evt&&!S.optId?'Choisissez une décision pour l\'événement.':''));
  $('#c-blocker').textContent=why;$('#c-validate').disabled=!!why;
  $('#c-validate').textContent=st.t===m.turns?m.valLast:m.val;
  sceneUpdate(pr);
}
function validate(){
  var G=S.G,m=G.m,st=S.st;
  var pk=picks();
  pk.forEach(function(p){if(p.o&&p.o.roll){var pp=rollP(p.o,st,S.plan,G);p.roll={p:pp,ok:Math.random()<pp}}});
  var res=turnCalc(G,st,S.plan,pk);
  var lines=[],edus=[],anyKo=false,anyOk=false;
  pk.forEach(function(p){
    if(!p.e||!p.o)return;
    lines.push(p.e.title+' : '+p.o.n.toLowerCase()+'.');
    if(p.roll){lines.push(p.roll.ok?p.o.roll.okT:p.o.roll.koT);if(p.roll.ok)anyOk=true;else anyKo=true}
    if(p.e.edu)edus.push(p.e.edu);
  });
  if(m.solarMul&&m.solarMul[st.t]&&m.solarMul[st.t]<.6)lines.push('Nuit lunaire : la production solaire tombe à '+fmt(res.S,1)+' kW.');
  lines.push('Énergie : '+fmt(res.S,1)+' kW produits, '+fmt(res.D,1)+' kW demandés (mode '+res.mode.name.toLowerCase()+'). Batterie à '+Math.round(res.next.bat)+' %.');
  if(res.black)lines.push('Plus d\'électricité : le recyclage de l\'air et de l\'eau s\'arrête, le moral chute.');
  lines.push('Science : +'+fmt(res.sciGain,1)+' pts. Dose reçue : '+fmt(res.doseAdd,m.doseLimit<100?1:0)+' mSv.');
  res.newly.forEach(function(id){lines.push('Mission annexe terminée : '+SIDE[id].n+'. '+SIDE[id].r+'.')});
  if(res.next.health<40)lines.push('L\'équipage est épuisé et malade. Santé à '+Math.round(res.next.health)+' %.');
  var prev=S.st;res.next.t=st.t;S.st=res.next;
  var stt=status(G,res.next),last=st.t===m.turns;
  $('#c-planView').hidden=true;$('#c-reportView').hidden=false;
  $('#c-repEyebrow').textContent=m.unit+' '+st.t+' sur '+m.turns;
  $('#c-repLines').innerHTML=lines.map(function(l,i){return '<li style="animation-delay:'+(i*.12)+'s">'+l+'</li>'}).join('');
  var edu=$('#c-repEdu');if(edus.length){edu.hidden=false;edu.innerHTML='<b>À retenir.</b> '+edus.join(' ')}else{edu.hidden=true}
  var eb=$('#c-repEffBox');eb.hidden=false;
  $('#c-repEff').innerHTML=res.eff.slice(0,12).map(function(x,i){return '<li class="'+(x.g===null?'nu':x.g?'gd':'bd')+'" style="animation-delay:'+(i*.08)+'s">'+x.t+'</li>'}).join('');
  $('#c-repDelta').innerHTML=projRows(G,prev,res.next);
  $('#c-meters').innerHTML=metersHtml(G,res.next);
  $('#c-sciLine').textContent='Science '+fmt(res.next.sci)+' / '+G.target+' pts';
  var fb=$('#c-fxBox'),fh=fxBoxHtml(res.next);fb.hidden=!fh;fb.innerHTML=fh;
  var nb=$('#c-nextBtn');
  if(stt||last){nb.textContent='Voir le bilan';S.endKind=stt?stt.k:'complete';S.endWhy=stt?stt.why:'';S.doneTurns=st.t}
  else{nb.textContent=m.nextL;S.endKind=null}
  window.scrollTo(0,0);
  sceneUpdate(res);
  if(anyKo){say('Aïe… raté.','hurt',3200);flash();shakeScreen()}
  else if(anyOk){say('Bien joué !','cheer',2400);flash('good')}
  else if(res.black){say('Panne d\'énergie !','alert',3200);flash()}
  else if(res.newly.length)say('Mission annexe réussie !','cheer',2600);
  else if(res.eff.some(function(x){return x.g===null}))say('Le cap de la mission change !','happy',3000);
}
function next(){
  if(S.endKind){finish();return}
  S.st.t+=1;
  var sp=engFor();
  if(sp){SH.transit('Atelier','Salle des ingénieurs',function(){SH.AO.interlude(sp)});return}
  beginTurn();
}

/* ===== SCENES ===== */
function starsSvg(seed,n,maxR){
  var out='',x=seed;function r(){x=(x*9301+49297)%233280;return x/233280}
  for(var i=0;i<n;i++)out+='<circle cx="'+(r()*600).toFixed(0)+'" cy="'+(r()*118).toFixed(0)+'" r="'+(.5+r()*maxR).toFixed(1)+'"/>';
  return out;
}
function fxHub(fy,cy){
  return '<g class="sc-flame"><path d="M-5 '+fy+'Q0 '+(fy+26)+' 5 '+fy+'Z" fill="#ffc12e"/><path d="M-3 '+fy+'Q0 '+(fy+16)+' 3 '+fy+'Z" fill="#cc2f2a"/></g>'+
    '<g class="sc-smoke"><circle cx="0" cy="'+cy+'" r="5"/><circle cx="5" cy="'+cy+'" r="4"/><circle cx="-5" cy="'+cy+'" r="4"/></g>'+
    '<circle class="sc-warn" cx="13" cy="'+(cy-4)+'" r="3" fill="#ff4b44"/>'+
    '<g class="sc-comms"><circle r="8" cx="0" cy="'+(cy-10)+'"/><circle r="8" cx="0" cy="'+(cy-10)+'"/><circle r="8" cx="0" cy="'+(cy-10)+'"/></g>';
}
function shipSvg(){
  return '<g class="sc-ship"><rect class="sc-panel" x="-28" y="-3" width="17" height="6" rx="1"/><rect class="sc-panel" x="11" y="-3" width="17" height="6" rx="1"/><rect class="sc-hull" x="-10" y="-6" width="20" height="12" rx="3"/><rect x="-4" y="-9" width="8" height="4" rx="1" fill="#cfd8ee"/><circle class="sc-light" cx="0" cy="0" r="2.3"/><line x1="0" y1="-9" x2="0" y2="-15" stroke="#cfd8ee" stroke-width="1"/>'+fxHub(6,-10)+'</g>';
}
function landerSvg(){
  return '<g class="sc-ship"><line x1="-12" y1="-4" x2="-22" y2="0" stroke="#cfd8ee" stroke-width="2"/><line x1="12" y1="-4" x2="22" y2="0" stroke="#cfd8ee" stroke-width="2"/><rect class="sc-panel" x="-34" y="-22" width="18" height="6" rx="1"/><rect class="sc-panel" x="16" y="-22" width="18" height="6" rx="1"/><rect class="sc-hull" x="-14" y="-28" width="28" height="22" rx="5"/><rect x="-8" y="-24" width="16" height="8" rx="2" fill="#1d3a8a"/><rect class="sc-farm" x="-6" y="-23" width="12" height="6" rx="1" fill="#5fd36a"/><circle class="sc-light" cx="0" cy="-10" r="2.2"/><path d="M-6 -28 L0 -40 L6 -28Z" fill="#cfd8ee"/>'+fxHub(0,-44)+'</g>';
}
function eva(){return '<g transform="translate(0 0)"><g class="sc-eva"><circle cx="0" cy="-6" r="3.6" fill="#f5f8ff"/><rect x="-3" y="-3" width="6" height="9" rx="2.5" fill="#f5f8ff"/><rect x="-1.6" y="-5" width="3.2" height="2.2" fill="#1d3a8a"/><line x1="-3" y1="1" x2="-9" y2="-2" stroke="#f5f8ff" stroke-width="2"/></g></g>'}
function overlays(){
  var st='';for(var i=0;i<16;i++)st+='<line x1="'+(i*40+10)+'" y1="-10" x2="'+(i*40-2)+'" y2="12" style="animation-delay:'+(i*.07).toFixed(2)+'s"/>';
  return '<rect class="sc-night" width="600" height="160" fill="#020512"/><rect class="sc-dust" width="600" height="160" fill="#c46a3a"/><rect class="sc-black" width="600" height="160" fill="#000"/><g class="sc-storm">'+st+'</g>';
}
function sceneSvg(k){
  var defs='<defs><linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#040818"/><stop offset="1" stop-color="#16256b"/></linearGradient><linearGradient id="skyM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b0f22"/><stop offset="1" stop-color="#8a4430"/></linearGradient><radialGradient id="sunG"><stop offset="0" stop-color="#fff6c8"/><stop offset=".35" stop-color="#ffd76a"/><stop offset="1" stop-color="#ffd76a" stop-opacity="0"/></radialGradient><radialGradient id="moonG" cx=".4" cy=".3"><stop offset="0" stop-color="#eef1f8"/><stop offset="1" stop-color="#8b94aa"/></radialGradient><linearGradient id="grdG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa2b5"/><stop offset="1" stop-color="#4b5265"/></linearGradient><linearGradient id="grdM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d98a5a"/><stop offset="1" stop-color="#7a3a22"/></linearGradient><radialGradient id="rockG" cx=".4" cy=".2"><stop offset="0" stop-color="#9b9084"/><stop offset="1" stop-color="#4f463e"/></radialGradient></defs>';
  var stars='<g class="sc-s sc-s1" fill="#fff" opacity=".85"><g>'+starsSvg(7,34,1)+'</g><g transform="translate(600 0)">'+starsSvg(7,34,1)+'</g></g><g class="sc-s sc-s2" fill="#fff" opacity=".5"><g>'+starsSvg(31,26,.7)+'</g><g transform="translate(600 0)">'+starsSvg(31,26,.7)+'</g></g>';
  var sun='<circle class="sc-sun" cx="540" cy="34" r="22" fill="url(#sunG)"/>';
  var bg='<rect width="600" height="160" fill="url(#'+(k==='base'?'skyM':'skyG')+')"/>';
  var body='';
  if(k==='lune'){
    body='<circle cx="300" cy="228" r="128" fill="url(#moonG)"/><ellipse cx="250" cy="150" rx="16" ry="6" fill="#7d869c" opacity=".6"/><ellipse cx="340" cy="140" rx="22" ry="7" fill="#7d869c" opacity=".55"/><ellipse cx="300" cy="125" rx="9" ry="3.5" fill="#7d869c" opacity=".6"/>'+
      '<ellipse cx="300" cy="92" rx="250" ry="34" fill="none" stroke="rgba(255,255,255,.2)" stroke-dasharray="3 6"/>'+
      '<circle cx="90" cy="40" r="9" fill="#3f8fd6"/><circle cx="87" cy="37" r="3" fill="#a9d3ff" opacity=".6"/>'+
      '<g><animateMotion dur="18s" repeatCount="indefinite" path="M50,92 A250,34 0 1 1 550,92 A250,34 0 1 1 50,92"/>'+shipSvg()+'</g>';
  }else if(k==='sol'){
    body='<circle cx="430" cy="34" r="10" fill="#3f8fd6"/><circle cx="427" cy="31" r="3.4" fill="#a9d3ff" opacity=".6"/>'+
      '<path d="M0 122 L80 108 L150 120 L240 104 L330 120 L420 106 L520 121 L600 112 V140 H0Z" fill="#4b5265" opacity=".6"/>'+
      '<path d="M0 124 Q150 114 300 122 T600 120 V160 H0Z" fill="url(#grdG)"/><ellipse cx="130" cy="140" rx="30" ry="6" fill="#3f4658" opacity=".6"/><ellipse cx="420" cy="146" rx="40" ry="7" fill="#3f4658" opacity=".6"/>'+
      '<line class="sc-beam" x1="250" y1="82" x2="425" y2="38"/>'+
      '<g transform="translate(240 126)">'+landerSvg()+'</g>'+
      '<g transform="translate(340 134)"><g class="sc-rover"><rect x="-14" y="-9" width="28" height="7" rx="2" fill="#d9dfec"/><rect class="sc-panel" x="-12" y="-14" width="14" height="4"/><line x1="8" y1="-9" x2="8" y2="-17" stroke="#d9dfec"/><circle cx="-9" cy="-1" r="3.4" fill="#2b3142"/><circle cx="0" cy="-1" r="3.4" fill="#2b3142"/><circle cx="9" cy="-1" r="3.4" fill="#2b3142"/></g></g>'+
      '<g transform="translate(490 124)"><line x1="0" y1="0" x2="0" y2="-22" stroke="#cfd8ee" stroke-width="1.5"/><rect x="0" y="-22" width="12" height="8" fill="#ffc12e"/></g>'+
      '<g transform="translate(300 118)">'+eva()+'</g>';
  }else if(k==='mars'){
    body='<circle cx="40" cy="30" r="26" fill="url(#sunG)"/><circle cx="150" cy="92" r="11" fill="#3f8fd6"/><circle cx="147" cy="89" r="3.4" fill="#a9d3ff" opacity=".6"/>'+
      '<circle cx="450" cy="92" r="16" fill="#c4573a"/><ellipse cx="450" cy="78" rx="7" ry="2.4" fill="#f1e3da"/><path d="M438 94q12-5 24 0" stroke="#8f3a24" stroke-width="2" fill="none"/>'+
      '<path d="M165 86Q300 -2 432 86" fill="none" stroke="rgba(255,255,255,.25)" stroke-dasharray="3 6"/>'+
      '<g id="shipT" style="transform:translate(165px,86px);transition:transform 1.2s ease">'+shipSvg()+'</g>'+
      '<g transform="translate(300 40)"><g class="sc-eva"></g></g>';
  }else if(k==='base'){
    body='<circle cx="520" cy="38" r="9" fill="#f1d9c8" opacity=".85"/><g transform="translate(0 40)"><circle class="sc-phobos" cx="0" cy="0" r="4.5" fill="#8d8176"/></g>'+
      '<path d="M0 118 L90 100 L170 116 L260 98 L360 116 L450 102 L540 117 L600 106 V140 H0Z" fill="#6b3a2a" opacity=".7"/>'+
      '<path d="M0 120 Q150 112 300 118 T600 116 V160 H0Z" fill="url(#grdM)"/>'+
      '<line class="sc-beam" x1="300" y1="96" x2="540" y2="38"/>'+
      '<g transform="translate(300 128)"><path d="M-40 0 A40 40 0 0 1 40 0Z" fill="rgba(215,230,255,.3)" stroke="#cfd8ee" stroke-width="2"/><rect class="sc-light" x="-24" y="-18" width="10" height="8" rx="1"/><rect class="sc-light" x="-5" y="-26" width="10" height="8" rx="1"/><rect class="sc-farm" x="14" y="-18" width="10" height="8" rx="1" fill="#5fd36a"/>'+fxHub(2,-44)+'</g>'+
      '<g transform="translate(400 128)"><polygon class="sc-panel" points="0,0 24,0 20,-14 -4,-14"/><polygon class="sc-panel" points="34,0 58,0 54,-14 30,-14"/><polygon class="sc-panel" points="68,0 92,0 88,-14 64,-14"/></g>'+
      '<g transform="translate(150 136)"><g class="sc-rover"><rect x="-14" y="-9" width="28" height="7" rx="2" fill="#e6d3c6"/><rect class="sc-panel" x="-12" y="-14" width="14" height="4"/><circle cx="-9" cy="-1" r="3.4" fill="#3a2118"/><circle cx="0" cy="-1" r="3.4" fill="#3a2118"/><circle cx="9" cy="-1" r="3.4" fill="#3a2118"/></g></g>'+
      '<g transform="translate(520 124)"><g class="sc-devil"><path d="M0 0q-9-14 5-26q-12-9 0-22" stroke="rgba(255,205,160,.55)" stroke-width="6" fill="none" stroke-linecap="round"/></g></g>'+
      '<g transform="translate(350 126)">'+eva()+'</g>';
  }else{
    body='<circle cx="60" cy="34" r="26" fill="url(#sunG)"/><polygon points="130,160 160,118 235,96 300,90 370,98 440,122 480,160" fill="url(#rockG)"/><ellipse cx="220" cy="130" rx="18" ry="6" fill="#3a332c" opacity=".7"/><ellipse cx="350" cy="122" rx="14" ry="5" fill="#3a332c" opacity=".7"/><ellipse cx="410" cy="144" rx="22" ry="6" fill="#3a332c" opacity=".7"/>'+
      '<line class="sc-beam" x1="300" y1="64" x2="540" y2="30"/>'+
      '<g class="sc-deb"><circle cx="190" cy="110" r="1.6" style="animation-delay:0s"/><circle cx="260" cy="100" r="1.2" style="animation-delay:1.2s"/><circle cx="340" cy="104" r="1.8" style="animation-delay:2.4s"/><circle cx="400" cy="112" r="1.4" style="animation-delay:3.6s"/><circle cx="450" cy="120" r="1.2" style="animation-delay:4.8s"/><circle cx="300" cy="96" r="1.5" style="animation-delay:6s"/></g>'+
      '<g transform="translate(300 96)"><g class="sc-drill"><line x1="0" y1="0" x2="0" y2="10" stroke="#ffd76a" stroke-width="2"/></g>'+landerSvg()+'</g>'+
      '<g transform="translate(360 100)">'+eva()+'</g>';
  }
  return defs+bg+stars+sun+body+overlays();
}
function sceneInit(k){
  var sv=$('#c-scSvg');sv.innerHTML=sceneSvg(k);
  $('#c-scene').setAttribute('data-mission',k);
  syncSvgPause();
  if(SH.S3&&SH.S3.ok){SH.S3.mount($('#c-scene'));SH.S3.scene('c:'+k,{});SH.S3.progress(0)}
}
function syncSvgPause(){
  var sv=$('#c-scSvg');
  try{if(sv&&sv.pauseAnimations){SH.fx?sv.unpauseAnimations():sv.pauseAnimations()}}catch(e){}
}
function sceneUpdate(pr){
  var sc=$('#c-scene');if(!sc||!S.G||!S.st)return;
  var G=S.G,m=G.m,st=S.st,pl=S.plan,ev=S.evtId;
  var mode=pr&&pr.mode?pr.mode.id:pl.mode;
  var o=curOpt(),bo=curBeatOpt();
  var burn=(ev==='landing'||ev==='liftoff'||ev==='orbit'||ev==='debris')||(o&&o.fuelPct>0)||(bo&&bo.fuelPct>0);
  var night=!!(m.solarMul&&m.solarMul[st.t]&&m.solarMul[st.t]<.6);
  var dustS=(m.key==='base'&&ev==='supply')||(m.surface&&st.dust>65);
  var evaOn=ev==='eva'||(o&&o.id==='out')||(bo&&bo.id==='eva')||(G.sides.indexOf('eva')>=0&&!st.sideDone.eva&&pl.h.annex>0);
  function set(k,v){sc.setAttribute('data-'+k,v?'1':'0')}
  sc.setAttribute('data-mode',mode);
  sc.setAttribute('data-act',pl.h.sci>=7?'hi':pl.h.sci<=3?'lo':'mid');
  set('storm',ev==='storm');set('night',night);set('dust',dustS);set('comms',ev==='comms');set('burn',burn);set('eva',evaOn);
  set('black',!!((pr&&pr.black)||st.black));set('farm',G.sides.indexOf('farm')>=0);
  sc.setAttribute('data-dmg',st.integ<35?'2':st.integ<60?'1':'0');
  var ship=$('#shipT');
  if(ship){var p=(st.t-1)/Math.max(1,m.turns-1),q=1-p;ship.style.transform='translate('+(q*q*165+2*q*p*300+p*p*432).toFixed(1)+'px,'+(q*q*86+2*q*p*26+p*p*86).toFixed(1)+'px)'}
  var fl=Object.keys(st.flags||{}).slice(-2).map(function(f){return FLAGL[f]}).join(' · ');
  $('#c-scCap').textContent=m.unit+' '+st.t+' sur '+m.turns+(fl?' · '+fl:'');
  if(SH.S3&&SH.S3.ok){SH.S3.progress((st.t-1)/Math.max(1,m.turns-1));SH.S3.sync(sc)}
}
var cineT=null;
function cutscene(txt){
  if(!SH.fx)return;
  var sc=$('#c-scene');if(!sc)return;
  $('#c-scTitle').textContent=txt;
  sc.classList.remove('cine');void sc.offsetWidth;sc.classList.add('cine');
  clearTimeout(cineT);cineT=setTimeout(function(){sc.classList.remove('cine')},2800);
}
var warpT=null;
function warp(){
  if(!SH.fx)return;
  if(SH.S3&&SH.S3.ok)SH.S3.cut();
  var sc=$('#c-scene');sc.classList.add('warp');clearTimeout(warpT);warpT=setTimeout(function(){sc.classList.remove('warp')},1100);
}

function finish(){
  var G=S.G,m=G.m,s=S.st,kind=S.endKind,done=S.doneTurns;
  var sc=scoreOf(G,s,kind,done),total=sc.total;
  var earned=kind==='complete'?Math.floor(total/10*G.df.credit)+2*sc.sideDone.length:Math.floor(3*done/m.turns);
  var oldBest=(P.done[m.key]&&P.done[m.key].best)||0;
  var unlocks=null;
  if(kind==='complete'&&total>=40&&oldBest<40){var i=ORDER.indexOf(m.key);if(i<ORDER.length-1&&!P.open)unlocks=MISSIONS[ORDER[i+1]].name}
  P.credits+=earned;
  P.done[m.key]={best:Math.max(oldBest,kind==='complete'?total:0),plays:((P.done[m.key]&&P.done[m.key].plays)||0)+1};
  saveP();
  S.final={total:total,kind:kind,why:S.endWhy,sc:sc,s:s,earned:earned};
  var rating=kind!=='complete'?'Mission interrompue':total>=85?'Commandant de mission':total>=65?'Pilote confirmé':total>=40?'Cadet prometteur':'À l\'entraînement';
  $('#c-endEyebrow').textContent='Bilan · '+m.name+' · '+G.df.name;
  $('#c-rating').textContent=rating;
  $('#c-scoreBig').textContent=total;
  var stn=kind==='complete'?starsOf(total):0;
  $('#c-endStars').innerHTML='★'.repeat(stn)+'<i style="font-style:normal;color:var(--line)">'+'★'.repeat(3-stn)+'</i>';
  $('#c-endLead').textContent=kind==='complete'?'L\'équipage rentre après '+m.turns+' '+m.unitL+'s. '+(s.sci>=G.target?'La cible de science est atteinte.':'Il manquait '+fmt(G.target-s.sci)+' points de science.'):S.endWhy+' La mission s\'arrête à : '+m.unit.toLowerCase()+' '+done+'.';
  $('#c-reward').innerHTML='<span class="credit">+'+earned+' crédits</span><span>'+(unlocks?'Nouvelle mission débloquée : '+unlocks+'.':kind==='complete'&&total<40?'Il faut 40 points pour débloquer la suite.':'Dépensez-les au hangar.')+'</span>';
  $('#c-brk').innerHTML=sc.parts.map(function(p){return '<div class="brk-r"><span>'+p[0]+'</span><span>'+fmt(p[1],1)+' / '+fmt(p[2],0)+'</span><div class="m-bar"><i style="width:'+(clamp(p[1]/p[2],0,1)*100)+'%"></i></div></div>'}).join('');
  var es=$('#c-endSides');
  if(G.sides.length){es.hidden=false;es.innerHTML='<h3>Missions annexes</h3>'+G.sides.map(function(id){var d=s.sideDone[id];return '<div class="sd'+(d?' fin':'')+'"><div class="t"><span>'+SIDE[id].n+'</span><span>'+(d?'Terminée · '+SIDE[id].r:'Non terminée · '+fmt(s.sideP[id]||0,1)+' / '+SIDE[id].target+' h')+'</span></div></div>'}).join('')}
  else es.hidden=true;
  var good=[],better=[];
  if(kind==='complete')good.push('Tout l\'équipage est rentré sain et sauf.');
  if(s.health>=70)good.push('La santé reste élevée : l\'exercice a été tenu.');
  if(s.moral>=70)good.push('Le moral de l\'équipe est resté bon.');
  if(s.sci>=G.target)good.push('Cible de science atteinte avec '+fmt(s.sci)+' points.');
  if(s.dose<m.doseLimit*.8)good.push('La dose de radiations reste sous contrôle.');
  if(sc.sideDone.length)good.push(sc.sideDone.length+' mission'+(sc.sideDone.length>1?'s annexes terminées':' annexe terminée')+'.');
  if(!good.length)good.push('Vous avez gardé l\'équipage en vie '+done+' '+m.unitL+'s.');
  if(kind!=='complete')better.push(S.endWhy);
  if(s.sci<G.target)better.push('Il manque de la science. Le mode Science et 7 heures de travail rapportent plus, au prix de la batterie et du moral.');
  if(s.health<50)better.push('La santé est basse : prévoyez au moins 2 heures d\'exercice par jour, ou embarquez un médecin.');
  if(s.moral<50)better.push('Le moral est bas : plus de repos, moins de journées à plus de 7 heures de science.');
  if(s.dose>m.doseLimit*.85)better.push('Les radiations ont presque atteint la limite. Réfugiez-vous dès l\'alerte solaire.');
  if(s.parts<=0)better.push('Vous avez épuisé les pièces de rechange. Chargez-en plus ou embarquez une ingénieure.');
  if(G.sides.length&&sc.sideDone.length<G.sides.length)better.push('Une mission annexe est restée inachevée. Prévoyez des heures annexes dès les premiers tours.');
  if(sc.left<.05&&kind==='complete')better.push('Vous êtes rentré presque sans réserve. Le mode Éco prolongé dévore l\'air et l\'eau.');
  if(!better.length)better.push('Visez la même mission en Expert, ou avec des missions annexes.');
  $('#c-good').innerHTML=good.slice(0,3).map(function(t){return '<li>'+t+'</li>'}).join('');
  $('#c-better').innerHTML=better.slice(0,3).map(function(t){return '<li>'+t+'</li>'}).join('');
  $('#c-best').textContent='Meilleur score en mission '+m.name+' : '+P.done[m.key].best+' / 100. Crédits disponibles : '+P.credits+'.';
  $('#c-copyMsg').textContent='';
  S.lastMission=m.key;
  SH.onCrewDone(m.key,total,kind==='complete');
  go('end');
  endChain();
  countUp($('#c-scoreBig'),total);
  if(kind==='complete'&&total>=40){say(total>=85?'Mission parfaite, commandant !':'Mission accomplie !','cheer',4400);confetti()}
  else say(kind==='complete'?'On fera mieux la prochaine fois.':'Mission interrompue… on retente ?','hurt',4400);
}
function summary(){
  var f=S.final,m=S.G.m;
  return 'Mission Cadet · '+m.name+' ('+S.G.df.name+') · '+f.total+'/100\nSanté '+Math.round(f.s.health)+' %, moral '+Math.round(f.s.moral)+' %, science '+fmt(f.s.sci)+'/'+S.G.target+' pts, dose '+fmt(f.s.dose,m.doseLimit<100?1:0)+' mSv.';
}
function copy(){
  var t=summary(),msg=$('#c-copyMsg');
  function fb(){
    var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();
    var ok=false;try{ok=document.execCommand('copy')}catch(e){}
    document.body.removeChild(ta);msg.textContent=ok?'Résumé copié.':'Copie impossible ici. Sélectionnez ce texte : '+t.replace(/\n/g,' ');
  }
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){msg.textContent='Résumé copié.'},fb)}else fb();
}


$('#mcRoot').addEventListener('click',function(e){
  var t=e.target;
  var sh=t.closest('[data-shell]');if(sh){SH.hub();return}
  var ip=t.closest('[data-ipick]');if(ip&&!ip.disabled){ipick(Number(ip.dataset.ipick));return}
  var ib=t.closest('[data-iback]');if(ib){var isp=IR;IR=null;$('#c-s-inter').hidden=true;if(isp&&isp.done)isp.done();return}
  var df=null;
  var cr=t.closest('[data-crew]');
  if(cr){var id=cr.dataset.crew,i=S.prep.crew.indexOf(id);if(i>=0)S.prep.crew.splice(i,1);else if(S.prep.crew.length<4)S.prep.crew.push(id);refreshBrief();return}
  var sd=t.closest('[data-side]');
  if(sd&&!sd.disabled){var sid=sd.dataset.side,j=S.prep.sides.indexOf(sid);if(j>=0)S.prep.sides.splice(j,1);else if(S.prep.sides.length<2)S.prep.sides.push(sid);refreshBrief();return}
  var ld=t.closest('[data-ld]');
  if(ld&&!ld.disabled){var l=ld.dataset.ld,d=Number(ld.dataset.d);S.prep.ld[l]=Math.max(0,(S.prep.ld[l]||0)+d);refreshBrief();return}
  var md=t.closest('[data-mode]');if(md&&!md.disabled&&S.screen==='play'){S.plan.mode=md.dataset.mode;refresh();return}
  var op=t.closest('[data-opt]');if(op&&!op.disabled){S.optId=op.dataset.opt;refresh();return}
  var bo=t.closest('[data-bopt]');if(bo&&!bo.disabled){S.beatOptId=bo.dataset.bopt;refresh();return}
  var ps=t.closest('[data-preset]');if(ps){var p=presets()[Number(ps.dataset.preset)][1];S.plan.h={sci:p.sci,maint:p.maint,ex:p.ex,rest:p.rest,annex:p.annex};if(!sidesLeft().length){S.plan.h.rest+=S.plan.h.annex;S.plan.h.annex=0}refresh();return}
  var hb=t.closest('[data-h]');
  if(hb&&!hb.disabled){var k=hb.dataset.h,dd=Number(hb.dataset.d),h=S.plan.h;
    if(dd>0&&hoursUsed()<HPT)h[k]=(h[k]||0)+1;else if(dd<0&&(h[k]||0)>0)h[k]-=1;
    refresh();return}
});
$('#c-hintSwitch').addEventListener('click',function(){S.prep.hints=!S.prep.hints;refreshBrief()});
$('#c-loadRec').addEventListener('click',function(){S.prep.ld=Object.assign({},LD_REC);refreshBrief()});
$('#c-startBtn').addEventListener('click',startMission);
$('#c-validate').addEventListener('click',validate);
$('#c-nextBtn').addEventListener('click',next);
$('#c-againBtn').addEventListener('click',function(){S.prep=newPrep();go('brief')});
$('#c-copyBtn').addEventListener('click',copy);

function endChain(){
  var box=$('#c-endChain'),f=S.final,k=S.mkey;
  var nx=SH.nextAfterCrew(k);
  box.hidden=false;
  box.innerHTML='<div class="sec-h"><h3>Suite du programme</h3></div>'+(nx?'<p>'+nx.text+'</p><div class="row">'+nx.btn+'</div>':'<p class="fine">Retournez au programme pour choisir la prochaine étape.</p>');
}

/* ---------- relais Cadet <-> Atelier ---------- */
function addMod(st,id){st.mods=(st.mods||[]).filter(function(x){return x.id!==id});st.mods.push({id:id,t:MODS[id].t})}
function cl(v,a,b){return Math.max(a,Math.min(b,v))}
function ck(go,n,t){return {go:!!go,n:n,t:t}}
function engBack(){SH.transit('Équipage','Retour à la mission',function(){go('play');beginTurn()})}
function engFor(){
  var G=S.G,st=S.st,m=G.m,t=st.t,E=S.eng;
  if(!E||t<2||t>=m.turns)return null;
  var ev=S.sched[t];if(ev==='landing'||ev==='liftoff'||ev==='orbit'||ev==='storm')return null;
  if(E.n>=3||t-E.last<2)return null;
  var fl=st.flags||{},kind=null,burnT={lune:5,mars:6}[m.key];
  if(st.integ<58&&!E.done.repair)kind='repair';
  else if(st.dose>.55*m.doseLimit&&!E.done.shield)kind='shield';
  else if((st.bat<30||st.black)&&!E.done.power)kind='power';
  else if(burnT&&(t>=burnT||(fl.drift&&t>=3))&&!E.done.burn)kind='burn';
  if(!kind)return null;
  E.done[kind]=1;E.last=t;E.n++;
  var sp=SPEC[kind]();sp.kind=kind;sp.scene=SCN[m.key];sp.done=engBack;return sp;
}
var SCN={lune:'moon',sol:'moon',mars:'mars',base:'mars',ast:'ast'};
var SPEC={
  burn:function(){
    var G=S.G,st=S.st,m=G.m,fl=st.flags||{},V=S.vessel,isp=(V&&V.isp)||320,need=fl.drift?95:60,rb=G.K.rollBonus;
    function dvOf(c){return Math.round(isp*9.81*Math.log(1/(1-.35*Math.min(.9,c/Math.max(1,st.fuel)))))}
    var defs=[['Poussée courte',4,.62,'Peu d\'ergols, précision moyenne.'],['Poussée standard',7,.84,'Le bon compromis entre ergols et précision.'],['Poussée longue de précision',11,.92,'Très précise, mais gourmande en ergols.']];
    var opts=defs.map(function(d){
      var c=Math.round(d[1]/100*G.stock.fuel*G.K.fuelMul*10)/10,dv=dvOf(c),left=st.fuel-c,p=cl(d[2]+rb-(dv<need?.28:0),.05,.97);
      return {n:d[0],d:d[3],meta:['Ergols −'+fmt(c,1)+' kg','Δv ≈ '+dv+' m/s'],pct:p,disabled:left<m.fuelBase*.5,fx:'burn',
        checks:[ck(dv>=need,'Δv suffisant',dv+' m/s pour '+need+' requis'),ck(left>=m.fuelBase,'Réserve d\'ergols',fmt(Math.max(0,left),1)+' kg restants (minimum '+m.fuelBase+' kg)'),ck(p>=.7,'Fiabilité de la manœuvre',Math.round(p*100)+' %'),ck(!(V&&V.lm<=.5)||true,'Liaison avec le sol',V&&V.lm>.5?'solide (+4 %)':'standard')],
        run:function(){
          st.fuel=Math.max(0,st.fuel-c);var ok=Math.random()<p,effs=[{t:'Ergols −'+fmt(c,1)+' kg',g:-1}];
          if(ok){st.flags=Object.assign({},st.flags);delete st.flags.drift;st.flags.precise=true;addMod(st,'safeOrbit');effs.push({t:'Trajectoire corrigée',g:1},{t:'Trajectoire dégagée : manœuvres +10 %',g:1});
            return {title:d[0],roll:{ok:true,p:p},txt:'La poussée se déroule comme prévu. Le vaisseau retrouve sa trajectoire.',effs:effs}}
          st.flags=Object.assign({},st.flags,{drift:true});addMod(st,'jam');st.integ=Math.max(0,st.integ-3);effs.push({t:'Trajectoire dérivée',g:-1},{t:'Liaison dégradée',g:-1},{t:'Vaisseau −3',g:-1});
          return {title:d[0],roll:{ok:false,p:p},txt:'La poussée est imprécise : la trajectoire dérive et la liaison se dégrade.',effs:effs}}}});
    opts.push({n:'Reporter la manœuvre',d:'Rien ne change pour l\'instant.',meta:['Aucun ergol'],pct:null,checks:[ck(false,'Trajectoire','dérive non corrigée')],run:function(){st.flags=Object.assign({},st.flags,{drift:true});return {title:'Manœuvre reportée',txt:'On garde le cap actuel. L\'écart risque de grandir.',effs:[{t:'Trajectoire dérivée',g:-1}]}}});
    return {step:'Atelier · correction de trajectoire',eyebrow:'Relais · Atelier Orbital',tag:'Manœuvre',title:'Correction de trajectoire',text:'Le sol détecte un écart de trajectoire'+(fl.drift?' qui s\'est aggravé':'')+'. Il faut calculer une poussée avec l\'équation de la fusée : '+need+' m/s sont nécessaires.',cine:'Atelier · Trajectoire',say:'L\'Atelier prend le relais : calcule la poussée !',back:'Retour à la mission',opts:opts};
  },
  power:function(){
    var G=S.G,st=S.st,m=G.m,rb=G.K.rollBonus,prod=G.solar;
    var opts=[
      {n:'Délester les charges',d:'On coupe l\'inutile. La batterie remonte, l\'équipe est moins efficace.',meta:['Demande 7 kW'],pct:null,fx:'power',checks:[ck(prod>=7,'Bilan énergie','production '+fmt(prod,1)+' kW pour 7 kW demandés'),ck(true,'Équipage','moral −2 pendant 3 tours')],run:function(){st.bat=cl(st.bat+22,0,100);st.black=false;addMod(st,'survival');return {title:'Charges délestées',txt:'Seules les fonctions vitales restent alimentées.',effs:[{t:'Batterie +22',g:1},{t:'Mode survie',g:-1}]}}},
      {n:'Réorienter les panneaux',d:'Plus de soleil pendant 5 tours, mais la manœuvre peut mal tourner.',meta:['Réussite incertaine'],pct:cl(.74+rb,.05,.97),fx:'power',checks:[ck(true,'Orientation','manœuvre sur les moteurs d\'attitude'),ck(.74+rb>=.7,'Fiabilité',Math.round(cl(.74+rb,.05,.97)*100)+' %')],run:function(){var p=cl(.74+rb,.05,.97),ok=Math.random()<p;if(ok){addMod(st,'solarFix');st.bat=cl(st.bat+8,0,100);return {title:'Réorientation',roll:{ok:true,p:p},txt:'Les panneaux retrouvent le Soleil.',effs:[{t:'Panneaux optimisés : production +20 %',g:1},{t:'Batterie +8',g:1}]}}
        st.integ=Math.max(0,st.integ-4);st.bat=cl(st.bat-4,0,100);return {title:'Réorientation',roll:{ok:false,p:p},txt:'Le mouvement fatigue la structure.',effs:[{t:'Vaisseau −4',g:-1},{t:'Batterie −4',g:-1}]}}},
      {n:'Brancher la batterie d\'appoint',d:'Utilise une pièce de rechange.',meta:['Pièce −1'],pct:null,disabled:st.parts<1,fx:'power',checks:[ck(st.parts>=1,'Pièces de rechange',st.parts+' disponible'+(st.parts>1?'s':'')),ck(true,'Capacité','+5 par tour pendant 5 tours')],run:function(){st.parts-=1;addMod(st,'nightBat');st.bat=cl(st.bat+10,0,100);st.black=false;return {title:'Batterie d\'appoint',txt:'Le module d\'appoint est branché.',effs:[{t:'Pièce −1',g:-1},{t:'Batteries d\'appoint',g:1},{t:'Batterie +10',g:1}]}}}];
    return {step:'Atelier · reconfiguration énergétique',tag:'Énergie',title:'Reconfiguration énergétique',text:'La batterie est basse ('+Math.round(st.bat)+' %). L\'Atelier vérifie le bilan d\'énergie avant de reconfigurer le vaisseau.',cine:'Atelier · Énergie',say:'Énergie basse : c\'est le moment de reconfigurer !',back:'Retour à la mission',opts:opts};
  },
  shield:function(){
    var G=S.G,st=S.st,m=G.m,V=S.vessel,rb=G.K.rollBonus,wc=Math.round(st.water*.05*10)/10,hasS=!!(V&&V.shield);
    var opts=[
      {n:'Abri d\'eau',d:'Les réserves d\'eau servent de bouclier pendant plusieurs tours.',meta:['Eau −'+fmt(wc,1)],pct:null,fx:'shield',checks:[ck(st.water-wc>=.2*G.stock.water,'Réserve d\'eau',fmt(st.water-wc,1)+' restants'),ck(true,'Protection','radiations −25 % pendant 6 tours')],run:function(){st.water=Math.max(0,st.water-wc);addMod(st,'shieldW');return {title:'Abri d\'eau',txt:'L\'équipe s\'abrite derrière les réserves d\'eau.',effs:[{t:'Eau −'+fmt(wc,1),g:-1},{t:'Abri d\'eau : radiations −25 %',g:1}]}}},
      {n:'Blindage du vaisseau',d:hasS?'Votre vaisseau a un blindage : redéploiement sans risque.':'Pas de blindage embarqué : le résultat est incertain.',meta:[hasS?'Sans risque':'Réussite incertaine'],pct:hasS?null:cl(.55+rb,.05,.97),fx:'shield',checks:[ck(hasS,'Blindage embarqué',hasS?'oui (conçu à l\'Atelier)':'non'),ck(true,'Protection','radiations −25 % pendant 6 tours')],run:function(){var p=hasS?1:cl(.55+rb,.05,.97),ok=Math.random()<p;if(ok){addMod(st,'shieldW');st.moral=cl(st.moral+1,0,100);return {title:'Blindage',roll:hasS?null:{ok:true,p:p},txt:'Le blindage est redéployé autour du poste de vie.',effs:[{t:'Abri : radiations −25 %',g:1},{t:'Moral +1',g:1}]}}
        st.dose+=.03*m.doseLimit;st.moral=cl(st.moral-3,0,100);return {title:'Blindage',roll:{ok:false,p:p},txt:'Le blindage ne se déploie pas à temps.',effs:[{t:'Dose reçue en hausse',g:-1},{t:'Moral −3',g:-1}]}}},
      {n:'Accepter le risque',d:'On poursuit sans précaution.',meta:['Aucun coût'],pct:null,checks:[ck(false,'Dose cumulée',Math.round(st.dose/m.doseLimit*100)+' % de la limite')],run:function(){return {title:'Risque accepté',txt:'L\'équipe poursuit sans protection supplémentaire.',effs:[{t:'Dose inchangée',g:-1}]}}}];
    return {step:'Atelier · protection contre les radiations',tag:'Radiations',title:'Protection contre les radiations',text:'La dose cumulée atteint '+Math.round(st.dose/m.doseLimit*100)+' % de la limite de la mission. L\'Atelier propose des protections.',cine:'Atelier · Blindage',say:'Radiations en hausse : protège l\'équipage !',back:'Retour à la mission',opts:opts};
  },
  repair:function(){
    var G=S.G,st=S.st,V=S.vessel,rb=G.K.rollBonus,hasR=!!(V&&V.red);
    var opts=[
      {n:'Remplacer le module',d:'Une pièce de rechange remet le système à neuf.',meta:['Pièce −1'],pct:null,disabled:st.parts<1,fx:'repair',checks:[ck(st.parts>=1,'Pièces de rechange',st.parts+' disponible'+(st.parts>1?'s':'')),ck(true,'Remise en état','vaisseau +18')],run:function(){st.parts-=1;st.integ=cl(st.integ+18,0,100);return {title:'Module remplacé',txt:'Le module défaillant est remplacé.',effs:[{t:'Pièce −1',g:-1},{t:'Vaisseau +18',g:1}]}}},
      {n:'Basculer sur la redondance',d:hasR?'Votre vaisseau a un système redondant : bascule sûre.':'Pas de système redondant : bascule risquée.',meta:[hasR?'Sans risque':'Réussite incertaine'],pct:hasR?null:cl(.5+rb,.05,.97),fx:'repair',checks:[ck(hasR,'Redondance embarquée',hasR?'oui (conçue à l\'Atelier)':'non'),ck(true,'Remise en état','vaisseau +12')],run:function(){var p=hasR?1:cl(.5+rb,.05,.97),ok=Math.random()<p;if(ok){st.integ=cl(st.integ+12,0,100);return {title:'Redondance',roll:hasR?null:{ok:true,p:p},txt:'Le système de secours prend le relais.',effs:[{t:'Vaisseau +12',g:1}]}}
        st.integ=Math.max(0,st.integ-4);return {title:'Redondance',roll:{ok:false,p:p},txt:'La bascule échoue et abîme un peu plus le vaisseau.',effs:[{t:'Vaisseau −4',g:-1}]}}},
      {n:'Cannibaliser un instrument',d:'On sacrifie de la science pour sauver le vaisseau.',meta:['Science −6'],pct:null,fx:'repair',checks:[ck(true,'Remise en état','vaisseau +10'),ck(false,'Science','−6 pts et liaison dégradée')],run:function(){st.integ=cl(st.integ+10,0,100);st.sci=Math.max(0,st.sci-6);addMod(st,'jam');return {title:'Instrument sacrifié',txt:'Des pièces de l\'instrument réparent le système.',effs:[{t:'Vaisseau +10',g:1},{t:'Science −6',g:-1},{t:'Liaison dégradée',g:-1}]}}}];
    return {step:'Atelier · réparation',tag:'Réparation',title:'Atelier de réparation',text:'Le vaisseau est à '+Math.round(st.integ)+' %. L\'Atelier évalue les options de réparation.',cine:'Atelier · Réparation',say:'Le vaisseau souffre : réparons-le !',back:'Retour à la mission',opts:opts};
  }
};
/* interlude Cadet (ouvert depuis le vol de l'Atelier) */
var IR=null;
function iSvgStr(k){var s=sceneSvg(k),ids=[];s.replace(/id="(\w+)"/g,function(_,i){ids.push(i)});ids.forEach(function(i){s=s.split('id="'+i+'"').join('id="i'+i+'"').split('url(#'+i+')').join('url(#i'+i+')')});return s}
function interlude(sp){
  IR=sp;sp.picked=false;
  ['brief','play','end'].forEach(function(k){$('#c-s-'+k).hidden=true});
  var sec=$('#c-s-inter');sec.hidden=false;SH.showMod('mc');
  SH.setStep('crew',sp.step||'Équipage');
  var key=sp.scene||'lune',sc=$('#c-iScene');
  $('#c-iSvg').innerHTML=iSvgStr(key);sc.setAttribute('data-mission',key);
  ['storm','night','dust','comms','burn','eva','black','farm'].forEach(function(k){sc.setAttribute('data-'+k,'0')});
  if(sp.kind==='crew_eva')sc.setAttribute('data-eva','1');
  $('#c-iEye').textContent=sp.eyebrow||'Relais · Mission Cadet';$('#c-iTitle').textContent=sp.title;$('#c-iCap').textContent=sp.tag||'Équipage';
  var bx=$('#c-iBox');bx.hidden=false;$('#c-iRes').hidden=true;
  bx.innerHTML='<span class="tag">'+esc(sp.tag||'Équipage')+'</span><h3>'+esc(sp.title)+'</h3><p>'+esc(sp.text)+'</p><div class="opts" role="radiogroup" aria-label="Votre décision">'+sp.opts.map(function(o,k){return '<button type="button" class="opt" role="radio" aria-checked="false" data-ipick="'+k+'"'+(o.disabled?' disabled':'')+'><span class="o-n">'+esc(o.n)+'</span>'+(o.meta||[]).map(function(x){return '<span class="o-m">'+esc(x)+'</span>'}).join('')+'<span class="o-d">'+esc(o.d)+'</span></button>'}).join('')+'</div>';
  sec.classList.remove('enter');void sec.offsetWidth;sec.classList.add('enter');
  if(SH.fx){$('#c-iScTitle').textContent=sp.cine||'';sc.classList.remove('cine');void sc.offsetWidth;sc.classList.add('cine');setTimeout(function(){sc.classList.remove('cine')},2800)}
  if(SH.S3&&SH.S3.ok){SH.S3.mount(sc);SH.S3.scene('c:'+key,{inter:true});SH.S3.progress(.5);SH.S3.sync(sc)}
  SH.say(sp.say||'L\'équipage a besoin de toi !','alert',3200);
  window.scrollTo(0,0);
}
function ipick(k){
  var sp=IR;if(!sp||sp.picked)return;var o=sp.opts[k];if(!o||o.disabled)return;sp.picked=true;
  var r=o.run();
  $('#c-iBox').hidden=true;var rb=$('#c-iRes');rb.hidden=false;rb.className='evt'+(r.roll&&!r.roll.ok?' alert':'');
  rb.innerHTML='<span class="tag">'+(r.roll?(r.roll.ok?'Réussi':'Raté'):'Décision prise')+'</span><h3>'+esc(r.title)+'</h3><p>'+esc(r.txt||'')+'</p>'+(r.effs&&r.effs.length?'<ul class="fxl">'+r.effs.map(function(e){return '<li class="fxc '+(e.g>0?'gd':e.g<0?'bd':'')+'">'+esc(e.t)+'</li>'}).join('')+'</ul>':'')+'<div class="row"><button class="btn pri" data-iback="1">'+esc(sp.back||'Continuer')+'</button></div>';
  if(r.roll&&!r.roll.ok){say('Aïe… raté.','hurt',3200);flash()}else{say('Bien joué !','cheer',2400);flash('good')}
  if(SH.S3&&SH.S3.burst)SH.S3.burst(r.roll&&!r.roll.ok?'bad':'good');
}

function open(key,vessel){
  S.mkey=key;S.vessel=vessel||null;S.prep=newPrep();go('brief');
}
function missionList(){return ORDER.map(function(k){var m=MISSIONS[k],d=P.done[k];return {key:k,name:m.name,sub:m.sub,level:m.level,best:d?d.best:0,plays:d?d.plays:0,stars:d?starsOf(d.best):0,unlocked:isUnlocked(k),turns:m.turns,unitL:m.unitL}})}
return {interlude:interlude,open:open,missionList:missionList,UP:UP,upStore:function(){return P.up},syncFx:syncSvgPause,ORDER:ORDER,MISSIONS:MISSIONS,isUnlocked:isUnlocked};
})();
SH.AO=AO;SH.MC=MC;hdr();applyFx();stars();SH.hub();requestAnimationFrame(pupLoop);
// Micro-interactions discrètes pour les commandes du site.
document.addEventListener('click',function(ev){var b=ev.target.closest('button,.opt');if(!b||b.disabled)return;b.classList.remove('ao-tap');void b.offsetWidth;b.classList.add('ao-tap');setTimeout(function(){b.classList.remove('ao-tap')},260)});
})();
