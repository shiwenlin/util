# -*- coding: utf-8 -*-
import io,sys,os
p=r"C:/Users/Admin（无密码）/WorkBuddy/2026-10-17-21-07-42/workbench/个护家清标题工作台.html"
s=io.open(p,encoding="utf-8").read()
o=s
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n:
        print("MISS(%d!=%d): %s"%(c,n,a[:70].replace("\n","\\n")));sys.exit(1)
    s=s.replace(a,b)

# ---------- 1. CSS ----------
# 先删掉旧的 .tbox .use 定义（新版带 .ok 态，后面重新插入）
rep('.tbox .use{float:right;font-size:11px;color:var(--blue);cursor:pointer;margin-left:10px}\n','')
rep('.althd{font-size:11px;color:var(--tx3);margin-top:6px;letter-spacing:.3px}',
""".althd{font-size:11px;color:var(--tx3);margin-top:6px;letter-spacing:.3px}
.svrow{display:flex;align-items:flex-start;gap:6px}
.svrow .sv{flex:1;outline:none;border-radius:4px;padding:1px 3px;margin:-1px -3px;min-width:0}
.svrow .sv:focus{background:#fff;box-shadow:0 0 0 2px var(--blue-bg)}
.cpb{flex:none;font-size:11px;color:var(--blue);border:1px solid var(--line2);border-radius:5px;padding:2px 8px;cursor:pointer;background:#fff;user-select:none;white-space:nowrap}
.cpb:hover{background:var(--blue-bg);border-color:var(--blue)}
.cpb.ok,.altchip.copied{background:var(--teal-bg)!important;border-color:var(--teal)!important;color:var(--teal)!important;border-style:solid!important}
.markw{margin-top:4px}
.tbox .use{float:right;font-size:11px;color:var(--blue);cursor:pointer;margin-left:10px}
.tbox .use.ok{color:var(--teal);font-weight:600}
#toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%) translateY(8px);background:rgba(22,40,58,.95);color:#fff;font-size:12.5px;line-height:1.5;padding:9px 14px;border-radius:8px;opacity:0;pointer-events:none;transition:opacity .18s,transform .18s;z-index:9999;max-width:78vw;word-break:break-all;box-shadow:0 4px 18px rgba(0,0,0,.18)}
#toast.on{opacity:1;transform:translateX(-50%) translateY(0)}
""")
# ---------- 2. toast 容器 ----------
i=s.rfind("</body>")
if i<0: print("MISS body");sys.exit(1)
s=s[:i]+'<div id="toast"></div>\n'+s[i:]

# ---------- 3. 复制工具函数 ----------
rep('function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}',
'''function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
/* ===== 一键复制：点哪复制哪，不切换、不弹窗打断 ===== */
function toast(m){var t=$("toast");if(!t)return;t.textContent=m;t.classList.add("on");clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove("on");},1800);}
function cpFallback(txt,cb){
  var ta=document.createElement("textarea");ta.value=txt;
  ta.style.position="fixed";ta.style.top="-1000px";ta.style.opacity="0";
  document.body.appendChild(ta);ta.focus();ta.select();
  var done=false;try{done=document.execCommand("copy");}catch(e){done=false;}
  document.body.removeChild(ta);
  if(done)cb();else window.prompt("自动复制被浏览器拦了，请手动复制：",txt);
}
function cpText(txt,el){
  txt=String(txt||"").replace(/\\s+/g," ").trim();
  if(!txt){toast("内容为空，没有可复制的");return;}
  var flash=function(){
    if(el){
      if(el.getAttribute("data-o")==null)el.setAttribute("data-o",el.textContent);
      var o=el.getAttribute("data-o");
      el.textContent="已复制 \\u2713";el.classList.add("ok");
      clearTimeout(el._ct);el._ct=setTimeout(function(){el.textContent=o;el.classList.remove("ok");},1400);
    }
    toast("已复制（"+clen(txt)+" 字符）："+txt);
  };
  if(navigator.clipboard&&navigator.clipboard.writeText&&window.isSecureContext){
    navigator.clipboard.writeText(txt).then(flash,function(){cpFallback(txt,flash);});
  }else cpFallback(txt,flash);
}
function noSel(){try{var g=window.getSelection();return !g||String(g).length===0;}catch(e){return true;}}''')

# ---------- 4. 商品标题：点「选用」= 选中 + 复制；点标题文字也复制 ----------
rep("""      '<span class="use" data-i="'+i+'">选用</span><span class="cnt">'""",
    """      '<span class="use" data-i="'+i+'" title="点击 = 选中并复制这条标题">选用并复制</span><span class="cnt">'""")

rep("""  var us=$("titles").querySelectorAll(".use");
  us.forEach(function(u){u.onclick=function(){
    $("titles").querySelectorAll(".tbox").forEach(function(b){b.classList.remove("sel");});
    u.closest(".tbox").classList.add("sel");
  };});
  L.picked=L.titles[0].text;""",
"""  var us=$("titles").querySelectorAll(".use");
  us.forEach(function(u){u.onclick=function(){
    var box=u.closest(".tbox");
    $("titles").querySelectorAll(".tbox").forEach(function(b){b.classList.remove("sel");});
    box.classList.add("sel");
    var i=parseInt(u.getAttribute("data-i"),10);
    L.picked=L.titles[i].text;
    cpText(L.titles[i].text,u);
  };});
  /* 标题文字本身也可点复制（若正在手动选中文本则不抢） */
  var vs=$("titles").querySelectorAll(".val");
  vs.forEach(function(v){
    v.title="点击复制这条标题（要手动选字就正常拖选，不会触发）";
    v.onclick=function(){
      if(!noSel())return;
      var u=v.parentNode.querySelector(".use");if(!u)return;
      $("titles").querySelectorAll(".tbox").forEach(function(b){b.classList.remove("sel");});
      v.closest(".tbox").classList.add("sel");
      var i=parseInt(u.getAttribute("data-i"),10);
      L.picked=L.titles[i].text;
      cpText(L.titles[i].text,u);
    };
  });
  L.picked=L.titles[0].text;""")

# ---------- 5. SKU 单元格重构：主推可编辑区与备选区分离（顺带修 textContent 串字 bug） ----------
old_td = """      '<td class="mono edit" contenteditable="true" data-i="'+i+'">'+esc(s.title)+
        ((s.conflict&&s.conflict.length)||(s.ghost&&s.ghost.length)||(s.builtin&&s.builtin.length)||(s.borrowed&&s.borrowed.length)
          ? '<div style="margin-top:4px">'+
            (s.conflict||[]).map(function(c){return '<span class="tag r" title="'+esc(c.why)+'">矛盾 '+esc(c.a)+'×'+esc(c.b)+'</span>';}).join(" ")+
            (s.ghost||[]).map(function(g){return '<span class="tag r">凭空规格 '+esc(g)+'</span>';}).join(" ")+
            (s.builtin||[]).map(function(w){return '<span class="tag a">内置词 '+esc(w)+'</span>';}).join(" ")+
            (s.borrowed||[]).map(function(w){return '<span class="tag a">借用词 '+esc(w)+'</span>';}).join(" ")+
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
new_td = """      '<td>'+
        '<div class="svrow"><div class="sv mono edit" contenteditable="true" data-i="'+i+'" title="要改字直接在这里编辑">'+
          esc(s.title)+'</div>'+
          '<span class="cpb" data-i="'+i+'" title="点击复制这条主推标题">复制</span></div>'+
        ((s.conflict&&s.conflict.length)||(s.ghost&&s.ghost.length)||(s.builtin&&s.builtin.length)||(s.borrowed&&s.borrowed.length)
          ? '<div class="markw">'+
            (s.conflict||[]).map(function(c){return '<span class="tag r" title="'+esc(c.why)+'">矛盾 '+esc(c.a)+'×'+esc(c.b)+'</span>';}).join(" ")+
            (s.ghost||[]).map(function(g){return '<span class="tag r">凭空规格 '+esc(g)+'</span>';}).join(" ")+
            (s.builtin||[]).map(function(w){return '<span class="tag a">内置词 '+esc(w)+'</span>';}).join(" ")+
            (s.borrowed||[]).map(function(w){return '<span class="tag a">借用词 '+esc(w)+'</span>';}).join(" ")+
            '</div>' : '')+
        (s.alts&&s.alts.length
          ? '<div class="althd">备选（点任意一条即复制，不切换主推）</div><div class="alts">'+s.alts.map(function(a,ai){
              var bad=(a.builtin&&a.builtin.length)||(a.borrowed&&a.borrowed.length);
              return '<span class="altchip'+(bad?' bad':'')+'" data-i="'+i+'" data-a="'+ai+'" title="'+esc(a.route)+'｜点击复制">'+
                '<span class="lb">'+esc(a.lb)+'</span>'+esc(a.title)+
                '<span class="ln">'+a.len+'</span>'+
                '<span class="rt">'+esc(a.route.split('：')[0])+'</span></span>';
            }).join("")+'</div>'
          : '')+'</td>'+"""
rep(old_td,new_td)

# ---------- 6. 备选：点击 = 复制（不再替换主推） ----------
rep("""  /* 备选 → 主推：点一下就把该 SKU 的标题换成这条备选（含合规标记一起换，避免报告与标题不符） */
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
  });""",
"""  /* 备选：点一下就复制这条备选文本（不切换主推，主推永远是你自己定的那条） */
  var altEls=$("skuOut").querySelectorAll(".altchip");
  altEls.forEach(function(a){
    a.onclick=function(){
      var i=parseInt(a.getAttribute("data-i"),10), ai=parseInt(a.getAttribute("data-a"),10);
      var alt=(L.skus[i].alts||[])[ai];
      if(!alt) return;
      cpText(alt.title,null);
      $("skuOut").querySelectorAll(".altchip").forEach(function(x){x.classList.remove("copied");});
      a.classList.add("copied");
      clearTimeout(a._ct); a._ct=setTimeout(function(){a.classList.remove("copied");},900);
    };
  });
  /* 主推：点「复制」复制当前（编辑后的）文本 */
  var cpbs=$("skuOut").querySelectorAll(".cpb");
  cpbs.forEach(function(b){
    b.onclick=function(){
      var i=parseInt(b.getAttribute("data-i"),10);
      var sv=$("skuOut").querySelector('.sv.edit[data-i="'+i+'"]');
      var t=sv?sv.textContent:L.skus[i].title;
      LAST.skus[i].title=t.trim(); LAST.skus[i].len=clen(t.trim());
      cpText(t,b);
    };
  });""")

# ---------- 7. 编辑取值：只取 .sv，不再把备选/标记文字串进标题 ----------
rep("""  var eds=$("skuOut").querySelectorAll("td.edit");
  eds.forEach(function(td){
    td.oninput=function(){
      var i=parseInt(td.getAttribute("data-i"),10);
      var t=td.textContent.trim();
      LAST.skus[i].title=t; LAST.skus[i].len=clen(t);
      var b=td.parentNode.querySelector(".lenbadge");""",
"""  var eds=$("skuOut").querySelectorAll(".sv.edit");
  eds.forEach(function(td){
    td.oninput=function(){
      var i=parseInt(td.getAttribute("data-i"),10);
      var t=td.textContent.trim();
      LAST.skus[i].title=t; LAST.skus[i].len=clen(t);
      var b=td.parentNode.parentNode.querySelector(".lenbadge");""")

rep("""  var eds=document.querySelectorAll("#skuOut td.edit");""",
    """  var eds=document.querySelectorAll("#skuOut .sv.edit");""")

# ---------- 8. 表头提示 ----------
rep("<th>SKU搜索标题（≤15汉字）</th>","<th>SKU搜索标题（≤15汉字 · 点「复制」即可）</th>")

io.open(p,"w",encoding="utf-8").write(s)
print("OK  delta=%d"%(len(s)-len(o)))
