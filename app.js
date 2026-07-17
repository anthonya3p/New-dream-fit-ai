const DEFAULTS = {
  profile:{name:'Anthony',weight:98.2,targetWeight:92,startWeight:104},
  goals:{calories:2400,protein:200,water:4,steps:10000,sleep:8},
  today:{calories:1840,protein:162,carbs:165,fat:58,water:2.8,steps:8243,sleep:7.2,score:86},
  meals:[
    {id:'breakfast',name:'Petit-déjeuner',kcal:542,desc:'Skyr, whey, banane, beurre de cacahuète',done:true},
    {id:'lunch',name:'Déjeuner',kcal:723,desc:'Riz basmati, poulet, légumes',done:true},
    {id:'snack',name:'Collation',kcal:248,desc:'Skyr, Nocciolata, amandes',done:true},
    {id:'dinner',name:'Dîner',kcal:330,desc:'Saumon, patate douce, légumes',done:true}
  ],
  schedule:{
    0:{type:'WALK',subtitle:'Marche · gainage',muscle:'push'},
    1:{type:'PUSH',subtitle:'Pectoraux · épaules · triceps',muscle:'push'},
    2:{type:'PULL',subtitle:'Dos · biceps · arrière épaules',muscle:'pull'},
    3:{type:'LEGS',subtitle:'Jambes · fessiers · mollets',muscle:'legs'},
    4:{type:'CARDIO',subtitle:'Cardio · mobilité',muscle:'legs'},
    5:{type:'PUSH',subtitle:'Pectoraux · épaules · triceps',muscle:'push'},
    6:{type:'BACK + ARMS',subtitle:'Dos · biceps · triceps',muscle:'pull'}
  },
  exercises:{
    PUSH:[{name:'Développé couché',sets:3},{name:'Développé incliné',sets:3},{name:'Écarté poulie',sets:3},{name:'Élévations latérales',sets:4},{name:'Extension triceps',sets:3}],
    PULL:[{name:'Tirage vertical',sets:4},{name:'Rowing poulie',sets:4},{name:'Rowing haltère',sets:3},{name:'Curl incliné',sets:3},{name:'Oiseau poulie',sets:3}],
    LEGS:[{name:'Presse à cuisses',sets:4},{name:'Leg curl',sets:4},{name:'Fentes',sets:3},{name:'Leg extension',sets:3},{name:'Mollets',sets:4}],
    'BACK + ARMS':[{name:'Tirage vertical',sets:4},{name:'Rowing poulie',sets:4},{name:'Curl marteau',sets:3},{name:'Extension triceps',sets:3}],
    CARDIO:[{name:'Cardio',sets:1}], WALK:[{name:'Marche',sets:1},{name:'Gainage',sets:3}]
  },
  workoutLog:{},
  weights:[104,103.1,102.4,101.7,100.8,100.2,99.7,99.3,98.9,98.6,98.2]
};

const STORAGE_KEY='dreamfit_ai_premium_v1';
let state=loadState();
let route='home';

function loadState(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved?deepMerge(structuredClone(DEFAULTS),saved):structuredClone(DEFAULTS);
  }catch{return structuredClone(DEFAULTS)}
}
function deepMerge(base,extra){
  for(const [k,v] of Object.entries(extra||{})){
    if(v && typeof v==='object' && !Array.isArray(v) && typeof base[k]==='object') deepMerge(base[k],v); else base[k]=v;
  }
  return base;
}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function fmt(n,d=0){return Number(n).toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d})}
function todayWorkout(){return state.schedule[new Date().getDay()]||state.schedule[1]}
function setRoute(next){route=next;document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.route===next));render();window.scrollTo({top:0,behavior:'smooth'})}

document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>setRoute(btn.dataset.route)));
const modal=document.getElementById('modal');
function openModal(html){document.getElementById('modalContent').innerHTML=html;modal.showModal()}
function closeModal(){modal.close()}

function render(){
  const app=document.getElementById('app');
  app.innerHTML = ({home:homeView,nutrition:nutritionView,workout:workoutView,progress:progressView,more:moreView}[route])();
  bindViewEvents();
}

function homeView(){
  const t=state.today,p=state.profile,g=state.goals;
  const remaining=Math.max(0,g.calories-t.calories);
  const pct=Math.round(((p.startWeight-p.weight)/(p.startWeight-p.targetWeight))*100);
  return `<section class="screen">
    <div class="score-wrap"><div class="score-ring" style="--score:${t.score}"><div class="score-center"><div class="score-value">${t.score}</div><small>/100</small><b>Score du jour<br>Excellent 🔥</b></div></div></div>
    <div class="card progress-card">
      <div class="between"><div><div class="mini-label">Poids actuel</div><strong>${fmt(p.weight,1)} kg</strong><div class="accent-green mini-label">-${fmt(p.startWeight-p.weight,1)} kg depuis le départ</div></div><div style="text-align:right"><div class="mini-label">Objectif</div><strong>${fmt(p.targetWeight,1)} kg</strong><div class="mini-label">${fmt(p.weight-p.targetWeight,1)} kg restants</div></div></div>
      <div class="progress-bar"><span style="width:${Math.max(0,Math.min(100,pct))}%"></span></div>
    </div>
    <div class="metric-grid">
      ${metric('🔥','Calories restantes',remaining,'/ '+fmt(g.calories)+' kcal','accent-orange')}
      ${metric('🥦','Protéines',t.protein+' g','/ '+g.protein+' g','accent-green')}
      ${metric('💧','Eau',fmt(t.water,1)+' L','/ '+g.water+' L','accent-blue')}
      ${metric('👟','Pas',fmt(t.steps),'/ '+fmt(g.steps),'accent-purple')}
    </div>
    <button class="primary-btn" style="margin-top:16px" data-action="go-workout">▶ Commencer l’entraînement</button>
  </section>`;
}
function metric(icon,label,val,foot,cls){return `<div class="metric"><div class="metric-label">${icon} ${label}</div><div class="metric-value ${cls}">${val}</div><div class="metric-foot">${foot}</div></div>`}

function nutritionView(){
  const t=state.today,g=state.goals;
  return `<section class="screen"><h2 class="screen-title">Nutrition</h2><p class="screen-subtitle">Aujourd’hui</p>
    <div class="card macro-card">
      <div class="between"><div><div class="mini-label">Résumé du jour</div><div class="metric-value">${fmt(t.calories)} <small style="font-size:14px;color:var(--muted)">/ ${fmt(g.calories)} kcal</small></div></div><strong class="accent-purple">${Math.round(t.calories/g.calories*100)}%</strong></div>
      <div class="progress-bar"><span style="width:${Math.min(100,t.calories/g.calories*100)}%"></span></div>
      <div class="metric-grid" style="margin-top:18px">${metric('','Protéines',t.protein+' g','/ '+g.protein+' g','accent-green')}${metric('','Glucides',t.carbs+' g','objectif 260 g','accent-blue')}${metric('','Lipides',t.fat+' g','objectif 70 g','accent-orange')}</div>
    </div>
    <div class="section-head"><h2>Mes repas</h2><button class="icon-btn" data-action="add-meal">+</button></div>
    <div class="meal-list">${state.meals.map((m,i)=>`<button class="meal-row" data-meal="${m.id}" style="text-align:left;color:inherit"><div class="meal-thumb"></div><div><h3>${m.name}</h3><p><strong>${m.kcal} kcal</strong><br>${m.desc}</p></div><span class="check">✓</span></button>`).join('')}</div>
  </section>`;
}

function workoutView(){
  const w=todayWorkout(), list=state.exercises[w.type]||[];
  return `<section class="screen"><h2 class="screen-title">Entraînement</h2><p class="screen-subtitle">Programme du jour</p>
    <div class="card workout-visual"><div class="copy"><div class="mini-label">Aujourd’hui</div><div class="workout-type">${w.type}</div><p>${w.subtitle}</p></div><img src="assets/muscles/${w.muscle}.svg" alt="Illustration des muscles travaillés"><button class="primary-btn" data-action="start-workout">▶ Commencer la séance</button></div>
    <div class="section-head"><h2>Exercices</h2><button class="icon-btn" data-action="add-exercise">+</button></div>
    <div>${list.map((e,i)=>exerciseCard(e,i,w.type)).join('')}</div>
    <button class="secondary-btn" style="margin-top:14px" data-action="finish-workout">Terminer la séance</button>
  </section>`;
}
function exerciseCard(e,i,type){
  const key=`${type}-${i}`;const l=state.workoutLog[key]||{};
  return `<article class="card exercise-card"><div class="exercise-head"><h3>${e.name}</h3><span class="status">${l.done?'Terminé':'À faire'}</span></div><div class="fields"><div class="field"><label>kg</label><input inputmode="decimal" data-log="weight" data-key="${key}" value="${l.weight??''}"></div><div class="field"><label>reps</label><input inputmode="numeric" data-log="reps" data-key="${key}" value="${l.reps??''}"></div><div class="field"><label>séries</label><input inputmode="numeric" data-log="sets" data-key="${key}" value="${l.sets??e.sets}"></div></div><button class="primary-btn" style="margin-top:16px" data-complete="${key}">${l.done?'✓ Exercice validé':'Valider l’exercice'}</button></article>`;
}

function progressView(){
  const p=state.profile;const values=state.weights;const min=94,max=105;const pts=values.map((v,i)=>`${20+i*(300/(values.length-1))},${205-(v-min)/(max-min)*170}`).join(' ');
  const area=`20,205 ${pts} 320,205`;
  return `<section class="screen"><h2 class="screen-title">Progrès</h2><div class="segmented"><button class="active">Poids</button><button>Mensurations</button><button>Photos</button></div>
    <div class="card chart-card"><div class="between"><div><div class="metric-value">${fmt(p.weight,1)} kg</div><div class="mini-label">Poids actuel</div></div><div style="text-align:right"><div class="accent-green metric-value" style="font-size:20px">-${fmt(p.startWeight-p.weight,1)} kg</div><div class="mini-label">depuis le départ</div></div></div>
    <svg class="chart" viewBox="0 0 340 230" role="img" aria-label="Courbe du poids"><defs><linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8b3dff" stop-opacity=".42"/><stop offset="1" stop-color="#8b3dff" stop-opacity="0"/></linearGradient></defs><g class="chart-grid">${[40,80,120,160,200].map(y=>`<line x1="20" y1="${y}" x2="320" y2="${y}"/>`).join('')}</g><polygon class="chart-area" points="${area}"/><polyline class="chart-line" points="${pts}"/>${values.map((v,i)=>`<circle class="chart-dot" cx="${20+i*(300/(values.length-1))}" cy="${205-(v-min)/(max-min)*170}" r="4"/>`).join('')}</svg></div>
    <div class="card progress-card"><div class="between"><div><strong>Objectif ${p.targetWeight} kg</strong><div class="mini-label">${fmt(p.weight-p.targetWeight,1)} kg restants</div></div><strong>67 %</strong></div><div class="progress-bar"><span></span></div></div>
    <button class="primary-btn" style="margin-top:14px" data-action="add-weight">Ajouter une pesée</button>
  </section>`;
}

function moreView(){return `<section class="screen"><h2 class="screen-title">Plus</h2><p class="screen-subtitle">Réglages et données</p><div class="menu-list">
  ${['Objectifs','Rappels','Statistiques','Exporter mes données','Importer mes données','Photos de progression','À propos de DreamFit AI'].map(x=>`<button class="menu-item" data-menu="${x}"><span>${x}</span><span>›</span></button>`).join('')}
  <button class="menu-item" style="color:var(--danger)" data-action="reset"><span>Réinitialiser les données</span><span>›</span></button></div></section>`}

function bindViewEvents(){
  document.querySelector('[data-action="go-workout"]')?.addEventListener('click',()=>setRoute('workout'));
  document.querySelector('[data-action="add-weight"]')?.addEventListener('click',showWeightModal);
  document.querySelector('[data-action="add-meal"]')?.addEventListener('click',showMealModal);
  document.querySelector('[data-action="add-exercise"]')?.addEventListener('click',showExerciseModal);
  document.querySelector('[data-action="finish-workout"]')?.addEventListener('click',()=>{state.today.score=Math.min(100,state.today.score+5);save();alert('Séance enregistrée.');render()});
  document.querySelectorAll('[data-log]').forEach(input=>input.addEventListener('change',e=>{const key=e.target.dataset.key;state.workoutLog[key]??={};state.workoutLog[key][e.target.dataset.log]=e.target.value;save()}));
  document.querySelectorAll('[data-complete]').forEach(btn=>btn.addEventListener('click',e=>{const key=e.currentTarget.dataset.complete;state.workoutLog[key]??={};state.workoutLog[key].done=!state.workoutLog[key].done;save();render()}));
  document.querySelector('[data-action="reset"]')?.addEventListener('click',()=>{if(confirm('Réinitialiser toutes les données ?')){localStorage.removeItem(STORAGE_KEY);state=structuredClone(DEFAULTS);render()}});
  document.querySelectorAll('[data-menu]').forEach(b=>b.addEventListener('click',()=>handleMenu(b.dataset.menu)));
}
function showWeightModal(){openModal(`<h2>Ajouter une pesée</h2><label>Poids actuel (kg)</label><input id="newWeight" type="number" step="0.1" value="${state.profile.weight}"><div class="modal-actions"><button class="secondary-btn" value="cancel">Annuler</button><button class="primary-btn" type="button" id="saveWeight">Enregistrer</button></div>`);document.getElementById('saveWeight').onclick=()=>{const v=parseFloat(document.getElementById('newWeight').value);if(Number.isFinite(v)){state.profile.weight=v;state.weights.push(v);save();closeModal();render()}}}
function showMealModal(){openModal(`<h2>Ajouter un repas</h2><label>Nom</label><input id="mealName" placeholder="Ex. Collation"><label>Calories</label><input id="mealKcal" type="number" inputmode="numeric"><label>Description</label><textarea id="mealDesc" rows="3"></textarea><div class="modal-actions"><button class="secondary-btn" value="cancel">Annuler</button><button class="primary-btn" type="button" id="saveMeal">Ajouter</button></div>`);document.getElementById('saveMeal').onclick=()=>{state.meals.push({id:crypto.randomUUID(),name:document.getElementById('mealName').value||'Repas',kcal:Number(document.getElementById('mealKcal').value)||0,desc:document.getElementById('mealDesc').value||'',done:true});save();closeModal();render()}}
function showExerciseModal(){const type=todayWorkout().type;openModal(`<h2>Ajouter un exercice</h2><label>Nom</label><input id="exerciseName" placeholder="Ex. Développé militaire"><label>Nombre de séries</label><input id="exerciseSets" type="number" value="3"><div class="modal-actions"><button class="secondary-btn" value="cancel">Annuler</button><button class="primary-btn" type="button" id="saveExercise">Ajouter</button></div>`);document.getElementById('saveExercise').onclick=()=>{state.exercises[type]??=[];state.exercises[type].push({name:document.getElementById('exerciseName').value||'Nouvel exercice',sets:Number(document.getElementById('exerciseSets').value)||3});save();closeModal();render()}}
function handleMenu(name){
  if(name==='Exporter mes données'){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='dreamfit-donnees.json';a.click();URL.revokeObjectURL(a.href);return}
  if(name==='Importer mes données'){const i=document.createElement('input');i.type='file';i.accept='.json';i.onchange=()=>{const r=new FileReader();r.onload=()=>{try{state=deepMerge(structuredClone(DEFAULTS),JSON.parse(r.result));save();render();alert('Données importées.')}catch{alert('Fichier invalide.')}};r.readAsText(i.files[0])};i.click();return}
  alert(`${name} sera disponible dans la prochaine étape.`)
}

const d=new Date();document.getElementById('todayLabel').textContent=d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
render();
