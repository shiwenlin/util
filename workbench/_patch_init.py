# -*- coding: utf-8 -*-
import io, sys
P = '个护家清标题工作台.html'
s = io.open(P, encoding='utf-8').read()
def rep(a, b):
    global s
    if a not in s:
        print('MISS: ' + a[:70]); sys.exit(1)
    s = s.replace(a, b, 1)

# ---------- 1. placeholder ----------
rep('<textarea id="skus" style="min-height:110px"></textarea>',
    '<textarea id="skus" style="min-height:110px" placeholder="500ml单瓶&#10;500ml*2瓶 | 39.9&#10;300ml单瓶 | 19.9&#10;儿童款300ml&#10;1L补充装"></textarea>')
rep('<label>规格概览（写进商品标题的容量/组合，可留空，例：500ml*2瓶）</label>\n    <input type="text" id="specAll">',
    '<label>规格概览（写进商品标题的容量/组合，可留空）</label>\n    <input type="text" id="specAll" placeholder="例：500ml*2瓶">')

# ---------- 2. 换品重新识别时初始化 ----------
rep('  $("btnGuess").onclick=doGuess;',
    '  $("btnGuess").onclick=function(){\n'
    '    var nm=$("pname").value.trim();\n'
    '    /* ★ 换商品重新识别 → 先把上一个商品填的东西清干净，避免旧词混进新品的标题 */\n'
    '    if(nm && nm!==(state.lastPname||"") && isDirty()){\n'
    '      resetAll();\n'
    '      toast("已清空上一个商品的内容，重新开始");\n'
    '    }\n'
    '    if(nm) state.lastPname=nm;\n'
    '    doGuess();\n'
    '  };')

# ---------- 3. isDirty / resetAll ----------
rep('function doGuess(silent){',
'''/* 页面是否已经有「上一个商品」留下的内容 */
function isDirty(){
  var v=function(id){ var e=$(id); return e?(e.value||"").trim():""; };
  if(v("brand")||v("specAll")||v("skus")||v("research")) return true;
  if(LAST) return true;
  var vs=state.vals||{};
  if((vs.sell||[]).length||(vs.crowd||[]).length||(vs.scene||[]).length) return true;
  if((state.hot||[]).length) return true;
  if(state.res && ((state.res.sell||[]).length||(state.res.crowd||[]).length||(state.res.scene||[]).length||(state.res.hot||[]).length)) return true;
  var b=state.blocked||{};
  if((b.sell||[]).length||(b.crowd||[]).length||(b.scene||[]).length) return true;
  return false;
}
/* 清空所有已填内容 → 回到初始状态（商品名不动，因为它是新的查询对象） */
function resetAll(){
  ["brand","specAll","skus","research"].forEach(function(id){ var e=$(id); if(e) e.value=""; });
  var ri=$("resInfo"); if(ri) ri.innerHTML="";
  var ci=$("csvInfo"); if(ci) ci.innerHTML="未导入 · 将使用内置词根库（离线推算，未经数据校验）";
  var cf=$("csvFile"); if(cf){ try{ cf.value=""; }catch(e){} }
  var gi=$("guessInfo"); if(gi) gi.innerHTML="未识别 · 也可直接在下方手动选类目";
  var pw=$("promptWrap"); if(pw) pw.style.display="none";
  var pt=$("promptTxt"); if(pt) pt.textContent="";
  state.vals={sell:[],crowd:[],scene:[]};
  state.res=null; state.hot=null; state.autoSell=[];
  state.blocked={sell:[],crowd:[],scene:[]}; state.blockedShow=false;
  state.poolKeep={}; state.poolSig={}; state.poolRaw={}; state.poolSrc={};
  LAST=null;
  var t=$("titles"); if(t) t.innerHTML='<p class="empty">先在左侧配置，点「生成」</p>';
  var so=$("skuOut"); if(so) so.innerHTML='<p class="empty">—</p>';
  var cp=$("compliance"); if(cp) cp.innerHTML='<p class="empty">—</p>';
  var io=$("imgOut"); if(io) io.innerHTML='<p class="empty">—</p>';
  loadHero(); renderChips();
}

function doGuess(silent){''')

io.open(P, 'w', encoding='utf-8').write(s)
print('OK 初始化补丁完成')
