# -*- coding: utf-8 -*-
import io,re
P="个护家清标题工作台.html"
s=io.open(P,encoding="utf-8").read()
orig=s
def rep(a,b,n=1):
    global s
    if a not in s:
        print("MISS:",a[:70].replace("\n","\\n")); return False
    s=s.replace(a,b,n); return True

# ---------- 1. poolFor 前插入：硬上限 + 价值权重 + 热搜削词 ----------
ANCHOR="function poolFor(kind){"
ADD = '''/* ★ 词池硬上限：超过 20 个的一律舍弃——不展示、也不进 SKU 补位池。
   理由：一个链接 6~10 个 SKU、意图位就那么多；排到 20 名以后的几乎都是品类
   内置通用词，没有真实搜索量支撑，写进标题带不来搜索，反而稀释标题权重。 */
var POOL_CAP=20;
/* ★ 排序权重 = 「有没有真实搜索数据支撑」，不是按来源先后排 */
var SRCW={hot:300, auto:200, res:100, dict:0};
var SRCLB={hot:"热搜词（有真实搜索量）", auto:"商品名自带", res:"研究回填词", dict:"品类内置通用词"};
/* 热搜词是完整搜索短语（「抑菌洗手液芦荟」），整条塞进词池会重复核心词 → 先削核心词抽属性词 */
function hotAttr(){
  var cc=cur(); var core=(cc&&cc.core&&cc.core[0])||"";
  var out=[];
  (state.hot||[]).slice(0,8).forEach(function(r){
    var h=r.k; if(!h) return;
    if(core && h.indexOf(core)>-1){
      var rest=h.split(core).join(" ");
      dictScan(rest).forEach(function(w){ out.push(w); });
      rest.split(/[\\s\\u00b7\\u3001,,\\uff0c]+/).forEach(function(x){
        if(/^[\\u4e00-\\u9fa5]{2,6}$/.test(x) && x.indexOf(core)<0) out.push(x);
      });
    }else{
      var dd=dictScan(h);
      if(dd.length) out=out.concat(dd);
      else if(/^[\\u4e00-\\u9fa5]{2,6}$/.test(h)) out.push(h);
    }
  });
  return uniq(out);
}
'''
rep(ANCHOR, ADD+ANCHOR)

# ---------- 2. 重写 poolFor：按价值排序 → 截断20 → 过滤已删 ----------
OLD = '''function poolFor(kind){
  var c=cur();
  var base = kind=="sell"?c.sell : kind=="crowd"?c.crowd : c.scene;
  var extra=[];
  // 优先级：商品名自带词 > 联网研究回填词 > 热搜CSV > 内置词根
  if(kind=="sell") extra=extra.concat(state.autoSell||[]);
  if(state.res) extra=extra.concat(state.res[kind]||[]);
  // 长尾热搜词只并进卖点池（是商品级搜索词，不是人群/场景）
  if(kind=="sell"&&state.hot&&state.hot.length) extra=extra.concat(state.hot.slice(0,8).map(function(r){return r.k;}));
  var raw=uniq(extra.concat(base));
  state.poolRaw=state.poolRaw||{}; state.poolRaw[kind]=raw.length;
  /* ★ 先截断再过滤：删掉的词「腾位子」而不是让后面没展示的词补上来。
     否则会出现「越删越多」——删 1 个，第 31 个词挤进展示位，看着像删不掉。 */
  return raw.slice(0,30).filter(function(w){ return !isBlockedWord(w); });
}'''
NEW = '''function poolFor(kind){
  var c=cur();
  var base = kind=="sell"?c.sell : kind=="crowd"?c.crowd : c.scene;
  var items=[];
  function push(w,s){
    if(!w) return;
    for(var i=0;i<items.length;i++) if(items[i].w===w) return;  // uniq，先到先得
    items.push({w:w,s:s,r:items.length});
  }
  // ① 热搜词（真实搜索量，蓝海值降序）② 商品名自带 ③ 研究回填 ④ 品类内置通用词
  if(kind=="sell") hotAttr().forEach(function(w){ push(w,"hot"); });
  if(kind=="sell") (state.autoSell||[]).forEach(function(w){ push(w,"auto"); });
  if(state.res) (state.res[kind]||[]).forEach(function(w){ push(w,"res"); });
  base.forEach(function(w){ push(w,"dict"); });
  var rawN=items.length;
  items.sort(function(a,b){ return (SRCW[b.s]-SRCW[a.s]) || (a.r-b.r); });
  /* ★ 先按搜索价值排序 → 再硬截断 → 最后才过滤已删：
     ① 超过 POOL_CAP 的直接舍弃，不补位；
     ② 删掉的词只「腾位子」，绝不让第 21 个挤上来（否则「越删越多」）。 */
  var keep=items.slice(0,POOL_CAP);
  var out=keep.map(function(x){ return x.w; });
  // 已勾选的词永远保留（用户明确要的，不能被截断舍掉）
  (state.vals[kind]||[]).forEach(function(w){ if(w && out.indexOf(w)<0) out.push(w); });
  state.poolRaw=state.poolRaw||{}; state.poolRaw[kind]=rawN;
  state.poolCut=state.poolCut||{}; state.poolCut[kind]=Math.max(0,rawN-keep.length);
  state.poolSrc=state.poolSrc||{}; state.poolSrc[kind]=keep;
  return out.filter(function(w){ return !isBlockedWord(w); });
}'''
rep(OLD,NEW)

# ---------- 3. chip title 显来源 ----------
OLD2='''    box.innerHTML="";
    poolFor(kind).forEach(function(w){
      var on=state.vals[kind].indexOf(w)>-1;'''
NEW2='''    box.innerHTML="";
    var srcMap={}; ((state.poolSrc&&state.poolSrc[kind])||[]).forEach(function(x){ srcMap[x.w]=x.s; });
    poolFor(kind).forEach(function(w){
      var on=state.vals[kind].indexOf(w)>-1;'''
rep(OLD2,NEW2)

OLD3='''      b.title=(on?"已选 · ":"备选 · ")+(on?"按顺序写进商品标题":"只补位到 SKU 搜索标题");'''
NEW3='''      b.title=(on?"已选 · ":"备选 · ")+(on?"按顺序写进商品标题":"只补位到 SKU 搜索标题")+
        "　｜来源："+(SRCLB[srcMap[w]]||"—");'''
rep(OLD3,NEW3)

# ---------- 4. 计数文案：显示舍弃数 ----------
OLD4='''      var n=state.vals[kind].length, tot=poolFor(kind).length;
      var rawN=(state.poolRaw&&state.poolRaw[kind])||tot;
      cnt.textContent="已选 "+n+"/"+MAXSEL[kind]+" · 备选 "+(tot-n)+" 条进SKU"+
        (rawN>tot?(" · 词池共 "+rawN+"（展示前 "+tot+"）"):"");
      cnt.className="tag"+(n?"":" a");'''
NEW4='''      var n=state.vals[kind].length, tot=poolFor(kind).length;
      var rawN=(state.poolRaw&&state.poolRaw[kind])||tot;
      var cut=(state.poolCut&&state.poolCut[kind])||0;
      cnt.textContent="已选 "+n+"/"+MAXSEL[kind]+" · 备选 "+(tot-n)+" 条进SKU"+
        (cut?(" · 池 "+rawN+" → 取前 "+POOL_CAP+"，舍弃 "+cut+" 个低价值词"):"");
      cnt.title="排序：热搜词（有真实搜索量）> 商品名自带 > 研究回填词 > 品类内置通用词；"+
        "超过 "+POOL_CAP+" 个的直接舍弃，不展示也不进 SKU 补位池";
      cnt.className="tag"+(n?"":" a");'''
rep(OLD4,NEW4)

if s!=orig:
    io.open(P,"w",encoding="utf-8").write(s)
    print("OK patched")
else:
    print("NO CHANGE")
