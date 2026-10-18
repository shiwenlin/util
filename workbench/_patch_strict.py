import io

p = '个护家清标题工作台.html'
s = io.open(p, encoding='utf-8').read()

# strict 需提前到兜底之前定义
old1 = '  if(!sell.length) sell=c.sell.slice(0,2);\n  if(!scene.length) scene=c.scene.slice(0,1);'
assert old1 in s, 'anchor1'
new1 = '''  var strictSrcEl=$("strictSrc");
  var strict=!!(strictSrcEl && strictSrcEl.checked);
  /* 没勾选时的兜底：严格模式下只能从「研究回填词池」取真实词，
     绝不能兜到品类内置词 —— 那是凭空造词（氨基酸/不干手这类），属虚假宣传。
     宽松模式才允许内置词兜底，并会在报告里标黄提示。 */
  if(!sell.length)  sell  = strict ? ((state.res&&state.res.sell||[]).slice(0,2))  : c.sell.slice(0,2);
  if(!scene.length) scene = strict ? ((state.res&&state.res.scene||[]).slice(0,1)) : c.scene.slice(0,1);'''
s = s.replace(old1, new1, 1)

# 原定义改为赋值，避免重复 var
old2 = '  var strict=!!$("strictSrc") && $("strictSrc").checked;'
assert old2 in s, 'anchor2'
s = s.replace(old2, '  strict=!!($("strictSrc") && $("strictSrc").checked);', 1)

io.open(p, 'w', encoding='utf-8').write(s)
print('patch4 ok')
