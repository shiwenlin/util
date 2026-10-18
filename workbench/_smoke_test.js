const fs=require('fs');
const path='C:/Users/Admin（无密码）/WorkBuddy/2026-10-17-21-07-42/workbench/个护家清标题工作台.html';
const h=fs.readFileSync(path,'utf8');
const code=h.match(/<script>([\s\S]*?)<\/script>/)[1];

function mkEl(id){
  return {id,value:'',innerHTML:'',textContent:'',style:{},
    classList:{add(){},remove(){},contains(){return false}},
    children:[],options:[],files:[],
    appendChild(c){this.children.push(c);if(c.tagName==='OPTION'){this.options.push(c);if(this.value==='')this.value=c.value;}},
    querySelectorAll(){return[];},querySelector(){return null;},
    addEventListener(){},closest(){return null;}};
}
const els={};
global.document={getElementById(id){if(!els[id])els[id]=mkEl(id);return els[id];},
  createElement(t){const e=mkEl('');e.tagName=t.toUpperCase();return e;}};
global.navigator={clipboard:{writeText(){}}};
global.FileReader=function(){};global.Blob=function(){};
global.URL={createObjectURL(){return''}};global.alert=()=>{};

eval(code);

function scenario(name,cat2,cat3,brand,month,skus,specAll){
  const g=document.getElementById.bind(document);
  g('brand').value=brand; g('cat2').value=cat2; g('cat3').value=cat3;
  g('month').value=String(month); g('skus').value=skus; g('specAll').value=specAll;
  state.vals={sell:[],crowd:[],scene:[]};
  loadSub(); loadHero(); g('hero').value='1';
  run();
  console.log('\n===== '+name+' =====');
  LAST.titles.forEach((t,i)=>console.log('  标题'+['[宽覆盖]','[卖点型]','[长尾]'][i]+' '+t.text+'  ('+clen(t.text)+'/60)'));
  LAST.skus.forEach(s=>console.log('  #'+s.rank+' '+s.raw.padEnd(14)+' -> '+s.title+'  ('+s.len+'/30)  '+s.intent));
}

scenario('洗手液 10月 双11档','A2','handwash','蓝月亮',10,
 '500ml单瓶 | 19.9\n500ml*2瓶 | 35.9\n300ml单瓶 | 12.9\n儿童款300ml | 15.9\n1L补充装 | 25.9\n旅行装100ml | 9.9','500ml*2瓶');

scenario('洗衣液 12月 年货档','D','liquid','自有品牌',12,
 '1kg单瓶 | 29.9\n2kg单瓶 | 49.9\n3kg*2瓶 | 89\n袋装补充装1kg | 19.9\n婴儿专用1kg | 39.9\n内衣专用500ml | 25','3kg*2瓶');

scenario('油污净 12月 大扫除','E1','degreaser','XX',12,
 '500ml单瓶 | 15.9\n500ml*2瓶 | 26\n1L补充装 | 19.9\n油烟机专用500ml | 18\n套装喷雾+补充 | 35','500ml*2瓶');

// 合规拦截测试
console.log('\n===== 违禁词拦截测试 =====');
console.log('  fixText("洗手液抑菌除菌99% 温和") -> '+JSON.stringify(fixText('洗手液抑菌除菌99% 温和')));
console.log('  fixText("油污净 万能清洁剂 全网最低价") -> '+JSON.stringify(fixText('油污净 万能清洁剂 全网最低价')));
console.log('  scan("护手霜治疗皲裂") -> '+JSON.stringify(scan('护手霜治疗皲裂')));
