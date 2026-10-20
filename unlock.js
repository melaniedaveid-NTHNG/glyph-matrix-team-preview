const form=document.getElementById('form'),password=document.getElementById('password'),unlock=document.getElementById('unlock'),error=document.getElementById('error');
const bytes=value=>Uint8Array.from(atob(value),character=>character.charCodeAt(0));
document.getElementById('show').onclick=()=>{const visible=password.type==='password';password.type=visible?'text':'password';document.getElementById('show').textContent=visible?'Hide':'Show';document.getElementById('show').setAttribute('aria-label',visible?'Hide password':'Show password');document.getElementById('show').setAttribute('aria-pressed',String(visible));};
form.onsubmit=async event=>{
 event.preventDefault();error.textContent='';unlock.disabled=true;unlock.textContent='Unlocking…';
 try{
  if(!globalThis.crypto?.subtle)throw Error('unsupported');
  const response=await fetch('payload.json',{cache:'no-store'});if(!response.ok)throw Error('network');const payload=await response.json();
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password.value.trim()),'PBKDF2',false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:bytes(payload.salt),iterations:payload.iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
  let decrypted;try{decrypted=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(payload.iv)},key,bytes(payload.data));}catch{throw Error('password');}
  const frame=document.createElement('iframe');frame.title='Glyph Matrix Lab simulator';frame.setAttribute('sandbox','allow-scripts allow-downloads');frame.srcdoc=new TextDecoder().decode(decrypted);document.body.append(frame);password.value='';document.getElementById('gate').hidden=true;document.getElementById('lock').hidden=false;
 }catch(e){error.textContent=e.message==='password'?'That password didn’t match. Please try again.':e.message==='unsupported'?'Open this page in a current browser using HTTPS.':'Could not load the preview. Check your connection and try again.';password.focus();}
 finally{unlock.disabled=false;unlock.textContent='Open simulator →';}
};
document.getElementById('lock').onclick=()=>{document.querySelector('iframe')?.remove();document.getElementById('gate').hidden=false;document.getElementById('lock').hidden=true;error.textContent='';password.focus();};
