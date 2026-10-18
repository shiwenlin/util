import io, sys

p = '个护家清标题工作台.html'
s = io.open(p, encoding='utf-8').read()

old1 = '''    var pk=packSku(brand,core,cand,s.spec,30);
    var st=pk.text, usedTags=pk.tags;   // usedTags = 30字符内真正装进去的词
    var fx=fixText(st);
    var bi=usedTags.filter(function(w){ return w && isBuiltin(w); });
    var bw=usedTags.filter(function(w){ return w && isBorrowed(w,s.raw); });'''

new1 = '''    var pk=packSku(brand,core,cand,s.spec,30);
    var st=pk.text, usedTags=pk.tags;   // usedTags = 30字符内真正装进去的词
    var fx=fixText(st);
    var bi=usedTags.filter(function(w){ return w && isBuiltin(w); });
    var bw=usedTags.filter(function(w){ return w && isBorrowed(w,s.raw); });
    /* ★ 每个 SKU 再给 3 条备选标题，走三条不同词路。
       主推只占一个入口，实际投放要看数据换词，备选必须事先备好。
       关键：备选**不受「你勾了什么」限制** —— 即使一个词都没勾选，
       也要从完整词池（研究回填 + 热搜长尾 + 品类内置 + 时段词）里按搜索规则给出。
       三条备选同样要过「不矛盾 + 严格模式真实性」校验，不能因为是备选就放水。 */
    var altRoutes=[
      {lb:"A",route:"场景人群路：抓「在哪用 / 谁在用」的搜索意图",
       pool:uniq([].concat(poolFor("scene")).concat(poolFor("crowd")))},
      {lb:"B",route:"热搜长尾路：抓蓝海值高的真实搜索词",
       pool:uniq([].concat((state.hot||[]).map(function(r){return r.k;}))
                   .concat((state.res&&state.res.hot)||[]))},
      {lb:"C",route:"时段卖点路：抓当季营销主题 + 剩余功效词",
       pool:uniq([].concat(mf.tag||[]).concat(poolFor("sell")))}
    ];
    var alts=[];
    altRoutes.forEach(function(rt,ri){
      var ac=[];
      /* 本 SKU 原文自带的真实属性词优先（真实性 > 一切），但必须与主推错开 */
      dictScan(s.raw).forEach(function(w){
        if(ac.length>=2) return;
        if(rt.pool.indexOf(w)<0 && cand.indexOf(w)<0) return;
        if(ac.indexOf(w)>-1 || s.spec.indexOf(w)>-1 || cand.indexOf(w)>-1) return;
        if(findConflict([s.spec].concat(ac).concat([w])).length) return;
        ac.push(w);
      });
      /* 从该词路取词：不受勾选限制，但必须过「不矛盾 + 严格模式真实性」 */
      var altOK=function(w){
        return !!w && ac.indexOf(w)<0 && s.spec.indexOf(w)<0 && clen(w)<=12
          && !findConflict([s.spec].concat(ac).concat([w])).length
          && !(strict && isBorrowed(w,s.raw) && dictScan(s.raw).indexOf(w)<0);
      };
      for(var z=0;z<rt.pool.length&&ac.length<2;z++){
        var wa=rt.pool[(i+ri+z)%rt.pool.length];
        if(altOK(wa)) ac.push(wa);
      }
      /* 挑不到就换起点轮转，保证 3 条备选真的不一样 */
      if(!ac.length){
        for(var z2=0;z2<rt.pool.length&&ac.length<2;z2++){
          var wb=rt.pool[(i+ri+1+z2)%rt.pool.length];
          if(altOK(wb) && cand.indexOf(wb)<0) ac.push(wb);
        }
      }
      if(!ac.length) return;
      var ak=packSku(brand,core,ac,s.spec,30);
      var afx=fixText(ak.text);
      if(!afx.text || afx.text===fx.text) return;
      alts.push({lb:rt.lb,route:rt.route,title:afx.text,len:clen(afx.text),
                 intent:ak.tags.join(" / "),fix:afx.log,
                 builtin:ak.tags.filter(function(w){ return w && isBuiltin(w); }),
                 borrowed:ak.tags.filter(function(w){ return w && isBorrowed(w,s.raw); })});
    });
    /* 三条备选之间不能重复 */
    var seenAlt={};
    alts=alts.filter(function(a){ if(seenAlt[a.title]) return false; seenAlt[a.title]=1; return true; });'''

assert old1 in s, 'anchor1 not found'
s = s.replace(old1, new1)

old2 = '''            own:uniq((o.own||[]).concat(dictScan(s.raw)))};'''
new2 = '''            own:uniq((o.own||[]).concat(dictScan(s.raw))),alts:alts};'''
assert old2 in s, 'anchor2 not found'
s = s.replace(old2, new2)

io.open(p, 'w', encoding='utf-8').write(s)
print('patch1 ok')
