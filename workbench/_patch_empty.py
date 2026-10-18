# -*- coding: utf-8 -*-
import io, sys
P = '个护家清标题工作台.html'
s = io.open(P, encoding='utf-8').read()
a = '  var linesAll=$("skus").value.split("\\n").map(function(s){return s.trim();}).filter(Boolean).map(parseSku);'
b = ('  var linesAll=$("skus").value.split("\\n").map(function(s){return s.trim();}).filter(Boolean).map(parseSku);\n'
     '  if(!linesAll.length) toast("SKU 清单是空的 —— 商品标题已生成；SKU 搜索标题要在左侧填好规格后再生成一次");')
if a not in s:
    print('MISS'); sys.exit(1)
s = s.replace(a, b, 1)
io.open(P, 'w', encoding='utf-8').write(s)
print('OK')
