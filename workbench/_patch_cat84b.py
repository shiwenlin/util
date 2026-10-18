# -*- coding: utf-8 -*-
import io
P = '个护家清标题工作台.html'
s = io.open(P, encoding='utf-8').read()
n = 0

# 1. 补充归类词典（只用于判类，不进 dictScan）
a = 'var X_CROWD=["住宿群体","差旅人士","贴身衣物用户","家庭主妇"];\nvar X_SCENE=["学生宿舍"];'
b = ('var X_CROWD=["住宿群体","差旅人士","贴身衣物用户","家庭主妇","养宠家庭","有老人小孩家庭","老人","租房","租房党","家庭"];\n'
     'var X_SCENE=["学生宿舍","拖地","地面","地板","物体表面","门把手","垃圾桶","厨房台面","白色衣物浸泡","衣物浸泡","全屋"];')
assert a in s, 'miss X dic'
s = s.replace(a, b, 1); n += 1

# 2. 84 品类 sell 里「家庭装」是规格词，挪出卖点池
a2 = 'sell:["含氯配方","去渍增白","去黄","除霉斑","除异味","浓缩","低泡易漂","无色不染色","家庭装"],'
b2 = 'sell:["含氯配方","去渍增白","去黄","除霉斑","除异味","浓缩","低泡易漂","无色不染色","清新无香"],'
assert a2 in s, 'miss sell line'
s = s.replace(a2, b2, 1); n += 1

io.open(P, 'w', encoding='utf-8').write(s)
print('patched', n)
