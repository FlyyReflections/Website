function toggleForm(id){const f=document.getElementById(id);if(f)f.classList.toggle('hidden');}
const WEBHOOK='https://flyyreflections.vercel.app/api/webhook'; // update if your domain changes

function formToObject(form){return Object.fromEntries(new FormData(form).entries());}

function submitKit(e){
  e.preventDefault();
  const payload=formToObject(e.target);
  fetch(WEBHOOK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'kit_order',payload})})
    .then(()=>{e.target.reset();document.getElementById('kitSuccess')?.classList.remove('hidden');setTimeout(()=>document.getElementById('kitSuccess')?.classList.add('hidden'),3500);})
    .catch(()=>alert('Please try again in a moment.'));
}

function submitEvent(e){
  e.preventDefault();
  const payload=formToObject(e.target);
  fetch(WEBHOOK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'event_request',payload})})
    .then(()=>{e.target.reset();document.getElementById('eventSuccess')?.classList.remove('hidden');setTimeout(()=>document.getElementById('eventSuccess')?.classList.add('hidden'),3500);})
    .catch(()=>alert('Please try again in a moment.'));
}
