const fs = require('fs');
const path = require('path');
const DB_FILE = path.join(__dirname, 'matulmada-db.json');
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ orders: [], sms_log: [] }, null, 2));
  }
}
function readDB() { initDB(); return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
function writeDB(data) { fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2)); }
function genId() { return Date.now(); }
function createOrder(order) {
  const db = readDB();
  const newOrder = { id: genId(), ...order, status: 'pending', sms_received: null, sms_amount: null, sms_sender: null, created_at: new Date().toISOString(), validated_at: null };
  db.orders.push(newOrder);
  writeDB(db);
  return newOrder;
}
function getOrderByRef(ref) { return readDB().orders.find(o => o.ref === ref) || null; }
function getOrders(status) { const o = readDB().orders.sort((a,b) => new Date(b.created_at)-new Date(a.created_at)); return status ? o.filter(x => x.status===status) : o; }
function updateOrder(id, updates) { const db = readDB(); const i = db.orders.findIndex(o => o.id==id); if(i===-1) return false; db.orders[i]={...db.orders[i],...updates}; writeDB(db); return db.orders[i]; }
function findPendingOrderByAmount(mga) { return readDB().orders.filter(o=>o.status==='pending'&&o.amount_mga===mga).sort((a,b)=>new Date(a.created_at)-new Date(b.created_at))[0]||null; }
function logSMS(from, message, parsed, matched) { const db=readDB(); db.sms_log.push({id:genId(),from_number:from,message,parsed:parsed?1:0,matched_order:matched||null,received_at:new Date().toISOString()}); if(db.sms_log.length>100) db.sms_log=db.sms_log.slice(-100); writeDB(db); }
function getSMSLog() { return readDB().sms_log.sort((a,b)=>new Date(b.received_at)-new Date(a.received_at)).slice(0,50); }
function getStats() { const o=readDB().orders; return { pending:o.filter(x=>x.status==='pending').length, success:o.filter(x=>x.status==='success').length, rejected:o.filter(x=>x.status==='rejected').length, total:o.length, volume:o.filter(x=>x.status==='success').reduce((s,x)=>s+x.amount_usd,0), sms_count:readDB().sms_log.length }; }
module.exports = { createOrder, getOrderByRef, getOrders, updateOrder, findPendingOrderByAmount, logSMS, getSMSLog, getStats };
