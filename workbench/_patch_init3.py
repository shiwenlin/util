# -*- coding: utf-8 -*-
import io, sys
P = '个护家清标题工作台.html'
s = io.open(P, encoding='utf-8').read()
def rep(a, b):
    global s
    if a not in s:
        print('MISS: ' + a[:70]); sys.exit(1)
    s = s.replace(a, b, 1)

# 提示文案 + 手动重置按钮
rep('''    <button class="mini" id="btnGuess">① 识别品类</button>
    <button class="mini" id="btnPrompt">② 生成联网研究指令</button>
    <div id="guessInfo" class="hint">未识别 · 也可直接在下方手动选类目</div>''',
'''    <button class="mini" id="btnGuess">① 识别品类</button>
    <button class="mini" id="btnPrompt">② 生成联网研究指令</button>
    <button class="mini" id="btnReset">重置</button>
    <div id="guessInfo" class="hint">未识别 · 也可直接在下方手动选类目</div>
    <div class="hint">换一个商品重新识别时，下面已填的品牌 / 规格 / SKU 清单 / 研究文本 / 词池 / 生成结果会<b>自动清空</b>，避免上一个商品的词混进新品标题。点「重置」可随时手动清空。</div>''')

rep('  $("btnParse").onclick=doParse;',
'''  $("btnParse").onclick=doParse;
  $("btnReset").onclick=function(){
    if(!isDirty()){ toast("已经是初始状态，没有可清空的内容"); return; }
    resetAll(); state.lastPname="";
    var pn=$("pname"); if(pn) pn.value="";
    toast("已清空全部内容，回到初始状态");
  };''')

io.open(P, 'w', encoding='utf-8').write(s)
print('OK')
