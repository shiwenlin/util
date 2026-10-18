import io

p = '个护家清标题工作台.html'
s = io.open(p, encoding='utf-8').read()

# ---------- 修1：严格模式下禁用内置词（之前只标黄没禁，等于凭空造词） ----------
old_a = '  var skus=stubs.map(function(o,i){'
assert old_a in s, 'anchorA'
new_a = '''  /* 严格模式：内置品类词（不是你查到的真实卖点）一律踢出池子 —— 宁可少词也不凭空造 */
  if(strict) allPool=allPool.filter(function(w){ return !isBuiltin(w); });
  var skus=stubs.map(function(o,i){'''
s = s.replace(old_a, new_a, 1)

# ---------- 修2：核心词重复 + 严格模式内置词，进候选前统一过滤 ----------
old_b = '''    var dropped=[];
    var cand=[];
    [o.tag,o.tag2].forEach(function(w){
      if(!w || s.spec.indexOf(w)>-1) return;
      if(cand.length>=3) return;'''
assert old_b in s, 'anchorB'
new_b = '''    var dropped=[];
    var cand=[];
    /* 候选词通用闸门：① 不含核心词/品牌（否则出现「洗手液洗手液」）
       ② 严格模式下不得是内置词（必须是你真实查到的） */
    var candOK=function(w){
      return !!w && s.spec.indexOf(w)<0 && w.indexOf(core)<0 && w.indexOf(brand)<0
             && !(strict && isBuiltin(w));
    };
    [o.tag,o.tag2].forEach(function(w){
      if(!candOK(w)) return;
      if(cand.length>=3) return;'''
s = s.replace(old_b, new_b, 1)

# ---------- 修3：B 路热搜词拆解（不能整句塞进标题） ----------
old_c = '''      {lb:"B",route:"热搜长尾路：抓蓝海值高的真实搜索词",
       pool:uniq([].concat((state.hot||[]).map(function(r){return r.k;}))
                   .concat((state.res&&state.res.hot)||[]))},'''
assert old_c in s, 'anchorC'
new_c = '''      {lb:"B",route:"热搜长尾路：抓蓝海值高的真实搜索词",
       pool:(function(){
         /* 热搜词是**完整搜索短语**（如「抑菌洗手液芦荟」「野菊花洗手液」），
            整条塞进 SKU 标题会重复核心词 → 「蓝月亮洗手液野菊花洗手液255g」。
            必须先拆：含核心词的先削掉核心词，再抽属性词；抽不到才取 2~6 字纯中文片段。 */
         var hotRaw=uniq([].concat((state.hot||[]).map(function(r){return r.k;}))
                           .concat((state.res&&state.res.hot)||[]));
         var out=[];
         hotRaw.forEach(function(h){
           if(!h) return;
           if(h.indexOf(core)>-1){
             var rest=h.split(core).join(" ");
             dictScan(rest).forEach(function(w){ out.push(w); });
             rest.split(/[\\s·、,，]+/).forEach(function(x){
               if(/^[\\u4e00-\\u9fa5]{2,6}$/.test(x) && x.indexOf(core)<0) out.push(x);
             });
           }else{
             var dd=dictScan(h);
             if(dd.length) out=out.concat(dd);
             else if(/^[\\u4e00-\\u9fa5]{2,6}$/.test(h)) out.push(h);
           }
         });
         return uniq(out).filter(function(w){ return w && clen(w)<=12 && !(strict&&isBuiltin(w)); });
       })()},'''
s = s.replace(old_c, new_c, 1)

# ---------- 修4：altOK 加核心词/内置词闸门；挑不到从储备池补，不浪费字符位 ----------
old_d = '''      var altOK=function(w){
        return !!w && ac.indexOf(w)<0 && s.spec.indexOf(w)<0 && clen(w)<=12
          && !findConflict([s.spec].concat(ac).concat([w])).length
          && !(strict && isBorrowed(w,s.raw) && dictScan(s.raw).indexOf(w)<0);
      };'''
assert old_d in s, 'anchorD'
new_d = '''      var altOK=function(w){
        return !!w && ac.indexOf(w)<0 && s.spec.indexOf(w)<0 && clen(w)<=12
          && w.indexOf(core)<0 && w.indexOf(brand)<0
          && !findConflict([s.spec].concat(ac).concat([w])).length
          && !(strict && isBuiltin(w))
          && !(strict && isBorrowed(w,s.raw) && dictScan(s.raw).indexOf(w)<0);
      };'''
s = s.replace(old_d, new_d, 1)

old_e = '''      /* 挑不到就换起点轮转，保证 3 条备选真的不一样 */
      if(!ac.length){
        for(var z2=0;z2<rt.pool.length&&ac.length<2;z2++){
          var wb=rt.pool[(i+ri+1+z2)%rt.pool.length];
          if(altOK(wb) && cand.indexOf(wb)<0) ac.push(wb);
        }
      }'''
assert old_e in s, 'anchorE'
new_e = '''      /* 挑不到就换起点轮转，保证 3 条备选真的不一样 */
      if(!ac.length){
        for(var z2=0;z2<rt.pool.length&&ac.length<2;z2++){
          var wb=rt.pool[(i+ri+1+z2)%rt.pool.length];
          if(altOK(wb) && cand.indexOf(wb)<0) ac.push(wb);
        }
      }
      /* 这条路确实没词 → 从储备池补。否则会出现「蓝月亮洗手液500g单瓶」这种
         只剩规格、白白浪费 10 个字符位的标题 —— 备选的意义就是多给入口。 */
      if(ac.length<2){
        var fillPool=uniq([].concat(reserve).concat(allPool));
        for(var z3=0;z3<fillPool.length&&ac.length<2;z3++){
          var wc=fillPool[(i+ri+2+z3)%fillPool.length];
          if(altOK(wc) && cand.indexOf(wc)<0) ac.push(wc);
        }
      }'''
s = s.replace(old_e, new_e, 1)

io.open(p, 'w', encoding='utf-8').write(s)
print('patch3 ok')
