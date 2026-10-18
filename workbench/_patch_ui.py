import io

p = '个护家清标题工作台.html'
s = io.open(p, encoding='utf-8').read()

# ---------- 1. CSS ----------
old_css = '.chip.maybe{border-style:dashed;color:var(--tx3);'
assert old_css in s
css_add = '''.alts{margin-top:6px;display:flex;flex-direction:column;gap:3px}
.altchip{display:block;font-size:11.5px;line-height:1.5;padding:4px 8px;border:1px dashed var(--line2);border-radius:6px;color:var(--tx2);cursor:pointer;background:#FCFCFB;user-select:none;word-break:break-all}
.altchip:hover{background:var(--blue-bg);border-color:var(--blue);border-style:solid;color:var(--blue)}
.altchip .lb{display:inline-block;font-weight:700;margin-right:4px;opacity:.9}
.altchip .rt{opacity:.6;font-size:10.5px;margin-left:4px}
.altchip .ln{float:right;font-weight:600;opacity:.7}
.altchip.bad{border-color:var(--amber);color:var(--amber)}
.althd{font-size:11px;color:var(--tx3);margin-top:6px;letter-spacing:.3px}
'''
s = s.replace(old_css, css_add + old_css, 1)

# ---------- 2. SKU 表格：标题列下方展示 3 条备选 ----------
old_td = """            (s.borrowed||[]).map(function(w){return '<span class="tag a">借用词 '+esc(w)+'</span>';}).join(" ")+
            '</div>' : '')+'</td>'+"""
assert old_td in s, 'td anchor not found'
new_td = """            (s.borrowed||[]).map(function(w){return '<span class="tag a">借用词 '+esc(w)+'</span>';}).join(" ")+
            '</div>' : '')+
        (s.alts&&s.alts.length
          ? '<div class="althd">备选（点击即可设为主推）</div><div class="alts">'+s.alts.map(function(a,ai){
              var bad=(a.builtin&&a.builtin.length)||(a.borrowed&&a.borrowed.length);
              return '<span class="altchip'+(bad?' bad':'')+'" data-i="'+i+'" data-a="'+ai+'" title="'+esc(a.route)+'">'+
                '<span class="lb">'+esc(a.lb)+'</span>'+esc(a.title)+
                '<span class="ln">'+a.len+'</span>'+
                '<span class="rt">'+esc(a.route.split('：')[0])+'</span></span>';
            }).join("")+'</div>'
          : '')+'</td>'+"""
s = s.replace(old_td, new_td, 1)

# ---------- 3. 绑定点击：备选设为主推 ----------
old_bind = '''  $("skuOut").innerHTML='<table><thead><tr><th>排序</th><th>你的SKU</th><th>SKU搜索标题（≤15汉字）</th><th>字符</th><th>狙击意图</th><th>合规</th></tr></thead><tbody>'+rows+'</tbody></table>';'''
assert old_bind in s, 'bind anchor not found'
new_bind = old_bind + '''
  /* 备选 → 主推：点一下就把该 SKU 的标题换成这条备选（含合规标记一起换，避免报告与标题不符） */
  var altEls=$("skuOut").querySelectorAll(".altchip");
  altEls.forEach(function(a){
    a.onclick=function(){
      var i=parseInt(a.getAttribute("data-i"),10), ai=parseInt(a.getAttribute("data-a"),10);
      var sk=L.skus[i], alt=(sk.alts||[])[ai];
      if(!alt) return;
      sk.title=alt.title; sk.len=alt.len; sk.intent=alt.intent;
      sk.builtin=alt.builtin||[]; sk.borrowed=alt.borrowed||[]; sk.fix=alt.fix||[];
      render();
    };
  });'''
s = s.replace(old_bind, new_bind, 1)

# ---------- 4. 导出 CSV 带备选 ----------
old_csv = '''  var lines=["类型,排序,内容,字符数,狙击意图"];
  L.titles.forEach(function(t,i){lines.push("商品标题,"+(i+1)+",\\""+t.text+"\\","+clen(t.text)+",");});
  L.skus.forEach(function(s){lines.push("SKU搜索标题,"+s.rank+",\\""+s.title+"\\","+s.len+","+s.intent);});'''
assert old_csv in s, 'csv anchor not found'
new_csv = '''  var lines=["类型,排序,SKU原文,内容,字符数,狙击意图,备选"];
  L.titles.forEach(function(t,i){lines.push("商品标题,"+(i+1)+",,\\""+t.text+"\\","+clen(t.text)+",,");});
  L.skus.forEach(function(s){
    var al=(s.alts||[]).map(function(a){return a.lb+":"+a.title+"("+a.len+")";}).join(" | ");
    lines.push("SKU主推,"+s.rank+",\\""+s.raw+"\\",\\""+s.title+"\\","+s.len+","+s.intent+",");
    (s.alts||[]).forEach(function(a){
      lines.push("SKU备选,"+s.rank+",\\""+s.raw+"\\",\\""+a.title+"\\","+a.len+","+a.intent+","+a.route);
    });
  });'''
s = s.replace(old_csv, new_csv, 1)

# ---------- 5. 导出 MD 带备选 ----------
old_md = '''  md+="\\n## SKU搜索标题（≤15汉字）\\n\\n| 排序 | SKU | 搜索标题 | 字符 | 意图 |\\n|---|---|---|---|---|\\n";
  L.skus.forEach(function(s){md+="| "+s.rank+" | "+s.raw+" | `"+s.title+"` | "+s.len+" | "+s.intent+" |\\n";});'''
assert old_md in s, 'md anchor not found'
new_md = '''  md+="\\n## SKU搜索标题（≤15汉字）\\n\\n**主推**\\n\\n| 排序 | SKU | 搜索标题 | 字符 | 意图 |\\n|---|---|---|---|---|\\n";
  L.skus.forEach(function(s){md+="| "+s.rank+" | "+s.raw+" | `"+s.title+"` | "+s.len+" | "+s.intent+" |\\n";});
  md+="\\n**备选（3条／SKU，按词路分）**\\n\\n| 排序 | SKU | 词路 | 备选标题 | 字符 |\\n|---|---|---|---|---|\\n";
  L.skus.forEach(function(s){
    (s.alts||[]).forEach(function(a){
      md+="| "+s.rank+" | "+s.raw+" | "+a.route+" | `"+a.title+"` | "+a.len+" |\\n";
    });
  });'''
s = s.replace(old_md, new_md, 1)

io.open(p, 'w', encoding='utf-8').write(s)
print('patch2 ok')
