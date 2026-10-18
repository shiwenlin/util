# -*- coding: utf-8 -*-
# ★ 固化「入选名单」：被截断舍弃的词永久出局，删除只在名单内减，绝不补位。
#   只有来源变了（换品类 / 重解析研究 / 导入热搜 / 商品名抽词变化）才重算。
import io
P="个护家清标题工作台.html"
s=io.open(P,encoding="utf-8").read(); o=s
def rep(a,b):
    global s
    assert a in s, "MISS: "+a[:70].replace("\n","\\n")
    s=s.replace(a,b,1)

rep('''  var rawN=items.length;
  items.sort(function(a,b){ return (SRCW[b.s]-SRCW[a.s]) || (a.r-b.r); });
  /* ★ 先按搜索价值排序 → 再硬截断 → 最后才过滤已删：
     ① 超过 POOL_CAP 的直接舍弃，不补位；
     ② 删掉的词只「腾位子」，绝不让第 21 个挤上来（否则「越删越多」）。 */
  var keep=items.slice(0,POOL_CAP);
  var out=keep.map(function(x){ return x.w; });
  state.poolRaw=state.poolRaw||{}; state.poolRaw[kind]=rawN;
  state.poolCut=state.poolCut||{}; state.poolCut[kind]=Math.max(0,rawN-keep.length);
  state.poolSrc=state.poolSrc||{}; state.poolSrc[kind]=keep;
  return out.filter(function(w){ return !isBlockedWord(w); });''',
'''  var rawN=items.length;
  items.sort(function(a,b){ return (SRCW[b.s]-SRCW[a.s]) || (a.r-b.r); });
  /* ★ 入选名单固化：只有「词源变了」才重算（换品类 / 重解析研究 / 导入热搜 / 商品名抽词变化）。
     删词不改词源 → 名单不动 → 删 1 个就真少 1 个，第 21 名不会挤上来。
     （不固化的话：全量 34 > 上限 20，删掉前 20 里任意一个，第 21 位必然补位 = 越删越多） */
  var cc2=cur();
  var sig=[kind, (cc2&&(cc2.name||cc2.k||""))||"",
           ((state.res&&state.res[kind])||[]).join(","),
           (state.hot||[]).map(function(r){return r.k;}).join(","),
           (state.autoSell||[]).join(","), POOL_CAP].join("|");
  state.poolSig=state.poolSig||{}; state.poolKeep=state.poolKeep||{};
  var keep;
  if(state.poolSig[kind]===sig && state.poolKeep[kind]) keep=state.poolKeep[kind];
  else{
    keep=items.slice(0,POOL_CAP);
    state.poolSig[kind]=sig; state.poolKeep[kind]=keep;
  }
  var out=keep.map(function(x){ return x.w; });
  state.poolRaw=state.poolRaw||{}; state.poolRaw[kind]=rawN;
  state.poolCut=state.poolCut||{}; state.poolCut[kind]=Math.max(0,rawN-keep.length);
  state.poolSrc=state.poolSrc||{}; state.poolSrc[kind]=keep;
  return out.filter(function(w){ return !isBlockedWord(w); });''')

io.open(P,"w",encoding="utf-8").write(s)
print("OK")
