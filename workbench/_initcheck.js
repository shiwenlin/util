// 验收：换商品重新识别 → 自动初始化；placeholder 示例
const fs=require('fs');
let src=fs.readFileSync('个护家清标题工作台.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const k=src.lastIndexOf('})();');
src=src.slice(0,k)+'\nglobalThis.__DP=doParse;globalThis.__ST=state;globalThis.__RUN=run;globalThis.__LAST=()=>LAST;globalThis.__DIRTY=isDirty;globalThis.__RESET=resetAll;\n'+src.slice(k);

const store={};
function el(id){ if(store[id])return store[id]; const e={id,value:'',textContent:'',innerHTML:'',checked:false,style:{},options:[],children:[],files:[],
  classList:{_s:new Set(),add(c){e.classList._s.add(c);},remove(c){e.classList._s.delete(c);},contains(c){return e.classList._s.has(c);}},
  appendChild(c){e.children.push(c);return c;},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},focus(){},click(){},
  setAttribute(a,v){e['_attr_'+a]=v;},getAttribute(a){return e['_attr_'+a]==null?null:e['_attr_'+a];}}; store[id]=e; return e; }
global.document={getElementById:el,createElement:t=>{const e=el('x'+Math.random());e.tagName=String(t).toUpperCase();e.options=[];return e;},querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},body:{appendChild(){},style:{}}};
global.window={addEventListener(){},location:{href:''},isSecureContext:true};
Object.defineProperty(global,'navigator',{value:{clipboard:{writeText:()=>Promise.resolve()}},configurable:true,writable:true});
global.alert=()=>{};
el('cat2').value='D'; el('cat3').value='liquid'; el('month').value='10';
new Function(src)();
const state=globalThis.__ST;
let bad=0; const fail=m=>{console.log('   ❌ '+m);bad++;}; const ok=m=>console.log('   ✅ '+m);

console.log('===== 1. placeholder 示例 =====');
const html=fs.readFileSync('个护家清标题工作台.html','utf8');
const ta=html.match(/<textarea id="skus"[^>]*>/);
const sp=html.match(/<input type="text" id="specAll"[^>]*>/);
if(ta&&/placeholder="[^"]*&#10;/.test(ta[0])) ok('SKU 清单 placeholder 为多行具体示例'); else fail('SKU 清单 placeholder 缺失或非多行');
if(ta&&/\| *39\.9/.test(ta[0])) ok('SKU 示例含价格写法（500ml*2瓶 | 39.9）'); else fail('SKU 示例未体现价格写法');
if(sp&&/placeholder="例：500ml\*2瓶"/.test(sp[0])) ok('规格概览 placeholder = 例：500ml*2瓶'); else fail('规格概览 placeholder 缺失');
if(ta[0].indexOf('>')===ta[0].length-1) ok('SKU 清单无预填值（只有 placeholder）'); else fail('SKU 清单又有预填值了');

console.log('\n===== 2. 首次识别（干净状态不该乱清）=====');
el('pname').value='蓝月亮洗衣液';
store['btnGuess'].onclick();
if(el('brand').value==='蓝月亮') ok('自动填品牌：'+el('brand').value); else fail('品牌未自动填');
if(state.lastPname==='蓝月亮洗衣液') ok('记录 lastPname'); else fail('lastPname 未记录');

console.log('\n===== 3. 填内容 + 解析 + 生成 =====');
el('research').value='功能点：去血渍 去汗味 浓缩\n人群：学生 家庭主妇\n场景：宿舍 机洗 家用\n热搜词：洗衣液学生宿舍专用 洗衣液去血渍';
globalThis.__DP();
el('skus').value='500g单瓶\n1kg瓶\n500g*2瓶'; el('specAll').value='500g'; el('hero').value='0';
globalThis.__RUN();
const st=globalThis.__ST;
if((st.vals.sell||[]).length) ok('卖点已选 '+st.vals.sell.length+' 个'); else fail('解析后卖点为空');
if(globalThis.__LAST()) ok('已生成结果（LAST 非空）'); else fail('未生成结果');
if(globalThis.__DIRTY()) ok('isDirty() = true'); else fail('isDirty 应返回 true');

console.log('\n===== 4. 换商品重新识别 → 自动清空 =====');
const OLD=['去血渍','去汗味','浓缩','学生','家庭主妇','宿舍','机洗','家用'];   // 上一个商品（洗衣液）的词
el('pname').value='威露士洗手液';
store['btnGuess'].onclick();
['specAll','skus','research'].forEach(id=>{
  if(el(id).value==='') ok(id+' 已清空'); else fail(id+' 未清空：'+JSON.stringify(el(id).value.slice(0,20)));
});
if(el('brand').value!=='蓝月亮') ok('品牌已换成新商品的「'+el('brand').value+'」（旧值蓝月亮已清）'); else fail('旧品牌残留');
const after=st.vals.sell.concat(st.vals.crowd,st.vals.scene);
const left=OLD.filter(w=>after.indexOf(w)>-1);
if(!left.length) ok('旧商品的词一个都没留下（vals='+after.join('/')+'）'); else fail('旧词残留：'+left.join(' '));
if(!st.res) ok('研究词池 state.res 已清'); else fail('state.res 未清');
if(globalThis.__LAST()===null) ok('生成结果 LAST 已清'); else fail('LAST 未清');
if(/先在左侧配置/.test(el('titles').innerHTML)) ok('标题区回到初始提示'); else fail('标题区未复原：'+el('titles').innerHTML);
if(state.lastPname==='威露士洗手液') ok('lastPname 更新为新商品'); else fail('lastPname 未更新');
// 品牌应被新品识别重新填上（威露士在 known 列表里）
if(el('brand').value==='威露士') ok('新商品品牌自动回填：'+el('brand').value); else fail('新品牌未回填：'+JSON.stringify(el('brand').value));

console.log('\n===== 5. 同名重复点击不该清 =====');
el('skus').value='300ml单瓶'; el('brand').value='威露士';
store['btnGuess'].onclick();
if(el('skus').value==='300ml单瓶') ok('重复识别同一商品，已填内容保留'); else fail('同名重复点击把内容清了');
if(el('brand').value==='威露士') ok('品牌保留'); else fail('品牌被清');

console.log('\n===== 6. 空白商品名不触发清空 =====');
el('pname').value='';
store['btnGuess'].onclick();
if(el('skus').value==='300ml单瓶') ok('商品名为空时不误清'); else fail('空商品名误清内容');

console.log('\n===== 7. 手动「重置」按钮 =====');
if(/id="btnReset"/.test(html)) ok('重置按钮存在'); else fail('缺重置按钮');
el('skus').value='500g单瓶'; el('brand').value='蓝月亮'; el('specAll').value='500g';
store['btnReset'].onclick();
const emptyOK=['brand','specAll','skus','research','pname'].filter(id=>el(id).value==='');
if(emptyOK.length===5) ok('点重置后 5 个输入框全部清空'); else fail('未清干净：'+['brand','specAll','skus','research','pname'].filter(id=>el(id).value!=='').join(' '));
if(globalThis.__LAST()===null) ok('生成结果已清'); else fail('LAST 未清');
// 词池按当前品类自动带出默认卖点是原设计（不是上一个商品的残留），这里只校验不含旧品词
const after2=st.vals.sell.concat(st.vals.crowd,st.vals.scene);
const left2=OLD.filter(w=>after2.indexOf(w)>-1);
if(!left2.length) ok('旧品词未残留（vals='+after2.join('/')+'）'); else fail('旧词残留：'+left2.join(' '));
store['btnReset'].onclick();   // 再点一次：已经干净，不该报错
ok('重复点重置不报错');

console.log(bad?('\n❌ 失败 '+bad+' 项'):'\n✅ 全部通过');
process.exit(bad?1:0);
