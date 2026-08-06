const STORAGE_KEYS = {
  session:'fas_session_v4_5',
  customers:'fas_customers_v4_5',
  templatePrefix:'fas_whatsapp_template_v4_5_'
};

function loadSession(){
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || 'null');
}
function saveSession(value){
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(value));
}
function clearSession(){
  localStorage.removeItem(STORAGE_KEYS.session);
}
function loadCustomers(){
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.customers) || '[]');
}
function saveCustomers(value){
  localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(value));
}
function templateKey(username){
  return STORAGE_KEYS.templatePrefix + username;
}
function loadWhatsappTemplate(username){
  return localStorage.getItem(templateKey(username)) || DEFAULT_WHATSAPP_TEMPLATE;
}
function saveWhatsappTemplate(username,value){
  localStorage.setItem(templateKey(username), value);
}
function resetWhatsappTemplate(username){
  localStorage.removeItem(templateKey(username));
}
function makeId(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}
