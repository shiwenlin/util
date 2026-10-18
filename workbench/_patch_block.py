# -*- coding: utf-8 -*-
import io,sys
p=r"C:/Users/Admin（无密码）/WorkBuddy/2026-10-17-21-07-42/workbench/个护家清标题工作台.html"
s=io.open(p,encoding="utf-8").read()
o=s
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n:
        print("MISS(%d!=%d): %s"%(c,n,a[:80].replace("\n","\\n")));sys.exit(1)
    s=s.replace(a,b)

# ---------- 1. state 增加 blocked ----------
rep('var state={hot:null,vals:{sell:[],crowd:[],scene:[]},res:null,autoSell:[]};',
    'var state={hot:null,vals:{sell:[],crowd:[],scene:[]},res:null,autoSell:[],blocked:{sell:[],crowd:[],scene:[]}};')

# ---------- 2. 屏蔽工具函数 ----------
rep('function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}',
'''function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
/* ===== ★ 删除的词 = 全局屏蔽 =====
   用户点词右侧 × 删掉的词，商品标题、SKU 主推、SKU 3 条备选、以及 SKU 原文自带的同源词
   全部不再使用；已删的词排在词池末尾，点 ↺ 可恢复。 */
function isBlockedWord(w){
  var b=(state&&state.blocked)||{};
  return !!(w&&((b.sell||[]).indexOf(w)>-1||(b.crowd||[]).indexOf(w)>-1||(b.scene||[]).indexOf(w)>-1));
}
function blockedAll(){
  var b=(state&&state.blocked)||{};
  return uniq([].concat(b.sell||[],b.crowd||[],b.scene||[]));
}
function blockWord(kind,w){
  if(!w) return;
  var b=state.blocked[kind]=state.blocked[kind]||[];
  if(b.indexOf(w)<0) b.push(w);
  var i=state.vals[kind].indexOf(w); if(i>-1) state.vals[kind].splice(i,1);
  renderChips();
  if(LAST) run();          // 已生成过就立刻重算，删完马上看到效果
}
function unblockWord(kind,w){
  var b=state.blocked[kind]||[];
  var i=b.indexOf(w); if(i>-1) b.splice(i,1);
  renderChips();
  if(LAST) run();
}
function unblockAll(kind){
  state.blocked[kind]=[]; renderChips(); if(LAST) run();
}''')

# ---------- 3. dictScan：SKU 原文扫出的词也过屏蔽（否则删了照样从 SKU 名里冒出来） ----------
rep("""  // 按在原文中出现的位置排，先出现的更贴近这个 SKU（如「免洗抑菌无香」先取「免洗」）
  return uniq(r).sort(function(a,b){ return raw.indexOf(a)-raw.indexOf(b); });""",
"""  // 按在原文中出现的位置排，先出现的更贴近这个 SKU（如「免洗抑菌无香」先取「免洗」）
  return uniq(r).filter(function(w){ return !isBlockedWord(w); })
                .sort(function(a,b){ return raw.indexOf(a)-raw.indexOf(b); });""")

# ---------- 4. poolFor：屏蔽词不进词池（chip 不显示、也不补位给 SKU） ----------
rep("""  return uniq(extra.concat(base)).slice(0,20);""",
    """  return uniq(extra.concat(base)).filter(function(w){ return !isBlockedWord(w); }).slice(0,20);""")

# ---------- 5. renderChips：加 × 删除 + 已删区 + 恢复 ----------
rep("""    box.innerHTML="";
    poolFor(kind).forEach(function(w){
      var on=state.vals[kind].indexOf(w)>-1;
      var b=document.createElement("span");
      b.className="chip"+(on?" on":" maybe");
      b.textContent=w;
      b.title=(on?"已选 · ":"备选 · ")+(on?"按顺序写进商品标题":"只补位到 SKU 搜索标题");
      b.onclick=function(){
        var i=state.vals[kind].indexOf(w);
        if(i>-1) state.vals[kind].splice(i,1);
        else if(state.vals[kind].length>=MAXSEL[kind]) return;
        else state.vals[kind].push(w);
        renderChips();
      };
      box.appendChild(b);
    });""",
"""    box.innerHTML="";
    poolFor(kind).forEach(function(w){
      var on=state.vals[kind].indexOf(w)>-1;
      var b=document.createElement("span");
      b.className="chip"+(on?" on":" maybe");
      b.innerHTML='<span>'+esc(w)+'</span>'+
        '<span class="cx" title="删除「'+esc(w)+'」：商品标题、SKU 主推与备选都不再用它">\\u00d7</span>';
      b.title=(on?"已选 · ":"备选 · ")+(on?"按顺序写进商品标题":"只补位到 SKU 搜索标题");
      b.onclick=function(){
        var i=state.vals[kind].indexOf(w);
        if(i>-1) state.vals[kind].splice(i,1);
        else if(state.vals[kind].length>=MAXSEL[kind]) return;
        else state.vals[kind].push(w);
        renderChips();
      };
      var x=b.querySelector?b.querySelector(".cx"):null;
      if(x) x.onclick=function(ev){ if(ev&&ev.stopPropagation)ev.stopPropagation(); blockWord(kind,w); };
      box.appendChild(b);
    });
    /* 已删除的词：置灰排在末尾，点 ↺ 恢复 */
    var bl=state.blocked[kind]||[];
    bl.forEach(function(w){
      var b=document.createElement("span");
      b.className="chip del";
      b.innerHTML='<span class="delw">'+esc(w)+'</span><span class="cx">\\u21ba</span>';
      b.title="已删除（全局禁用）· 点 \\u21ba 恢复";
      b.onclick=function(){ unblockWord(kind,w); };
      box.appendChild(b);
    });
    if(bl.length){
      var r=document.createElement("span");
      r.className="chip undel";
      r.textContent="全部恢复（"+bl.length+"）";
      r.onclick=function(){ unblockAll(kind); };
      box.appendChild(r);
    }""")

# ---------- 6. run()：所有词池统一过屏蔽 ----------
rep("""  var sell=state.vals.sell.slice(), crowd=state.vals.crowd.slice(), scene=state.vals.scene.slice();""",
"""  var notBlocked=function(w){ return !isBlockedWord(w); };          // ★ 全局屏蔽闸门
  var sell=state.vals.sell.filter(notBlocked),
      crowd=state.vals.crowd.filter(notBlocked),
      scene=state.vals.scene.filter(notBlocked);""")

rep("""  if(!sell.length)  sell  = strict ? ((state.res&&state.res.sell||[]).slice(0,2))  : c.sell.slice(0,2);
  if(!scene.length) scene = strict ? ((state.res&&state.res.scene||[]).slice(0,1)) : c.scene.slice(0,1);
  // 商品名里抽到的功效词（抑菌等）默认补进卖点，保证真实卖点不丢
  (state.autoSell||[]).forEach(function(w){ if(sell.length<4 && sell.indexOf(w)<0) sell.push(w); });""",
"""  if(!sell.length)  sell  = strict ? ((state.res&&state.res.sell||[]).filter(notBlocked).slice(0,2))  : (c.sell||[]).filter(notBlocked).slice(0,2);
  if(!scene.length) scene = strict ? ((state.res&&state.res.scene||[]).filter(notBlocked).slice(0,1)) : (c.scene||[]).filter(notBlocked).slice(0,1);
  // 商品名里抽到的功效词（抑菌等）默认补进卖点，保证真实卖点不丢
  (state.autoSell||[]).forEach(function(w){ if(!notBlocked(w)) return; if(sell.length<4 && sell.indexOf(w)<0) sell.push(w); });""")

rep("""  var resPool=state.res?uniq((state.res.sell||[]).concat(state.res.crowd||[]).concat(state.res.scene||[])):[];
  var hotPool=(state.hot||[]).map(function(r){return r.k;});""",
"""  var resPool=state.res?uniq((state.res.sell||[]).concat(state.res.crowd||[]).concat(state.res.scene||[])).filter(notBlocked):[];
  var hotPool=(state.hot||[]).map(function(r){return r.k;}).filter(notBlocked);""")

rep("""  var knownPool=uniq(resPool.concat(hotPool).concat(sell).concat(crowd).concat(scene)
                      .concat(dictPool).concat(state.autoSell||[]));""",
"""  var knownPool=uniq(resPool.concat(hotPool).concat(sell).concat(crowd).concat(scene)
                      .concat(dictPool).concat(state.autoSell||[])).filter(notBlocked);""")

rep("""  if(strict) reserve=reserve.filter(function(w){ return !isBuiltin(w); });   // 严格模式：不要内置词库造的词""",
"""  reserve=reserve.filter(notBlocked);
  if(strict) reserve=reserve.filter(function(w){ return !isBuiltin(w); });   // 严格模式：不要内置词库造的词""")

rep("""  var fill=uniq(reserve.concat((state.hot||[]).map(function(r){return r.k;})).concat(c.sell).concat(c.scene).concat(c.crowd));""",
"""  var fill=uniq(reserve.concat((state.hot||[]).map(function(r){return r.k;})).concat(c.sell).concat(c.scene).concat(c.crowd)).filter(notBlocked);""")

rep("""  allPool=allPool
    .filter(function(w){ return clen(w)<=10; })""",
"""  allPool=allPool
    .filter(notBlocked)
    .filter(function(w){ return clen(w)<=10; })""")

rep("""  var dictPool=[];
  lines.forEach(function(s){ dictPool=dictPool.concat(dictScan(s.raw)); });
  /* dictPool（各 SKU 原文扫出的词）必须排最后兜底""",
"""  var dictPool=[];
  lines.forEach(function(s){ dictPool=dictPool.concat(dictScan(s.raw)); });
  dictPool=dictPool.filter(notBlocked);
  /* dictPool（各 SKU 原文扫出的词）必须排最后兜底""")

# canUse：第0/1/1.5/2/3轮统一拦截
rep("""  function canUse(w,s){
    if(!w) return false;
    if(s.spec.indexOf(w)>-1) return false;             // 规格里已有，不重复挂""",
"""  function canUse(w,s){
    if(!w) return false;
    if(isBlockedWord(w)) return false;                  // ★ 已删除的词不再分配给任何 SKU
    if(s.spec.indexOf(w)>-1) return false;             // 规格里已有，不重复挂""")

# 第0轮：屏蔽词不许被推回 allPool
rep("""      if(!o.tag && o.s.raw.indexOf(k)>-1){ var w=SPEC2INTENT[k]; if(allPool.indexOf(w)<0) allPool.push(w); if(!used[w]&&canUse(w,o.s)){ o.tag=w; } }""",
"""      if(!o.tag && o.s.raw.indexOf(k)>-1){ var w=SPEC2INTENT[k]; if(isBlockedWord(w)) return; if(allPool.indexOf(w)<0) allPool.push(w); if(!used[w]&&canUse(w,o.s)){ o.tag=w; } }""")

# 备选：altOK + B路热搜池 + C路时段词
rep("""        return !!w && ac.indexOf(w)<0 && s.spec.indexOf(w)<0 && clen(w)<=12""",
"""        return !!w && !isBlockedWord(w) && ac.indexOf(w)<0 && s.spec.indexOf(w)<0 && clen(w)<=12""")

rep("""         var hotRaw=uniq([].concat((state.hot||[]).map(function(r){return r.k;}))
                           .concat((state.res&&state.res.hot)||[]));""",
"""         var hotRaw=uniq([].concat((state.hot||[]).map(function(r){return r.k;}))
                           .concat((state.res&&state.res.hot)||[]))
                      .filter(function(w){ return !isBlockedWord(w); });""")

rep("""       pool:uniq([].concat(mf.tag||[]).concat(poolFor("sell")))}""",
"""       pool:uniq([].concat(mf.tag||[]).concat(poolFor("sell"))).filter(function(w){return !isBlockedWord(w);})}""")

# ---------- 7. 报告里显式说明屏蔽生效 ----------
rep("""  var warnSkus=L.skus.filter(function(s){ return s.warn; });""",
"""  var bl=blockedAll();
  if(bl.length) msgs.push('<div class="alert ok">\\uD83D\\uDEAB 已删除并<b>全局屏蔽 '+bl.length+' 个词</b>：'+
    bl.map(function(w){return '<span class="tag">'+esc(w)+'</span>';}).join(" ")+
    '<br><span style="opacity:.85">商品标题、SKU 主推与 3 条备选都不会再用这些词（含 SKU 名自带的同源词）。'+
    '在左侧词池末尾点 \\u21ba 可恢复。</span></div>');
  var warnSkus=L.skus.filter(function(s){ return s.warn; });""")

# ---------- 8. CSS ----------
rep('.chip.on{background:var(--blue-bg);border-color:var(--blue);color:var(--blue)}',
""".chip.on{background:var(--blue-bg);border-color:var(--blue);color:var(--blue)}
.chip .cx{margin-left:6px;opacity:.35;font-weight:700;padding:0 3px;border-radius:3px;line-height:1}
.chip:hover .cx{opacity:.85}
.chip .cx:hover{opacity:1;color:var(--red);background:var(--red-bg)}
.chip.del{opacity:.55;border-style:dashed;color:var(--tx3);background:transparent}
.chip.del .delw{text-decoration:line-through}
.chip.del:hover{opacity:1;border-color:var(--teal);color:var(--teal);background:var(--teal-bg)}
.chip.undel{border-style:dashed;color:var(--teal);border-color:var(--teal);background:transparent;font-size:11.5px}
.chip.undel:hover{background:var(--teal-bg)}""")

# ---------- 9. 提示文案 ----------
rep("""      <b>SKU 越多，消化越多</b>：每条 SKU 有 2 个意图位，6 条 ≈ 消化 6~8 个备选词，10 条 ≈ 14 个。一条词只占一个入口，不会重复。""",
"""      <b>SKU 越多，消化越多</b>：每条 SKU 有 2 个意图位，6 条 ≈ 消化 6~8 个备选词，10 条 ≈ 14 个。一条词只占一个入口，不会重复。<br>
      <b>不想要的词：点词右侧 × 删除</b> → 该词<b>全局禁用</b>（商品标题、SKU 主推与备选都不会再用，SKU 名里自带的同源词也一起跳过），
      已删的词会置灰排在词池末尾，点 <span class="tag">↺</span> 恢复。删完会自动重算。""")

io.open(p,"w",encoding="utf-8").write(s)
print("OK  delta=%d"%(len(s)-len(o)))
