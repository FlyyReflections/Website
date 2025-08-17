// Smooth scroll (if you want to use it on links/buttons)
function go(id){const el=document.getElementById(id); if(el) el.scrollIntoView({behavior:'smooth'});}

// Toggle form visibility
function toggleForm(id){const f=document.getElementById(id); if(f) f.classList.toggle('hidden');}

// Send forms to your webhook (set to your live domain)
const WEBHOOK = 'https://flyyreflections.vercel.app/api/webhook';

// Helper: serialize form
function formToObject(form){return Object.fromEntries(new FormData(form).entries());}

// Kit order submit
function submitKit(e){
  e.preventDefault();
  const payload = formToObject(e.target);
  fetch(WEBHOOK,{
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ type:'kit_order', payload })
  }).then(()=>{
    e.target.reset();
    document.getElementById('kitSuccess')?.classList.remove('hidden');
    setTimeout(()=>document.getElementById('kitSuccess')?.classList.add('hidden'),3500);
  }).catch(()=>alert('Something went wrong. Try again in a moment.'));
}

// Event request submit
function submitEvent(e){
  e.preventDefault();
  const payload = formToObject(e.target);
  fetch(WEBHOOK,{
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ type:'event_request', payload })
  }).then(()=>{
    e.target.reset();
    document.getElementById('eventSuccess')?.classList.remove('hidden');
    setTimeout(()=>document.getElementById('eventSuccess')?.classList.add('hidden'),3500);
  }).catch(()=>alert('Something went wrong. Try again in a moment.'));
}
