# -*- coding: utf-8 -*-
import io, sys
P = '个护家清标题工作台.html'
s = io.open(P, encoding='utf-8').read()
def rep(a, b, one=True):
    global s
    if a not in s:
        print('MISS: ' + a[:60]); sys.exit(1)
    s = s.replace(a, b, 1)

# ---------- 1. CSS：双栏独立滚动 + 可拖拽分隔条 + 回顶按钮 ----------
rep(
'.grid{display:grid;grid-template-columns:400px 1fr;gap:16px;align-items:start}\n'
'@media(max-width:1000px){.grid{grid-template-columns:1fr}}',
'''.grid{display:flex;align-items:flex-start;gap:0}
#paneL{width:var(--lw,400px);flex:0 0 auto;position:sticky;top:20px;max-height:calc(100vh - 40px);overflow-y:auto;padding-right:8px;scrollbar-width:thin}
#paneR{flex:1 1 0;min-width:0;position:sticky;top:20px;max-height:calc(100vh - 40px);overflow-y:auto;padding-left:8px;scrollbar-width:thin}
#paneL::-webkit-scrollbar,#paneR::-webkit-scrollbar{width:8px}
#paneL::-webkit-scrollbar-thumb,#paneR::-webkit-scrollbar-thumb{background:var(--line);border-radius:4px}
#paneL::-webkit-scrollbar-thumb:hover,#paneR::-webkit-scrollbar-thumb:hover{background:var(--tx3)}
#splitter{flex:0 0 9px;align-self:stretch;min-height:120px;cursor:col-resize;position:relative;background:transparent}
#splitter::after{content:"";position:absolute;left:3.5px;top:4px;bottom:4px;width:2px;background:var(--line);border-radius:2px;transition:background .15s}
#splitter:hover::after,#splitter.on::after{background:var(--blue);width:3px;left:3px}
body.rs{user-select:none;cursor:col-resize}
#toTop{position:fixed;right:24px;bottom:24px;width:44px;height:44px;border-radius:50%;background:var(--card);border:1px solid var(--line);color:var(--tx2);font-size:17px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 12px rgba(0,0,0,.13);opacity:0;pointer-events:none;transform:translateY(8px);transition:opacity .18s,transform .18s,background .15s;z-index:900;font-family:inherit}
#toTop.on{opacity:1;pointer-events:auto;transform:none}
#toTop:hover{background:var(--blue-bg);color:var(--blue);border-color:var(--blue)}
@media(max-width:1000px){.grid{display:block}#paneL,#paneR{width:auto;max-height:none;overflow:visible;position:static;padding:0}#splitter{display:none}#paneR{margin-top:14px}}''')

# ---------- 2. HTML：两栏加 id + 插入分隔条 ----------
rep('<div class="grid">\n<div>\n', '<div class="grid">\n<div id="paneL">\n')
rep('</div>\n\n<div>\n  <div class="card">\n    <h2><span class="n">4</span>',
    '</div>\n<div id="splitter" title="左右拖动调整宽度 · 双击复位"></div>\n<div id="paneR">\n  <div class="card">\n    <h2><span class="n">4</span>')

# ---------- 3. 清空 SKU 清单预填值 与 规格概览 placeholder ----------
rep('<textarea id="skus">500ml单瓶\n500ml*2瓶\n300ml单瓶\n儿童款300ml\n1L补充装</textarea>',
    '<textarea id="skus" style="min-height:110px"></textarea>')
rep('<label>规格概览（写进商品标题的容量/组合，可留空）</label>\n    <input type="text" id="specAll" placeholder="例：500ml*2瓶">',
    '<label>规格概览（写进商品标题的容量/组合，可留空，例：500ml*2瓶）</label>\n    <input type="text" id="specAll">')

# ---------- 4. 回顶按钮 + 交互脚本 ----------
rep('<div id="toast"></div>\n</body>',
'''<div id="toast"></div>
<button id="toTop" title="回到顶部" aria-label="回到顶部">&#8593;</button>
<script>
(function(){
  var L=document.getElementById('paneL'),R=document.getElementById('paneR'),
      SP=document.getElementById('splitter'),TT=document.getElementById('toTop'),
      G=document.querySelector('.grid');
  function setW(w){ document.documentElement.style.setProperty('--lw',w+'px'); }
  try{ var m=localStorage.getItem('wb_lw'); if(m&&parseInt(m,10)>0) setW(parseInt(m,10)); }catch(e){}
  if(SP){
    var drag=false;
    SP.addEventListener('mousedown',function(e){ drag=true; SP.classList.add('on'); document.body.classList.add('rs'); e.preventDefault(); });
    SP.addEventListener('dblclick',function(){ setW(400); try{ localStorage.setItem('wb_lw','400'); }catch(e){} });
    document.addEventListener('mousemove',function(e){
      if(!drag||!G) return;
      var g=G.getBoundingClientRect();
      var max=Math.max(320, Math.min(760, g.width-340));
      setW(Math.min(Math.max(e.clientX-g.left,280),max));
    });
    document.addEventListener('mouseup',function(){
      if(!drag) return; drag=false; SP.classList.remove('on'); document.body.classList.remove('rs');
      try{ localStorage.setItem('wb_lw', getComputedStyle(document.documentElement).getPropertyValue('--lw').trim()); }catch(e){}
    });
  }
  function top0(el){ if(!el) return; try{ el.scrollTo({top:0,behavior:'smooth'}); }catch(e){ el.scrollTop=0; } }
  function upd(){
    var y=(L?L.scrollTop:0)+(R?R.scrollTop:0)+(window.pageYOffset||document.documentElement.scrollTop||0);
    TT.classList[y>150?'add':'remove']('on');
  }
  [L,R].forEach(function(el){ if(el) el.addEventListener('scroll',upd); });
  window.addEventListener('scroll',upd); upd();
  TT.addEventListener('click',function(){ top0(L); top0(R); try{ window.scrollTo({top:0,behavior:'smooth'}); }catch(e){ window.scrollTo(0,0); } });
})();
</script>
</body>''')

io.open(P, 'w', encoding='utf-8').write(s)
print('OK 布局补丁完成')
