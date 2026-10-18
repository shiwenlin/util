# -*- coding: utf-8 -*-
# 把 POOL_CAP / SRCW / SRCLB 提到 state 之后（init 早于原位置执行，否则是 undefined）
import io
P="个护家清标题工作台.html"
s=io.open(P,encoding="utf-8").read()
o=s
OLD1='''var POOL_CAP=20;
/* ★ 排序权重 = 「有没有真实搜索数据支撑」，不是按来源先后排 */
var SRCW={hot:300, auto:200, res:100, dict:0};
var SRCLB={hot:"热搜词（有真实搜索量）", auto:"商品名自带", res:"研究回填词", dict:"品类内置通用词"};
'''
NEW1=''
assert OLD1 in s, "OLD1 miss"
s=s.replace(OLD1,NEW1,1)

ANCHOR='var state={hot:null,vals:{sell:[],crowd:[],scene:[]},res:null,autoSell:[],blocked:{sell:[],crowd:[],scene:[]}};'
ADD=ANCHOR+'''
/* ★ 词池硬上限：超过 20 个的一律舍弃——不展示、也不进 SKU 补位池。
   理由：一个链接 6~10 个 SKU、意图位就那么多；排到 20 名以后的几乎都是品类
   内置通用词，没有真实搜索量支撑，写进标题带不来搜索，反而稀释标题权重。 */
var POOL_CAP=20;
/* ★ 排序权重 = 「有没有真实搜索数据支撑」，不是按来源先后排 */
var SRCW={hot:300, auto:200, res:100, dict:0};
var SRCLB={hot:"热搜词（有真实搜索量）", auto:"商品名自带", res:"研究回填词", dict:"品类内置通用词"};'''
assert ANCHOR in s, "ANCHOR miss"
s=s.replace(ANCHOR,ADD,1)
io.open(P,"w",encoding="utf-8").write(s)
print("OK moved")
