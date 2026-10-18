# -*- coding: utf-8 -*-
# ★ 词归类纠偏：热搜削词抽出的属性词按词典分发到 卖点/人群/场景 对应池，
#   不再全部堆进卖点池（「学生宿舍」进卖点池就是这一类错误）。
#   研究文本粘贴时标错的段落（场景段里写衣物类型）也重新归位。
import io
P="个护家清标题工作台.html"
s=io.open(P,encoding="utf-8").read(); o=s
def rep(a,b):
    global s
    assert a in s, "MISS: "+a[:70].replace("\n","\\n")
    s=s.replace(a,b,1)

# ---------- 1. classifyWord + rebucketRes（紧跟 state 定义，init 提前调用也能用） ----------
ANCHOR='''var SRCW={hot:300, auto:200, res:100, dict:0};'''
ADD=ANCHOR+'''

/* ★ 词归类：一个词属于 卖点/人群/场景 哪一类，用词典判定，不靠「它出现在哪一段」。
   常见错位：热搜削词属性全进卖点池（「学生宿舍」）；粘贴时标错段（「真丝」写在场景段）。
   X_* 是补充归类词典（只用于归类，不参与 dictScan 抽词，零回归风险）；
   精确命中优先于包含命中；包含命中取最长，平手按 场景 > 人群 > 卖点。 */
var X_SELL=["手洗","机洗","内衣裤","贴身衣物","真丝","毛类","羊毛","丝绸","棉麻","羽绒服","床单被套","婴儿衣物","宝宝衣物","娇贵衣物","干衣预涂","预涂","除渍"];
var X_CROWD=["住宿群体","差旅人士","贴身衣物用户"];
var X_SCENE=["学生宿舍"];
function classifyWord(w){
  if(!w) return null;
  var i;
  for(i=0;i<X_SELL.length;i++) if(w===X_SELL[i]) return "sell";
  for(i=0;i<X_CROWD.length;i++) if(w===X_CROWD[i]) return "crowd";
  for(i=0;i<X_SCENE.length;i++) if(w===X_SCENE[i]) return "scene";
  var best=null,bl=0;
  function scan(arr,cls){
    for(var j=0;j<arr.length;j++){
      if(w.indexOf(arr[j])>-1 && arr[j].length>bl){ best=cls; bl=arr[j].length; }
    }
  }
  scan(X_SELL,"sell"); scan(X_CROWD,"crowd"); scan(X_SCENE,"scene");
  if(best) return best;
  scan(SCENEDIC,"scene"); scan(CROWDDIC,"crowd"); scan(SELLDIC,"sell");
  return best;   // null = 三类词典都没命中 → 尊重它原来的归属
}
/* 研究文本三类词重新归桶（parseResearch 按段落分桶，段落标错时在此纠正） */
function rebucketRes(r){
  var out={}; for(var k in r) out[k]=r[k];
  out.sell=[];out.crowd=[];out.scene=[];
  ["sell","crowd","scene"].forEach(function(k){
    (r[k]||[]).forEach(function(w){
      var t=classifyWord(w)||k;
      if(out[t].indexOf(w)<0) out[t].push(w);
    });
  });
  return out;
}'''
rep(ANCHOR,ADD)

# ---------- 2. doParse：研究词重新归桶 ----------
rep('''  var r=parseResearch(t);
  state.res=r;''','''  var r=rebucketRes(parseResearch(t));
  state.res=r;''')

# ---------- 3. poolFor：hot 属性词 / 商品名自带词按归类分发到对应池 ----------
rep('''  if(kind=="sell") hotAttr().forEach(function(w){ push(w,"hot"); });
  if(kind=="sell") (state.autoSell||[]).forEach(function(w){ push(w,"auto"); });''',
'''  // ★ 按归类分发：热搜削词属性 / 商品名自带词，classify 到哪个池就进哪个池
  //   （未命中词典的默认归卖点池 —— 功能词居多）
  hotAttr().forEach(function(w){ if((classifyWord(w)||"sell")===kind) push(w,"hot"); });
  (state.autoSell||[]).forEach(function(w){ if((classifyWord(w)||"sell")===kind) push(w,"auto"); });''')

io.open(P,"w",encoding="utf-8").write(s)
print("OK")
