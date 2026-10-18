# -*- coding: utf-8 -*-
# 修正：内置品类词典（base）也要过 classify 归桶；补充词条
import io
P="个护家清标题工作台.html"
s=io.open(P,encoding="utf-8").read(); o=s
def rep(a,b):
    global s
    assert a in s, "MISS: "+a[:70].replace("\n","\\n")
    s=s.replace(a,b,1)

# 1) 词条补充：血渍/汗味/油渍/果汁/内衣 等高频错位词
rep('var X_SELL=["手洗","机洗","内衣裤","贴身衣物","真丝","毛类","羊毛","丝绸","棉麻","羽绒服","床单被套","婴儿衣物","宝宝衣物","娇贵衣物","干衣预涂","预涂","除渍"];',
    'var X_SELL=["手洗","机洗","内衣","内衣裤","贴身衣物","真丝","毛类","羊毛","丝绸","棉麻","羽绒服","床单被套","婴儿衣物","宝宝衣物","娇贵衣物","干衣预涂","预涂","除渍","血渍","汗味","油渍","果汁","污渍","奶渍"];')
rep('var X_CROWD=["住宿群体","差旅人士","贴身衣物用户"];',
    'var X_CROWD=["住宿群体","差旅人士","贴身衣物用户","家庭主妇"];')

# 2) base（内置品类词典）也统一分发：未命中词保持原类，命中则挪到归属池
rep('''  if(state.res) (state.res[kind]||[]).forEach(function(w){ push(w,"res"); });
  base.forEach(function(w){ push(w,"dict"); });''',
'''  if(state.res) (state.res[kind]||[]).forEach(function(w){ push(w,"res"); });
  // base = 内置品类词典三类全量，同样按 classify 归桶（内置词典自己也会写错位，如场景词典里的「床单被套」）
  [["sell",c.sell],["crowd",c.crowd],["scene",c.scene]].forEach(function(p){
    p[1].forEach(function(w){ if((classifyWord(w)||p[0])===kind) push(w,"dict"); });
  });''')

# 3) base 变量改为全量（供 sig/长度展示无影响，保留变量声明但不再单独用）
rep('''function poolFor(kind){
  var c=cur();
  var base = kind=="sell"?c.sell : kind=="crowd"?c.crowd : c.scene;
  var items=[];''','''function poolFor(kind){
  var c=cur();
  var items=[];''')

io.open(P,"w",encoding="utf-8").write(s)
print("OK")
