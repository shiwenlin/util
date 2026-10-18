/* 冒烟测试 v2：验证「先查品再选词 + 合规三档」改造 */
const fs=require('fs');
const html=fs.readFileSync('个护家清标题工作台.html','utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];

// ---- DOM stub ----
function mk(id){
  const e={
    id, tagName:'DIV', value:'', textContent:'', innerHTML:'', checked:false,
    style:{}, className:'', children:[], options:[],
    appendChild(c){this.children.push(c); if(c.tagName==='OPTION') this.options.push(c);},
    querySelector(){return mk('q');}, querySelectorAll(){return [];},
    closest(){return mk('c');}, onclick:null, onchange:null, oninput:null,
    getAttribute(){return '0';}, classList:{add(){},remove(){}}, remove(){}, select(){}, focus(){}
  };
  return e;
}
const store={};
global.document={
  getElementById(id){ if(!store[id]) store[id]=mk(id); return store[id]; },
  createElement(t){ const e=mk('new'); e.tagName=t.toUpperCase(); return e; },
  body:mk('body'), execCommand(){return true;}
};
global.navigator={};
global.alert=()=>{};
global.setTimeout=(f)=>{};
global.FileReader=function(){};

// id -> value 预设
store['brand']=mk('brand'); store['brand'].value='蓝月亮';
store['cat2']=mk('cat2'); store['cat2'].value='A2';
store['cat3']=mk('cat3'); store['cat3'].value='handwash';
store['month']=mk('month'); store['month'].value='10';
store['skus']=mk('skus');
store['skus'].value='500g芦荟抑菌单瓶 | 10.8\n500g芦荟抑菌瓶+袋补充装 | 23.9\n255g泡沫抑菌琥珀雪松 | 19.9\n50g免洗抑菌无香 | 6.9\n野菊花清爽500g*2瓶 | 39.9\n5kg大桶装 | 89';
store['specAll']=mk('specAll'); store['specAll'].value='500g*2瓶';
store['hero']=mk('hero'); store['hero'].value='1';
store['pname']=mk('pname'); store['pname'].value='蓝月亮抑菌洗手液';
store['research']=mk('research');
store['licensed']=mk('licensed');
store['guessInfo']=mk('guessInfo'); store['resInfo']=mk('resInfo');
store['promptTxt']=mk('promptTxt'); store['promptWrap']=mk('promptWrap');
store['csvInfo']=mk('csvInfo'); store['seasonBox']=mk('seasonBox'); store['banBox']=mk('banBox');
store['titles']=mk('titles'); store['skuOut']=mk('skuOut');
store['compliance']=mk('compliance'); store['imgOut']=mk('imgOut');

eval(js);

console.log('===== ① 商品名识别 =====');
const g=doGuess(false);
console.log('识别结果:', g? CAT[g[0]].name+' / '+CAT[g[0]].sub[g[1]].n : '未识别');
console.log('品牌自动填:', store['brand'].value);
console.log('autoSell:', state.autoSell.join('、'));
console.log('guessInfo:', store['guessInfo'].innerHTML.replace(/<[^>]+>/g,'|').slice(0,120));

console.log('\n===== ② 联网研究指令（前200字）=====');
console.log(buildPrompt().slice(0,200)+'...');

console.log('\n===== ③ 解析研究结果回填 =====');
store['research'].value = `功能点：
抑菌率高达99.9%，有效抑制细菌
蕴含库拉索芦荟提取成分，滋润呵护手部肌肤
泡沫丰富细腻，易冲洗不残留
温和配方，不干手
规格与香型：瓶装500g、300g；袋装补充装500g；泡沫型255g；免洗型50g；香型芦荟、野菊花清爽、琥珀雪松
目标人群：儿童、母婴、全家适用、学生、上班族
使用场景：家用、厨房、卫生间、办公室、便携、车载、学生宿舍
竞品标题：蓝月亮洗手液500g瓶装芦荟抑菌野菊花清香家用按压瓶官网正品
热搜词：洗手液家用按压瓶、抑菌洗手液、泡沫洗手液儿童、洗手液补充装、洗手液大桶装家用、免洗洗手液便携
平台主题：双11囤货、秋冬滋润`;
doParse();
console.log('卖点池:', state.res.sell.slice(0,10).join('、'));
console.log('人群:', state.res.crowd.join('、'));
console.log('场景:', state.res.scene.join('、'));
console.log('已选中卖点:', state.vals.sell.join('、'));

console.log('\n===== ④ 生成（有资质）=====');
store['licensed'].checked=true;
run();
const L=LAST;
console.log('--- 商品标题候选 ---');
L.titles.forEach((t,i)=>console.log(`[${i+1}] (${clen(t.text)}字符) ${t.text}` + (t.log.length?`   ⚠替换:${t.log.join(',')}`:'')));
console.log('--- SKU 搜索标题 ---');
L.skus.forEach(s=>{
  const sc=scan(s.title);
  console.log(`#${s.rank} ${s.raw.padEnd(22)} → "${s.title}"  [${s.len}字符] ${s.len<=30?'OK':'❌超限'}  hard:${sc.hard.join(',')||'-'} soft:${sc.soft.join(',')||'-'}`);
});

console.log('\n===== ⑤ 合规分级校验 =====');
const allText=L.titles.map(t=>t.text).join(' ')+' '+L.skus.map(s=>s.title).join(' ');
const sc=scan(allText);
console.log('🔴硬性违禁:', sc.hard.length? sc.hard.join('、') : '无（通过）');
console.log('🟡资质词:', sc.soft.length? sc.soft.join('、') : '无');
console.log('标题里是否保留「抑菌」:', allText.indexOf('抑菌')>-1 ? '✅ 保留' : '❌ 被删了');

console.log('\n===== ⑥ 一键替换（模拟无资质）=====');
const t0=L.titles[0].text;
const so=soften(t0);
console.log('替换前:', t0);
console.log('替换后:', so.text);
console.log('替换记录:', so.log.join('，')||'无');

console.log('\n===== ⑦ SKU 长度达标率 =====');
const bad=L.skus.filter(s=>s.len>30);
console.log(`共 ${L.skus.length} 条，超限 ${bad.length} 条`);
