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

# ---------- 1. 删除后「不补位」+ 展示上限提到 30 + 记录词池真实总数 ----------
rep("""  return uniq(extra.concat(base)).filter(function(w){ return !isBlockedWord(w); }).slice(0,20);""",
"""  var raw=uniq(extra.concat(base));
  state.poolRaw=state.poolRaw||{}; state.poolRaw[kind]=raw.length;
  /* ★ 先截断再过滤：删掉的词「腾位子」而不是让后面没展示的词补上来。
     否则会出现「越删越多」——删 1 个，第 31 个词挤进展示位，看着像删不掉。 */
  return raw.slice(0,30).filter(function(w){ return !isBlockedWord(w); });""")

# ---------- 2. 已删区改为折叠（默认只占 1 个小 chip） ----------
rep("""    /* 已删除的词：置灰排在末尾，点 ↺ 恢复 */
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
    }""",
"""    /* 已删除的词：默认折叠成一个小入口，展开才能逐条恢复 —— 否则删越多、这一行越长 */
    var bl=state.blocked[kind]||[];
    if(bl.length){
      var d=document.createElement("span");
      d.className="chip delhd";
      d.textContent="\\uD83D\\uDDD1 已删 "+bl.length+" 个 · "+(state.blockedShow?"收起":"展开恢复");
      d.title="已删除的词（全局禁用）· 点开可逐条恢复";
      d.onclick=function(){ state.blockedShow=!state.blockedShow; renderChips(); };
      box.appendChild(d);
      if(state.blockedShow){
        bl.forEach(function(w){
          var b=document.createElement("span");
          b.className="chip del";
          b.innerHTML='<span class="delw">'+esc(w)+'</span><span class="cx">\\u21ba</span>';
          b.title="已删除（全局禁用）· 点 \\u21ba 恢复";
          b.onclick=function(){ unblockWord(kind,w); };
          box.appendChild(b);
        });
        var r=document.createElement("span");
        r.className="chip undel";
        r.textContent="全部恢复（"+bl.length+"）";
        r.onclick=function(){ unblockAll(kind); };
        box.appendChild(r);
      }
    }""")

# ---------- 3. 计数标签：显示词池真实总数，让人知道有没有「没展示出来的」 ----------
rep("""      var n=state.vals[kind].length, tot=poolFor(kind).length;
      cnt.textContent="已选 "+n+"/"+MAXSEL[kind]+" · 备选 "+(tot-n)+" 条进SKU";""",
"""      var n=state.vals[kind].length, tot=poolFor(kind).length;
      var rawN=(state.poolRaw&&state.poolRaw[kind])||tot;
      cnt.textContent="已选 "+n+"/"+MAXSEL[kind]+" · 备选 "+(tot-n)+" 条进SKU"+
        (rawN>tot?(" · 词池共 "+rawN+"（展示前 "+tot+"）"):"");""")

# ---------- 4. 词池被删空的提示 ----------
rep("""    '在左侧词池末尾点 \\u21ba 可恢复。</span></div>');""",
"""    '在左侧词池末尾点 \\u21ba 可恢复。</span></div>');
  var poolLeft=["sell","crowd","scene"].reduce(function(n,kk){ return n+poolFor(kk).length; },0);
  if(poolLeft<8) msgs.push('<div class="alert a">\\u26A0\\uFE0F 删完之后三个词池只剩 <b>'+poolLeft+
    ' 个可用词</b>（卖点 '+poolFor("sell").length+' / 人群 '+poolFor("crowd").length+' / 场景 '+poolFor("scene").length+
    '），SKU 补位会不够用。<br>建议：恢复几个误删的词，或回去补一轮「商品速查」（多查几个竞品标题 + 搜索下拉词）把池子填满。</div>');""")

# ---------- 5. CSS：折叠入口样式 ----------
rep('.chip.undel{border-style:dashed;color:var(--teal);border-color:var(--teal);background:transparent;font-size:11.5px}',
""".chip.delhd{border-style:dashed;color:var(--tx3);background:transparent;font-size:11px;opacity:.75}
.chip.delhd:hover{opacity:1;color:var(--teal);border-color:var(--teal)}
.chip.undel{border-style:dashed;color:var(--teal);border-color:var(--teal);background:transparent;font-size:11.5px}""")

# ---------- 6. 提示文案补一句「删了不补位」 ----------
rep("""      已删的词会置灰排在词池末尾，点 <span class="tag">↺</span> 恢复。删完会自动重算。""",
"""      已删的词折叠在词池末尾（点 <span class="tag">🗑 已删 N · 展开恢复</span> 可逐条恢复），删完自动重算。<br>
      <b>删掉的词不会「腾位子」给没展示出来的词</b> —— 池子只减不增，所以不会越删越多。""")

io.open(p,"w",encoding="utf-8").write(s)
print("OK  delta=%d"%(len(s)-len(o)))
