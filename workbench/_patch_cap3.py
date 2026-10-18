# -*- coding: utf-8 -*-
# 1) 去掉「已勾选词补回池子」——它会让「删 1 个补 1 个」，正是用户抱怨的越删越多
# 2) renderChips 里把已勾选词收敛到池内，避免「看不见的已选」
import io
P="个护家清标题工作台.html"
s=io.open(P,encoding="utf-8").read(); o=s
def rep(a,b):
    global s
    assert a in s, "MISS: "+a[:60].replace("\n","\\n")
    s=s.replace(a,b,1)

rep('''  var keep=items.slice(0,POOL_CAP);
  var out=keep.map(function(x){ return x.w; });
  // 已勾选的词永远保留（用户明确要的，不能被截断舍掉）
  (state.vals[kind]||[]).forEach(function(w){ if(w && out.indexOf(w)<0) out.push(w); });
''','''  var keep=items.slice(0,POOL_CAP);
  var out=keep.map(function(x){ return x.w; });
''')

rep('''    box.innerHTML="";
    var srcMap={};''','''    box.innerHTML="";
    // 已勾选的词若被截断舍弃，同步移出已选（池子是唯一词源，避免「看不见的已选」）
    var _pl=poolFor(kind);
    if((state.vals[kind]||[]).length){
      var _v=state.vals[kind].filter(function(w){ return _pl.indexOf(w)>-1; });
      if(_v.length!==state.vals[kind].length) state.vals[kind]=_v;
    }
    var srcMap={};''')
io.open(P,"w",encoding="utf-8").write(s)
print("OK")
