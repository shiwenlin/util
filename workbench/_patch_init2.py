# -*- coding: utf-8 -*-
import io, sys
P = '个护家清标题工作台.html'
s = io.open(P, encoding='utf-8').read()
def rep(a, b):
    global s
    if a not in s:
        print('MISS: ' + a[:70]); sys.exit(1)
    s = s.replace(a, b, 1)

# 抽成公共函数：商品名一变，旧内容全部作废
rep('''  $("btnGuess").onclick=function(){
    var nm=$("pname").value.trim();
    /* ★ 换商品重新识别 → 先把上一个商品填的东西清干净，避免旧词混进新品的标题 */
    if(nm && nm!==(state.lastPname||"") && isDirty()){
      resetAll();
      toast("已清空上一个商品的内容，重新开始");
    }
    if(nm) state.lastPname=nm;
    doGuess();
  };''',
'''  $("btnGuess").onclick=function(){ maybeResetOnNewProduct(); doGuess(); };''')

rep('''  $("btnPrompt").onclick=function(){
    doGuess(true);''',
'''  $("btnPrompt").onclick=function(){
    maybeResetOnNewProduct();
    doGuess(true);''')

rep('function doGuess(silent){',
'''/* ★ 换商品了（商品名与上次识别的不同）→ 上一个商品填的东西全部作废，先回到初始状态 */
function maybeResetOnNewProduct(){
  var nm=$("pname").value.trim();
  if(!nm) return false;
  if(nm===(state.lastPname||"")) return false;
  state.lastPname=nm;
  if(!isDirty()) return false;
  resetAll();
  toast("换了商品 · 已清空上一个商品的内容，重新开始");
  return true;
}

function doGuess(silent){''')

io.open(P, 'w', encoding='utf-8').write(s)
print('OK')
