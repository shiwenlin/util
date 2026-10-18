// 验收：新增品类「家用消毒液/84消毒液」—— 识别 / 下拉 / 词池 / 标题生成
const fs=require('fs');
const html=fs.readFileSync('个护家清标题工作台.html','utf8');
let src=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const k=src.lastIndexOf('})();');
src=src.slice(0,k)+'\nglobalThis.__GC=guessCat;globalThis.__CAT=CAT;globalThis.__ST=state;globalThis.__RUN=run;globalThis.__LAST=()=>LAST;globalThis.__PF=poolFor;globalThis.__CLEN=clen;globalThis.__DP=doParse;\n'+src.slice(k);

const store={};
function el(id){ if(store[id])return store[id]; const e={id,value:'',textContent:'',innerHTML:'',checked:false,style:{},options:[],children:[],files:[],
  classList:{_s:new Set(),add(c){e.classList._s.add(c);},remove(c){e.classList._s.delete(c);},contains(c){return e.classList._s.has(c);}},
  appendChild(c){e.children.push(c);return c;},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},focus(){},click(){},
  setAttribute(a,v){e['_attr_'+a]=v;},getAttribute(a){return e['_attr_'+a]==null?null:e['_attr_'+a];}}; store[id]=e; return e; }
global.document={getElementById:el,createElement:t=>{const e=el('x'+Math.random());e.tagName=String(t).toUpperCase();return e;},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},body:{appendChild(){},style:{}}};
global.window={addEventListener(){},location:{href:''},isSecureContext:true};
Object.defineProperty(global,'navigator',{value:{clipboard:{writeText:()=>Promise.resolve()}},configurable:true,writable:true});
global.alert=()=>{};
el('cat2').value='E1'; el('cat3').value='multi'; el('month').value='11'; el('brand').value='蓝月亮';
new Function(src)();

const GC=globalThis.__GC, CAT=globalThis.__CAT, st=globalThis.__ST, PF=globalThis.__PF, clen=globalThis.__CLEN, LAST=globalThis.__LAST;
let bad=0; const fail=m=>{console.log('   ❌ '+m);bad++;}; const ok=m=>console.log('   ✅ '+m);

console.log('===== 1. 品类库已登记 =====');
if(CAT.E1.sub.disinfect) ok('CAT.E1.sub.disinfect 存在：'+CAT.E1.sub.disinfect.n); else fail('CAT.E1.sub.disinfect 不存在');
const d=CAT.E1.sub.disinfect||{};
['sell','crowd','scene','specHint','ban','sea'].forEach(f=>{
  if(Array.isArray(d[f])&&d[f].length||typeof d.sea==='object'&&f==='sea') ok('字段 '+f+' 有效');
  else if(f!=='sea'&&Array.isArray(d[f])&&d[f].length) ok('字段 '+f+' 有效('+d[f].length+')');
  else fail('字段 '+f+' 缺失/为空');
});
const subs=Object.keys(CAT.E1.sub).length+Object.keys(CAT.D.sub).length+Object.keys(CAT.A2.sub).length;
console.log('   品类总数：27 → '+subs+'（A2 '+Object.keys(CAT.A2.sub).length+' / D '+Object.keys(CAT.D.sub).length+' / E1 '+Object.keys(CAT.E1.sub).length+'）');
if(subs===28) ok('品类数 27→28'); else fail('品类数不对：'+subs);

console.log('\n===== 2. 商品名识别 =====');
const cases=[
  ['蓝月亮84消毒液','E1','disinfect'],
  ['84消毒液','E1','disinfect'],
  ['蓝月亮 84 消毒液 1.2kg','E1','disinfect'],
  ['威露士衣物除菌液','D','disliquid'],   // 不能被 84 规则抢走
  ['滴露衣物消毒液','D','disliquid'],
  ['蓝月亮84消毒液除菌家居','E1','disinfect'],
  ['蓝月亮洗衣液','D','liquid'],           // 旧规则不被影响
  ['蓝月亮洗手液','A2','handwash'],
  ['蓝月亮洗洁精','E1','dish'],
  ['蓝月亮洁厕灵','E1','toilet']
];
cases.forEach(([name,e2,e3])=>{
  const g=GC(name);
  const got=g?g.join('/'):'null';
  const pass=g && g[0]===e2 && g[1]===e3;
  console.log('   '+name+' → '+got+(pass?' ✅':(' ❌ 应为 '+e2+'/'+e3)));
  if(!pass) fail('识别错误：'+name);
});

console.log('\n===== 3. 该品类下完整跑一遍生成 =====');
el('cat2').value='E1'; el('cat3').value='disinfect'; el('month').value='11';
el('pname').value='蓝月亮84消毒液'; el('brand').value='蓝月亮';
el('research').value='功能点：含氯配方 去渍增白 除异味 浓缩 去黄\n人群：母婴 养宠家庭 有老人小孩家庭\n场景：拖地 卫生间 马桶 厨房台面 白色衣物浸泡\n热搜词：84消毒液家用 84消毒液拖地 消毒液除霉斑 含氯消毒液家庭装';
globalThis.__DP();
el('skus').value='84消毒液500g单瓶\n84消毒液1.2kg单瓶\n84消毒液500g*2瓶 | 29.9\n84消毒液2kg大桶';
el('specAll').value='1.2kg'; el('hero').value='0';
globalThis.__RUN();
const L=LAST();
console.log('   商品标题候选：'+L.titles.length+' 条');
L.titles.slice(0,3).forEach(t=>console.log('     · '+t.text+'  ('+(t.len||clen(t.text))+'字符)'));
const overT=L.titles.filter(t=>(t.len||clen(t.text))>60);
if(overT.length===0) ok('商品标题全部 ≤60 字符'); else fail('商品标题超 60：'+overT.map(t=>t.text).join(' / '));
if(L.titles.every(t=>/消毒液|84/.test(t.text))) ok('标题均含品类核心词'); else fail('有标题缺核心词：'+L.titles.map(t=>t.text).join(' | '));

console.log('\n===== 4. SKU 搜索标题 =====');
if(!L.skus||!L.skus.length) fail('SKU 结果为空');
L.skus.forEach(s=>{
  const c=clen(s.title);
  console.log('     · '+s.title+'  ('+c+'字符'+(c>30?' ❌ 超30':'')+')  备选'+((s.alts||[]).length)+'条');
  if(c>30) fail('SKU 标题超 30 字符：'+s.title);
});
if(L.skus.every(s=>(s.alts||[]).length===3)) ok('每个 SKU 均有 3 条备选'); else fail('备选项不足 3 条');

console.log('\n===== 5. 词池可取 =====');
const ps=PF('sell'), pc=PF('crowd'), pn=PF('scene');
console.log('   卖点池('+ps.length+')：'+ps.slice(0,10).join(' '));
console.log('   人群池('+pc.length+')：'+pc.join(' '));
console.log('   场景池('+pn.length+')：'+pn.join(' '));
if(ps.length>=6) ok('卖点池词量足够'); else fail('卖点池词太少：'+ps.length);
if(pn.length>=4) ok('场景池词量足够'); else fail('场景池词太少：'+pn.length);
if(pc.length>=3) ok('人群池词量足够'); else fail('人群池词太少：'+pc.length);

console.log('\n===== 6. 禁用/资质提示 =====');
console.log('   该品类 ban 提示：'+(d.ban||[]).join(' / '));
if((d.ban||[]).some(b=>b.indexOf('消字号')>-1)) ok('已提示消字号资质要求'); else fail('缺消字号提示');

console.log(bad?('\n❌ 失败 '+bad+' 项'):'\n✅ 全部通过');
