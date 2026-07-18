const PROGRAM_START = localStorage.getItem('dreamfitStart') || new Date().toISOString().slice(0,10);
localStorage.setItem('dreamfitStart', PROGRAM_START);

const days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const shortDays = ['D','L','M','M','J','V','S'];

const workouts = {
  1:{title:'Pectoraux · Épaules · Triceps',subtitle:'Push + cardio 30 min',exercises:[['Développé incliné haltères','4 × 8–10'],['Développé couché','4 × 8–10'],['Poulie vis-à-vis','3 × 12–15'],['Pompes','2 séries à l’échec'],['Élévations latérales','5 × 15–20'],['Développé haltères','3 × 10'],['Oiseau','4 × 15'],['Extension corde','4 × 12'],['Barre EZ','3 × 10']]},
  2:{title:'Dos · Biceps · Abdos',subtitle:'Pull complet',exercises:[['Tractions assistées','4 séries'],['Rowing poitrine','4 × 10'],['Tirage vertical','4 × 12'],['Rowing poulie','3 × 12'],['Curl incliné','4 × 10'],['Curl marteau','3 × 12'],['Gainage','3 × 1 min']]},
  3:{title:'Jambes',subtitle:'Leg day + cardio 20 min',exercises:[['Presse','4 × 12'],['Soulevé de terre roumain','4 × 10'],['Leg curl','4 × 12'],['Leg extension','4 × 15'],['Mollets','5 × 15']]},
  4:{title:'Repos actif',subtitle:'10 000 pas · étirements · mobilité',exercises:[['Marche','10 000 pas'],['Étirements','5 à 10 min'],['Mobilité','10 min']]},
  5:{title:'Pectoraux · Épaules · Triceps',subtitle:'Même structure que lundi, variantes',exercises:[['Développé incliné machine','4 × 8–10'],['Développé haltères plat','4 × 8–10'],['Écartés poulie basse','3 × 12–15'],['Pompes serrées','2 séries à l’échec'],['Élévations latérales poulie','5 × 15–20'],['Développé épaules machine','3 × 10'],['Oiseau poulie','4 × 15'],['Extension triceps unilatérale','4 × 12'],['Barre EZ front','3 × 10']]},
  6:{title:'Dos · Bras',subtitle:'Pull + bras',exercises:[['Tirage vertical prise neutre','4 × 10'],['Rowing machine','4 × 10'],['Tirage horizontal','3 × 12'],['Pull-over poulie','3 × 15'],['Curl incliné','4 × 10'],['Curl marteau','3 × 12'],['Extension corde','4 × 12'],['Curl barre EZ','3 × 10']]},
  0:{title:'Repos · Marche · Gainage',subtitle:'Récupération active',exercises:[['Marche','10 000 pas'],['Gainage','3 × 1 min'],['Étirements','5 à 10 min'],['Photos progression','Face · profil · dos']]}
};

const mealsTraining = [
  {name:'Petit-déjeuner',time:'Matin',items:[['Skyr','250 g'],['Whey','40 g'],['Banane','1'],['Café sans sucre','1']]},
  {name:'Déjeuner',time:'Midi',items:[['Poulet','250 g'],['Riz cuit','220 g'],['Crudités','À volonté'],['Skyr','1 pot'],['Coca zéro','Autorisé']]},
  {name:'Collation',time:'Après-midi',items:[['Whey','30 g'],['Fruit','1']]},
  {name:'Dîner',time:'Soir',items:[['Viande blanche ou poisson','250 g'],['Légumes','À volonté'],['Féculents cuits','100 g']]},
  {name:'Avant coucher',time:'Soirée',items:[['Fromage blanc ou Skyr','250 g']]}
];
const mealsRest = mealsTraining.map((m,i)=>i===3?{...m,items:[['Viande blanche ou poisson','250 g'],['Légumes','À volonté'],['Féculents','Aucun']]}:m);

const rules = [
  ['Ne rate jamais deux repas','Même sans faim, les protéines passent avant tout.'],['Ne rate jamais deux entraînements','Si une séance saute, fais-la le lendemain.'],['Protéines à chaque repas','Minimum 40 à 50 g par repas principal.'],['Bois 4 litres','Tous les jours, sans exception.'],['Dors au moins 7 h 30','Objectif quotidien : 8 heures.'],['Marche 10 000 pas','Tous les jours.'],['Cardio 3 fois par semaine','30 minutes par séance.'],['Pèse-toi 3 fois par semaine','Lundi, mercredi et samedi, au réveil à jeun.'],['Photo chaque dimanche','Même endroit, lumière et pose.'],['Aucun alcool','Pendant les six mois.'],['Pas de cheat day','Un seul repas libre autorisé.'],['Note tout','Chaque repas, séance et pesée.']
];

const state = JSON.parse(localStorage.getItem('dreamfitState') || '{}');
state.date = state.date || new Date().toISOString().slice(0,10);
if(state.date !== new Date().toISOString().slice(0,10)) Object.assign(state,{date:new Date().toISOString().slice(0,10),water:0,steps:0,meals:{},habits:{},exercises:{},cardio:false});
state.water ??= 0; state.steps ??= 0; state.meals ??= {}; state.habits ??= {}; state.exercises ??= {}; state.weights ??= [];
const save=()=>localStorage.setItem('dreamfitState',JSON.stringify(state));

function missionDay(){const a=new Date(PROGRAM_START+'T12:00:00'),b=new Date();return Math.max(1,Math.min(180,Math.floor((b-a)/86400000)+1));}
function currentDay(){return new Date().getDay();}
function setProgress(id,value,max){document.getElementById(id).style.width=Math.min(100,value/max*100)+'%';}

function renderDashboard(){
  const d=currentDay(),w=workouts[d];
  document.getElementById('todayLabel').textContent=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'}).format(new Date()).toUpperCase();
  document.getElementById('missionDay').textContent=missionDay();
  const completedMeals=Object.values(state.meals).filter(Boolean).length;
  const calories=Math.round(completedMeals*(2400/5)), protein=Math.round(completedMeals*(200/5));
  caloriesValue.textContent=calories; proteinValue.textContent=protein; waterValue.textContent=state.water.toFixed(1).replace('.',','); stepsValue.textContent=state.steps.toLocaleString('fr-FR');
  setProgress('caloriesBar',calories,2400);setProgress('proteinBar',protein,200);setProgress('waterBar',state.water,4);setProgress('stepsBar',state.steps,10000);
  const score=Math.round((Math.min(calories/2400,1)+Math.min(protein/200,1)+Math.min(state.water/4,1)+Math.min(state.steps/10000,1)+Object.values(state.habits).filter(Boolean).length/4)/5*100);
  scoreValue.textContent=score;scoreRing.style.setProperty('--score',score);
  workoutTitle.textContent=w.title;
  workoutPreview.innerHTML=`<span class="meal-time">${days[d]}</span><h3>${w.title}</h3><p>${w.subtitle}</p><div class="exercise-chips">${w.exercises.slice(0,4).map(x=>`<span>${x[0]}</span>`).join('')}</div>`;
  const habits=[['Sommeil','7 h 30 minimum'],['Créatine','5 g aujourd’hui'],['Magnésium','Le soir'],['Aucun alcool','Objectif 180 jours']];
  habitList.innerHTML=habits.map((h,i)=>`<label class="habit-row"><input type="checkbox" data-habit="${i}" ${state.habits[i]?'checked':''}><div><strong>${h[0]}</strong><small>${h[1]}</small></div></label>`).join('');
}

function renderMeals(type='training'){
  const list=type==='training'?mealsTraining:mealsRest;
  mealList.innerHTML=list.map((m,i)=>`<article class="meal-card ${state.meals[i]?'done':''}"><div class="meal-top"><div><span class="meal-time">${m.time}</span><h3>${m.name}</h3></div><button class="meal-check" data-meal="${i}">${state.meals[i]?'✓':''}</button></div><ul>${m.items.map(x=>`<li><span>${x[0]}</span><b>${x[1]}</b></li>`).join('')}</ul></article>`).join('');
}

function renderWorkout(selected=currentDay()){
  const w=workouts[selected]; fullWorkoutTitle.textContent=w.title;fullWorkoutSubtitle.textContent=w.subtitle;
  weekStrip.innerHTML=shortDays.map((s,i)=>`<button class="${i===selected?'active':''}" data-weekday="${i}"><span>${s}</span><strong>${i===0?7:i}</strong></button>`).join('');
  exerciseList.innerHTML=w.exercises.map((e,i)=>`<article class="exercise-card ${state.exercises[selected+'-'+i]?'done':''}"><div><h3>${e[0]}</h3><p>${e[1]}</p></div><button class="check-btn" data-exercise="${selected}-${i}">✓</button></article>`).join('');
  document.querySelector('[data-check="cardio"]').classList.toggle('done',!!state.cardio);
}

function renderRules(){rulesList.innerHTML=rules.map((r,i)=>`<article class="rule-item"><div class="rule-number">${i+1}</div><div><h3>${r[0]}</h3><p>${r[1]}</p></div></article>`).join('');}
function renderProgress(){
  const last=state.weights.at(-1);currentWeight.textContent=last?last.value.toFixed(1)+' kg':'—';
  weightTrend.textContent=state.weights.length>1?`${(last.value-state.weights[0].value).toFixed(1)} kg depuis le départ`:'Aucune donnée';
  const c=weightChart,ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=1;for(let y=30;y<c.height;y+=65){ctx.beginPath();ctx.moveTo(20,y);ctx.lineTo(c.width-20,y);ctx.stroke()}
  if(!state.weights.length){ctx.fillStyle='#7f8798';ctx.font='24px Inter';ctx.fillText('Ajoute ta première pesée',190,170);return}
  const vals=state.weights.map(x=>x.value),min=Math.min(...vals,92)-1,max=Math.max(...vals,98)+1;ctx.strokeStyle='#6f8cff';ctx.lineWidth=5;ctx.lineJoin='round';ctx.beginPath();vals.forEach((v,i)=>{const x=30+i*(c.width-60)/Math.max(1,vals.length-1),y=20+(max-v)/(max-min)*(c.height-50);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();
}

function navigate(name){document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.dataset.screen===name));document.querySelectorAll('.bottom-nav button').forEach(x=>x.classList.toggle('active',x.dataset.nav===name));window.scrollTo({top:0,behavior:'smooth'});if(name==='progress')renderProgress();}

document.addEventListener('click',e=>{
  const nav=e.target.closest('[data-nav]');if(nav)navigate(nav.dataset.nav);
  const act=e.target.closest('[data-action]');if(act){if(act.dataset.action==='water')state.water=Math.min(6,state.water+.5);if(act.dataset.action==='steps')state.steps=Math.min(30000,state.steps+1000);save();renderDashboard()}
  const meal=e.target.closest('[data-meal]');if(meal){state.meals[meal.dataset.meal]=!state.meals[meal.dataset.meal];save();renderMeals(document.querySelector('.day-toggle .active').dataset.daytype);renderDashboard()}
  const habit=e.target.closest('[data-habit]');if(habit){state.habits[habit.dataset.habit]=habit.checked;save();renderDashboard()}
  const ex=e.target.closest('[data-exercise]');if(ex){state.exercises[ex.dataset.exercise]=!state.exercises[ex.dataset.exercise];save();renderWorkout(Number(ex.dataset.exercise.split('-')[0]))}
  const wd=e.target.closest('[data-weekday]');if(wd)renderWorkout(Number(wd.dataset.weekday));
  const dtype=e.target.closest('[data-daytype]');if(dtype){document.querySelectorAll('[data-daytype]').forEach(x=>x.classList.remove('active'));dtype.classList.add('active');renderMeals(dtype.dataset.daytype)}
  if(e.target.closest('[data-check="cardio"]')){state.cardio=!state.cardio;save();renderWorkout(currentDay())}
});

resetDayBtn.onclick=()=>{if(confirm('Réinitialiser les données du jour ?')){Object.assign(state,{water:0,steps:0,meals:{},habits:{},exercises:{},cardio:false});save();renderAll()}};
addWeightBtn.onclick=()=>weightDialog.showModal();
weightForm.addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return;const value=parseFloat(weightInput.value);if(value){state.weights.push({date:new Date().toISOString().slice(0,10),value});save();weightInput.value='';setTimeout(renderProgress,0)}});
sundayBtn.onclick=()=>{sundayBtn.textContent='Bilan enregistré ✓';sundayBtn.disabled=true;localStorage.setItem('dreamfitSunday',new Date().toISOString().slice(0,10))};

function renderAll(){renderDashboard();renderMeals();renderWorkout();renderRules();renderProgress()}
renderAll();
