var SCENES = {
  job:{id:'job',name:'求职 / 实习',desc:'校招实习综合面试：表达、动机、匹配度与职业规划',icon:'briefcase',color:'job'},
  tech:{id:'tech',name:'技术开发岗',desc:'大数据 / 后端开发面试：技术栈、项目深挖与系统设计',icon:'code',color:'tech'},
  data:{id:'data',name:'数据分析岗',desc:'数据分析 / 商业分析面试：分析思维、SQL 与业务题',icon:'chart',color:'data'},
  product:{id:'product',name:'产品 / 运营岗',desc:'产品经理与运营面试：用户思维、方案设计与案例题',icon:'target',color:'product'},
  general:{id:'general',name:'通用行为面试',desc:'STAR 行为面试高频题：优缺点、抗压、协作与复盘',icon:'users',color:'general'}
};
var QUESTIONS = [
  {id:'j1',scene:'job',lv:1,q:'请做一下自我介绍。',point:'考察表达逻辑、亮点提炼与时间控制。',tips:['控制在 1-2 分钟，按"我是谁 → 我有什么 → 为什么适合"三段式','用 2-3 个核心标签（专业、成绩、竞赛、证书）串起经历','结尾落到岗位匹配点，别流水账式报履历'],ans:['我是 XX 大学 XX 专业的学生，GPA 排名专业前 X%，专业课基础扎实。','大学期间参加过数学建模、传智杯等竞赛，也在嵌入式方向考取了电工证，实践能力比较突出。','其中最能代表我的是 XX 项目/竞赛：我负责 XX 部分，最终取得了 XX 结果。','今天应聘这个岗位，是因为我的技术栈（如 Python/大数据）和项目经历与岗位要求高度匹配，希望能获得这次机会。']},
  {id:'j2',scene:'job',lv:2,q:'介绍一下你做过的一个项目或竞赛经历。',point:'考察项目真实度、技术深度与个人贡献，最容易追问细节。',tips:['用 STAR 法则：背景 → 任务 → 行动 → 结果','明确说出"你负责的部分"而非"我们做了什么"','准备好被追问：数据来源、技术选型、遇到的坑、可改进处'],ans:['背景：去年参加数学建模大赛，题目是 XX，需要在三天内完成建模与论文。','我的任务：主要负责数据处理和建模部分，用 Python 对原始数据做了清洗与特征工程。','行动：对比了几种模型后选定 XX 方法，反复调参并把误差从 X 降到 Y。','结果：最终获得 XX 奖。这段经历让我对数据分析和团队协作的理解深了很多。']},
  {id:'j3',scene:'job',lv:2,q:'为什么选择我们公司 / 这个岗位？',point:'考察求职动机、是否做过公司调研、人岗匹配度。',tips:['面试前查官网和新闻，至少说出 1-2 个公司真实特点','按"行业前景 + 公司特点 + 岗位匹配"三层展开','避免空泛的"贵公司很优秀"，要具体'],ans:['首先是行业层面，大数据/XX 方向正处于快速落地阶段，发展空间大。','其次我了解到贵公司在 XX 业务/技术上做得很有特色（举具体例子），这个方向正是我想深耕的。','最后是匹配：我掌握的 XX 技能和竞赛项目经历，能直接为这个岗位带来价值，我也愿意从基础做起快速成长。']},
  {id:'j4',scene:'job',lv:1,q:'你的优点和缺点分别是什么？',point:'考察自我认知、坦诚度与改进意识。',tips:['优点要与岗位相关且配例证，别只堆形容词','缺点选"真实但不致命"的，并给出具体改进动作','避免"我最大的缺点是太完美主义"这类套话'],ans:['优点方面：我学习能力强，GPA 专业前 X%；做事有闭环，竞赛/项目里负责的部分都按时高质量交付。','缺点方面：我实践经验还比较少，对生产环境的复杂度认识不足。','针对这点我正在弥补：刷开源项目、做实习投递、跟学长请教真实项目里的坑，争取尽快补齐短板。']},
  {id:'j5',scene:'job',lv:3,q:'说说你对大数据技术栈（Hadoop/Hive/Spark 等）的理解。',point:'考察技术功底与学习深度，看是否真学过而非背概念。',tips:['按"数据从采集到分析"的一条链路串起来讲，体现整体观','讲清每层"为什么存在、解决什么问题"，而非只报组件名','结合你做过的项目谈具体使用，会明显加分'],ans:['大数据要解决的是单机处理不了的海量数据问题，核心思路是"分布式"。','存储层用 HDFS 做分布式文件系统；调度层 Yarn 负责资源管理；计算层 MapReduce 适合离线批处理，Spark 基于内存更快，还支持流处理。','分析层 Hive 把 SQL 翻译成 MapReduce/Spark 任务，降低了门槛，适合数仓场景。','我自己在 XX 项目里用过 XX，遇到的主要问题是数据倾斜和资源调优，通过 XX 方式解决。']},
  {id:'j6',scene:'job',lv:2,q:'工作中和同事意见不合时，你会怎么处理？',point:'考察沟通协作能力与情绪管理。',tips:['体现"先沟通后升级"的顺序：倾听 → 对齐目标 → 用事实说话 → 必要时求助','强调对事不对人','可以举一个假设或真实例子收尾'],ans:['我会先冷静倾听对方的完整观点，确认分歧点到底在哪。','然后回到共同目标——我们的最终目的是一致的，只是路径不同，围绕目标重新对齐。','如果还有分歧，我会用数据、文档或小实验来验证谁的方式更可行，而不是争论谁对谁错。','确实解决不了再向导师/上级求助，把问题及时暴露而不是拖延。']},
  {id:'j7',scene:'job',lv:1,q:'你怎么看待加班？',point:'考察工作态度与真实预期，试探稳定性。',tips:['认可必要加班（项目冲刺、线上故障），表明愿意配合','同时表达会通过提升效率减少无效加班','别承诺无条件 996，也别直接拒绝，谈"项目导向"'],ans:['我能接受以项目和结果为导向的加班，比如上线冲刺、线上问题处理，该顶上去我会顶。','同时我会尽量通过提升效率、提前规划来减少被动加班，因为高效产出对公司和自己都更好。','我也希望了解团队实际的加班节奏和原因，做到心中有数、双向匹配。']},
  {id:'j8',scene:'job',lv:2,q:'你的职业规划是什么？',point:'考察稳定性、进取心与自我认知。',tips:['按 1 年 / 2-3 年 / 3-5 年分阶段讲','每阶段要有"动作 + 产出"，别只说想当专家','把规划与应聘岗位的成长路径绑定'],ans:['第一年：快速融入，熟悉业务和团队技术栈，把基本功打扎实，能独立完成分配的任务。','2-3 年：在 XX 方向形成专长，能独立负责一个模块或小型项目，并开始带新人。','3-5 年：成为团队骨干，往技术专家或项目负责人的方向发展，把个人成长和公司业务绑定。']},
  {id:'j9',scene:'job',lv:1,q:'你有什么想问我们的吗？（反问环节）',point:'考察主动性、关注点与思考深度。',tips:['准备 2-3 个问题，体现你对岗位的认真','优先问业务方向、团队分工、新人培养、技术栈','避免直接问薪资福利细节，别说"没有问题"'],ans:['想问一下：目前团队主要负责的业务方向是什么，新人一般会从哪块入手？','另外团队的技术栈和近期的技术规划是怎样的，我想提前补相关技能。','还想了解公司对新人的培养机制，比如有没有导师带教和定期的成长反馈。']},
  {id:'j10',scene:'job',lv:2,q:'你的期望薪资是多少？',point:'考察自我定位与市场认知。',tips:['结合行业校招/实习行情给出一个区间，不给死数','强调更看重平台与成长，薪资可谈','可以反问公司的薪酬结构，把球抛回去'],ans:['我了解过目前行业里这个岗位的大致行情，结合我的能力和经历，期望在 XX 到 XX 之间。','当然我更看重的是平台和成长空间，薪资可以结合公司的薪酬体系来谈。','也想顺便了解下贵公司的薪酬结构，比如基础薪资、绩效和涨薪机制是怎样的。']},
  {id:'t1',scene:'tech',lv:1,q:'请做技术向的自我介绍。',point:'考察技术画像、亮点提炼与岗位匹配度。',tips:['按"技术栈 → 项目/竞赛 → 匹配点"三段式','突出 1-2 个最硬的技术亮点，别罗列工具名','技术栈要和目标岗位需求对齐'],ans:['我是 XX 专业的学生，主攻大数据方向，技术栈以 Python、Java 和 Hadoop 生态为主。','最硬的一段经历是 XX 项目/数学建模竞赛：我负责 XX 部分，用 XX 技术解决了 XX 问题，最终取得 XX 结果。','平时对新技术保持敏感，学过 Hive、Spark，也做过 XX 练习项目。','应聘这个岗位，是因为我的技术栈和项目经历与岗位需求匹配，希望从基础做起把工程能力练扎实。']},
  {id:'t2',scene:'tech',lv:3,q:'深挖项目：你项目中遇到的最大技术难点是什么，怎么解决的？',point:'考察技术深度、问题排查与复盘能力，是技术面必追问的题。',tips:['用"现象 → 定位 → 根因 → 解决 → 验证"的链路讲','难点要和你的技术栈真实相关，细节经得起追问','不要只讲"我调了参数"，要讲清楚为什么'],ans:['项目中印象最深的技术难点是 XX：现象是任务运行变慢/结果不对。','定位过程：先复现，再用日志和工具（如 Spark UI、Hive explain）逐层排查，最终锁定到 XX 环节。','根因是 XX（比如数据倾斜、参数配置、类型转换），我通过 XX 方案解决，并对结果做了验证和回归。','这件事让我养成了"先定位根因再动手改"的习惯。']},
  {id:'t3',scene:'tech',lv:2,q:'讲讲你的技术栈，以及为什么选它们。',point:'考察技术认知深度，判断是真学过还是背概念。',tips:['按"语言 / 框架 / 存储 / 组件"分层讲','每个技术说清"解决什么问题、为什么用它"','结合一个真实场景讲选型，体现整体观'],ans:['语言层面：Python 做数据处理和脚本开发，Java 打工程基础，两者都在项目里实际用过。','大数据组件：Hadoop 做分布式存储和计算，Hive 做数仓查询，Spark 做更快的内存计算，各解决各的问题。','选型逻辑是按场景：离线批量用 Hive/Spark，实时用 Flink，存储按冷热分层选 HDFS 或对象存储。','我对这条链路有实操认知，也愿意继续深挖。']},
  {id:'t4',scene:'tech',lv:3,q:'Hadoop 和 Spark 有什么区别？实际中怎么选？',point:'考察大数据核心概念理解，高频基础题。',tips:['对比维度：批/流、内存计算、API 丰富度、生态','说清各自适用场景，而不是背定义','结合你实际用过的场景收尾'],ans:['MapReduce 是磁盘迭代计算，适合超大离线批处理，稳定但慢；Spark 基于内存做 DAG 计算，快很多，还支持流处理和机器学习库。','选型上：离线 T+1 的数仓任务用 Spark/Hive 就够，实时场景再上 Flink；数据量极大且对时效不敏感时 MapReduce 仍可用。','我自己在 XX 项目里用 Spark 处理过 XX 数据，明显比 MR 快，体会到内存计算的价值。']},
  {id:'t5',scene:'tech',lv:3,q:'如何排查一个数据倾斜问题？',point:'考察大数据调优实战经验，技术面高频题。',tips:['先讲怎么定位（看 task 卡顿、key 分布）','再讲常见原因：热点 key、分区不均、join 倾斜','最后给方案：加盐、两阶段聚合、广播小表，并说要验证'],ans:['先定位：通过 Spark UI/Hive 日志看有没有个别 task 耗时远超平均，再抽样检查 key 分布，确认倾斜的 key。','常见原因：某个热点 key 数据量极大、join 时小表膨胀、分区字段分布不均。','解决方案：热点 key 加盐打散再两阶段聚合；join 倾斜可以用广播变量或把倾斜 key 单独处理；合理设置分区键和并行度。','改完一定用相同数据量回归对比，确认任务时间和数据正确性都有保障。']},
  {id:'t6',scene:'tech',lv:3,q:'让你设计一个简单的用户行为分析系统，你会怎么做？',point:'考察系统设计思路与架构感。',tips:['按"接入 → 存储 → 计算 → 输出"分层讲','说清每层选什么技术、为什么','不需要完美方案，展示思路闭环即可'],ans:['数据接入：埋点上报到消息队列（Kafka），保证削峰和可重放。','存储：原始明细进数仓分层（ODS/DWD/DWS），按查询场景决定分区和压缩。','计算：离线指标用 Hive/Spark 批处理跑 T+1，实时指标用 Flink 流式汇总。','输出：结果落到数仓供 BI 看板和分析师查询，同时做质量监控和数据血缘。','设计核心是"分层解耦"，每层职责单一，出问题好定位。']},
  {id:'t7',scene:'tech',lv:2,q:'你一般如何学习一门新技术？',point:'考察学习能力与方法论。',tips:['给出可复制的路径：文档 → 动手 → 源码/社区 → 沉淀','强调"以用带学"，别只刷教程','结合你真实学过的新技术举例'],ans:['我的路径是四步：先读官方文档和架构概览，搞清楚它解决什么问题；然后拿一个小需求动手做，遇到坑是最快的学习；再深入看源码或社区最佳实践，理解原理；最后写笔记/分享沉淀。','比如学 Spark 时，我先跑通官方例子，再拿项目数据做调优，再去读 Shuffle 原理相关文章。','我习惯"以用带学"，学完必须产出代码或笔记，不然不算学会。']},
  {id:'t8',scene:'tech',lv:2,q:'手写代码 / 算法题你是怎么准备的？',point:'考察算法基础与面试应变。',tips:['先打牢数据结构基础（数组/链表/哈希/树/图/DP）','按高频题型刷，每道题想清楚时间空间复杂度','现场先说思路再动手，卡住了敢于和面试官交流'],ans:['基础阶段：把数组、链表、哈希、树、动态规划等核心数据结构吃透，动手实现过一遍。','刷题阶段：按题型分类练（排序、双指针、栈队列、DFS/BFS、DP 等），每道题要求自己能讲清思路和复杂度。','现场策略：先和面试官对齐题意和边界，说思路再写代码，写完后主动测几个用例。','遇到卡点我会大方地说"我有 XX 想法，但 XX 环节不太确定"，面试官通常愿意引导。']},
  {id:'t9',scene:'tech',lv:2,q:'讲一个你印象最深的 bug 或踩坑经历。',point:'考察排错能力与复盘习惯。',tips:['描述"现象 → 定位过程 → 根因 → 修复 → 教训"','突出你独立排查的过程而非结果','教训要落到方法论，别只讲故事'],ans:['印象最深的是 XX：现象是数据统计结果偶发性偏差，时对时不对。','定位过程：先对比正常/异常的数据特征，缩小范围到 XX 环节，再通过日志和单测复现，最终发现是 XX（比如空值、时区、作用域）问题。','修复后补了单测和边界处理，回归通过。','教训是：偶发 bug 多半藏在边界条件里，排查要先假设最坏情况再逐一排除，这个思路后来帮我很快解决过类似问题。']},
  {id:'t10',scene:'tech',lv:3,q:'线上服务出了故障，你会怎么处理？',point:'考察应急意识、责任心与流程规范。',tips:['顺序很重要：先止血再查因','说清"降级 / 回滚 / 重启"这类应急动作','收尾要提到复盘和文档沉淀'],ans:['第一原则是先止血：评估影响面，能降级先降级、能回滚先回滚，把用户影响控制在最小，同时同步相关同学。','然后立刻组织定位：看监控、日志、错误信息，定位根因，评估是代码、数据还是配置问题。','修复后先小流量验证再逐步放开，最后补测试和监控告警。','事后一定要复盘：写事故报告，明确根因、改进项和责任人，避免同类问题再发生。']},
  {id:'d1',scene:'data',lv:1,q:'请做数据分析向的自我介绍。',point:'考察表达、数据分析画像与岗位匹配度。',tips:['突出"分析技能 + 项目案例 + 业务理解"','用数字说话：处理过多少数据、提升了什么指标','结尾落到你能为业务带来什么'],ans:['我是 XX 专业的学生，擅长用数据回答问题：Python 做数据处理、SQL 查数、可视化做呈现，工具都是为分析服务的。','最有代表性的是 XX 项目：我分析了 XX 数据，发现 XX 问题，提出 XX 建议，落地后提升了 XX。','我喜欢把"数据"翻译成"业务语言"，这也是我想做数据分析的原因。']},
  {id:'d2',scene:'data',lv:2,q:'一个完整的数据分析项目，你会怎么做？',point:'考察方法论是否成体系。',tips:['按"明确问题 → 取数 → 分析 → 结论 → 落地"讲','强调第一步最重要：把业务问题翻译成分析问题','收尾讲如何验证和推动落地'],ans:['第一步明确问题：和业务方对齐"要解决什么"，把它翻译成可量化的分析目标。','第二步取数：写 SQL 拉数，先做数据质量检查，保证口径一致。','第三步分析：根据问题选方法，常用对比分析、拆解分析、漏斗分析、相关性分析，必要时建模。','第四步结论：用图表和一句话讲清"发生了什么、为什么、怎么办"。','最后推动落地并跟踪效果，形成分析闭环，而不是交完报告就结束。']},
  {id:'d3',scene:'data',lv:3,q:'如何为一个业务构建指标体系？',point:'考察指标体系思维，数据面核心题。',tips:['先定北极星指标，再拆漏斗和分层','指标要可量化、口径清晰、能指导行动','举例说明（如电商/教育业务）更生动'],ans:['第一步定北极星指标：衡量业务长期价值的那个数，比如电商的 GMV、教育的完课率，其它指标都服务于它。','第二步拆结构：按用户旅程拆漏斗（曝光→点击→转化→复购），按维度拆（渠道/用户分层/品类）。','第三步定过程指标：每个环节选 1-2 个可执行的指标，比如转化率、客单价、留存率，配好口径和统计周期。','最后定期 review：指标是否还能指导决策，该迭代就迭代。']},
  {id:'d4',scene:'data',lv:3,q:'某核心指标突然下降，你怎么排查？',point:'考察分析思维与排查路径，数据面高频题。',tips:['用"排除法"：先排除口径/数据问题，再看业务动作和外部因素','按"时间 → 维度 → 假设验证"推进','结论要落到根因，不浅尝辄止'],ans:['先确认数据本身没问题：统计口径有没有变、数据延迟或缺失、代码有没有改动，排除"假下降"。','然后定位范围：按时间看从哪天开始、按渠道/地区/用户群拆，把下降收敛到某个维度。','接着找原因：对照业务动作（活动、改版、价格）和外部因素（竞品、假期、舆情），形成假设。','最后验证假设：用数据检验（相关性、分组对比），确认根因后给出建议并持续监控。']},
  {id:'d5',scene:'data',lv:3,q:'留存分析和漏斗分析，你分别怎么做？',point:'考察常用分析方法掌握。',tips:['漏斗：定位流失最重的环节并找原因','留存：按周期看次留/周留/月留，分析激活与召回','都要落到"怎么改"而非只描述现象'],ans:['漏斗分析：先按关键路径（如注册→首购→复购）把转化率摆出来，找到流失最大的环节；再针对该环节拆原因——是入口不足、流程卡点还是激励缺失，做 A/B 验证。','留存分析：按用户首次使用时间分组，看次日/7日/30日留存，比较不同渠道和功能模块的留存差异，找出"留下的用户都在用什么"。','两类分析最终都要落到行动：要么优化流程、要么做激活召回，并用数据验证效果。']},
  {id:'d6',scene:'data',lv:2,q:'数据质量问题，你一般怎么处理？',point:'考察数据治理意识。',tips:['讲清常见质量问题的类型','给出从"发现 → 定位 → 修复 → 预防"的闭环','强调口径统一和监控'],ans:['常见问题：缺失值、重复数据、口径不一致、异常值、数据延迟。','处理闭环：先建立质量监控（跑批检查、阈值告警、去重校验），发现问题先定位是源头、传输还是加工环节。','修复后要沉淀规则：比如清洗规则、校验逻辑、口径文档，让问题从"事后补救"变成"事前预防"。','我一般会在项目开始时先花时间把数据摸清楚，后面分析会省很多事。']},
  {id:'d7',scene:'data',lv:2,q:'如何向业务同事解释一个复杂的数据结论？',point:'考察沟通表达，面向非技术受众的场景。',tips:['先讲结论再讲过程，用业务语言','用图表和类比降低理解成本','把"数据"翻译成"行动建议"'],ans:['原则是先讲结论：用一句话说清"我们发现了什么、建议做什么"，再展开依据。','过程中尽量用业务听得懂的语言和图表，比如用"每 100 个用户里有 60 个流失"而不是报一个复杂的流失率口径。','重要结论我会主动上门对齐一次，现场回答疑问，避免发一份报告了事。','最后给出行动建议和预期效果，让数据真正被业务用起来。']},
  {id:'d8',scene:'data',lv:2,q:'给你一张活跃表，怎么算近 7 日活跃用户数？',point:'考察 SQL 基础能力。',tips:['先讲口径：自然日去重 vs 滚动窗口','给出 DATE_SUB / BETWEEN 写法','提醒 DISTINCT 去重、日期字段类型要正确'],ans:['口径先说清：是"今天往前 7 个自然日的独立活跃用户"，还是"近 7 日窗口每日分别计算"。','写法上：SELECT COUNT(DISTINCT user_id) FROM 活跃表 WHERE 日期字段 BETWEEN 今天-6天 AND 今天，日期字段用 DATE_SUB 或 BETWEEN 处理。','注意点：日期字段要转成正确类型、跨月要小心、user_id 去重要用 DISTINCT；表很大时按日期分区裁剪。','如果还要分渠道/分日看，就 GROUP BY 相应维度。']},
  {id:'d9',scene:'data',lv:3,q:'如果让你提升某个指标（比如完课率），你会怎么做？',point:'考察业务落地能力，数据面高频题。',tips:['先拆指标：完课率 = 完成人数/开始人数，逐层找抓手','按"现状诊断 → 原因 → 方案 → 验证"讲','方案要可执行、可量化'],ans:['先诊断：把完课率拆开看——是开始学习的人少，还是中途流失多？按课程/用户群拆，找到最差的环节。','再找原因：流失集中在课程哪里？内容太难、时长太长、缺乏激励还是提醒缺失？用数据和调研验证。','然后定方案：比如优化课程分段（把长课拆短）、增加进度激励和打卡提醒、对高频流失点做内容调整。','最后 A/B 验证：小流量对比完课率变化，跑通了再全量，并持续监控回落。']},
  {id:'d10',scene:'data',lv:3,q:'你如何验证一个 A/B 实验的结果？',point:'考察实验方法论。',tips:['讲清实验前提：样本量、分组随机、实验周期','用显著性判断，不只看均值','提到陷阱：新奇效应、干扰、多重比较'],ans:['先保证实验设计正确：样本量足够（跑之前估算）、用户随机分组且互不干扰、指标在实验前就定好。','结果判断：看核心指标和次要指标的差异，用显著性检验（t 检验/置信区间）判断是真实提升还是随机波动，不只比较均值。','注意陷阱：新奇效应（新功能短期虚高）、实验组相互影响、多指标多重比较，都要控制。','最后结合长期效果决定全量、优化或下线，并记录实验文档沉淀经验。']},
  {id:'p1',scene:'product',lv:1,q:'请做产品 / 运营向的自我介绍。',point:'考察表达与岗位画像。',tips:['突出"用户思维 + 案例 + 落地能力"','讲一个你做过的活动/功能/分析案例','收尾说清为什么想做这个岗位'],ans:['我是 XX 专业的学生，平时喜欢拆解产品，对用户需求和运营玩法比较敏感。','代表性经历是 XX：我在 XX 场景里负责 XX（比如组织活动、做用户调研、分析数据），最终取得 XX 结果。','我的特点是"想法能落地"：既会想方案，也会把执行细节和复盘做扎实。','这也是我选择产品/运营方向的原因。']},
  {id:'p2',scene:'product',lv:1,q:'为什么想做产品 / 运营？',point:'考察动机与自我认知。',tips:['动机要具体：讲触发你做决定的事/人','结合你的能力和性格，说清匹配度','避免"我觉得产品很有趣"这种空话'],ans:['触发点：我在 XX 经历里（比如组织活动、做小辅导员）发现，自己特别喜欢"发现问题-设计方案-推动落地"这个过程。','匹配度：我共情能力强，愿意站在用户角度想问题；又比较有执行力，能把方案推进到落地。','而且我一直在补专业知识：看行业文章、拆解产品、学基础的数据分析，为这个方向做准备。']},
  {id:'p3',scene:'product',lv:2,q:'评价一个你常用的 App / 产品。',point:'考察产品 sense 与拆解能力。',tips:['选一个你真正高频使用的产品','用"用户-场景-价值"框架拆，别只夸','讲一个你觉得可以改进的点，体现思考'],ans:['我高频用的是 XX：它的目标用户是 XX，核心场景是 XX，解决的价值是 XX。','做得好的地方：XX（比如交互简单、路径短、激励到位），我举一个具体使用体验说明。','可改进的点：XX（比如新用户引导太长、某功能藏得深），如果是我会怎么调整，预期效果是什么。','我不只停留在"好不好用"，会去想"为什么这么设计"。']},
  {id:'p4',scene:'product',lv:2,q:'如何发现和验证用户需求？',point:'考察用户思维与方法论。',tips:['给方法组合：调研 + 访谈 + 数据分析 + 竞品','强调需求要验证，不是拍脑袋','讲"真需求 vs 伪需求"的判断'],ans:['发现需求：通过用户访谈和问卷收集痛点，结合数据分析（搜索、反馈、流失）和竞品观察找线索。','验证需求：把需求转成假设，做 MVP 小范围测试或用户可用性验证，看真实行为和反馈，判断是真需求还是伪需求。','判断标准：需求是否高频、刚需、可付费/可留存，以及解决后是否带来可量化的价值。','我习惯"先验证再投入"，避免自嗨式做功能。']},
  {id:'p5',scene:'product',lv:2,q:'设计一个功能，你会怎么规划？',point:'考察功能设计流程。',tips:['流程：目标 → 用户与场景 → 方案 → 评估与迭代','讲一个具体功能更生动','包含"怎么衡量成功"'],ans:['先定目标：这个功能要解决什么用户问题、服务什么业务指标。','再明确用户和场景：谁在什么情况下用，核心路径是什么，把使用流程画清楚。','然后给方案：功能形态、交互流程、关键规则，尽量做小版本先跑。','最后定评估指标：上线后看什么数据判断成功与否，再迭代优化，形成闭环。']},
  {id:'p6',scene:'product',lv:2,q:'运营一个活动从 0 到 1，你会怎么落地？',point:'考察活动策划与执行力。',tips:['按"目标 → 玩法 → 节奏 → 资源 → 复盘"讲','突出可落地细节：物料、预算、排期、风险','结尾讲怎么衡量活动效果'],ans:['先定目标：拉新、促活还是转化，目标决定玩法和口径。','再设计玩法：主题要吸引目标用户，机制简单易懂（打卡/抽奖/裂变），设置明确的行为引导。','执行层：拆好排期和分工——物料、预算、渠道、话术，留好应急方案（比如服务器、审核、嘉宾）。','过程中每日盯数据看趋势，及时调整。','结束后复盘：成本、效果、用户反馈，沉淀可复用的 SOP。']},
  {id:'p7',scene:'product',lv:2,q:'竞品分析你会怎么做？',point:'考察分析方法。',tips:['明确目的：是为了定位、找机会还是抄功能','框架：定位、功能、体验、商业模式、数据','结论要落回"对我们有什么启示"'],ans:['先明确目的：分析是为了找差异化机会、验证某个功能，还是学习运营打法，目的决定看什么。','再看框架：产品定位和目标用户、核心功能与路径、用户体验细节、商业模式、市场规模和数据表现。','信息渠道：亲自使用、看公开数据（榜单/财报）、用户评价和社区反馈。','最后输出"对我们的启示"：哪些可借鉴、哪些是机会点、我们要避开什么，而不是罗列对方的功能清单。']},
  {id:'p8',scene:'product',lv:2,q:'和开发 / 设计意见不合时，你会怎么办？',point:'考察协作与沟通能力。',tips:['先对齐目标再争方案','用数据和用户反馈说话，不靠职位压人','必要时找负责人拍板，但先尽力内部解决'],ans:['先对齐目标：我们都是为了解决同一个用户问题，先把目标和约束（时间、成本）摆清楚。','然后讲依据：我拿出用户反馈、数据或竞品案例说明为什么我的方案更合适，也认真听对方的技术/设计理由。','如果还是分歧，看能不能折中：先做小版本验证，用结果说话，谁对听谁的。','实在解决不了再上升到负责人，但一定把问题和两种方案的利弊梳理清楚，而不是单纯争执。']},
  {id:'p9',scene:'product',lv:2,q:'活动效果差 / 数据不好看，你会怎么复盘？',point:'考察复盘思维与心态。',tips:['不找借口，先认数据','拆解原因：目标、玩法、渠道、执行、外部','输出"下次怎么改"并落实'],ans:['先直面数据：目标完成率、成本、用户反馈，把结果如实摆出来，不找借口。','再拆原因：是目标定得不合理，还是玩法不够吸引、渠道没打透、执行有漏，或外部因素（节点、竞品），用数据验证每个假设。','然后给改进：明确下次在哪个环节优化、预期提升多少，形成清单。','最后把复盘文档沉淀下来，同类活动直接复用经验。']},
  {id:'p10',scene:'product',lv:1,q:'你平时怎么提升自己 / 看什么行业信息？',point:'考察学习意愿与行业敏感度。',tips:['说具体的输入渠道和习惯','结合一个近期学到的案例/观点','体现"输入 → 输出"的闭环'],ans:['输入方面：每天刷行业资讯和产品案例（比如公众号、即刻、行业报告），高频使用的产品会主动拆解它的迭代。','输出方面：看到好的案例会做笔记，偶尔在群里或文档里分享自己的分析，用输出倒逼思考。','最近印象比较深的是 XX 案例，我学到的是 XX，已经应用到我对 XX 的理解里。','这个习惯让我对行业保持敏感，面试聊案例也有素材。']},
  {id:'c1',scene:'general',lv:1,q:'请做一下自我介绍。',point:'考察表达概括能力，几乎所有面试的第一题。',tips:['30 秒到 1 分钟，控制在三段以内','把最匹配目标的内容放前面','结尾抛出一个价值点，引导对方追问'],ans:['我是 XX 专业的学生/从业者，我的核心标签是：成绩扎实、动手能力强、做事有闭环。','和这次目标最相关的经历是：XX（竞赛/项目/工作），我负责 XX，取得了 XX 结果。','我相信这些积累能为 XX 带来直接价值，这也是我今天站在这里的原因。']},
  {id:'c2',scene:'general',lv:1,q:'你最大的优点是什么？',point:'考察自我认知与自信心。',tips:['选 1-2 个真实优点，别贪多','每个优点配具体例证','说明优点如何服务于当前目标'],ans:['我觉得最大的优点是"目标驱动、说到做到"：定下的目标我会拆成步骤去执行。','比如 XX 这件事，当时目标 XX，我通过 XX 最终达成 XX。','这个优点放在当前场景里，意味着我能稳定交付结果，而不是只停留在想法层面。']},
  {id:'c3',scene:'general',lv:2,q:'你最大的缺点是什么？',point:'考察坦诚度、自我认知与改进意识。',tips:['选"真实但不致命"的缺点','讲清缺点的影响 + 你正在做的改进（具体动作）','避免"完美主义"套话，避免致命硬伤'],ans:['我比较明显的不足是：面对多任务同时涌来时会有点焦虑，容易把精力平均分配。','影响是偶尔重要的事不够聚焦，之前 XX 就吃过这个亏。','我现在的改进是：用四象限清单排优先级，每天先做最重要的两件事，已经坚持了 X 个月，效果明显。']},
  {id:'c4',scene:'general',lv:2,q:'你的职业 / 学业规划是什么？',point:'考察目标感与稳定性。',tips:['分短期 / 中期 / 长期三阶段','每阶段有动作和产出，别空喊目标','与当前场景的定位绑定'],ans:['短期（0-1 年）：把当前阶段的核心能力打扎实，完成 XX 目标，拿到 XX 成果。','中期（1-3 年）：在 XX 方向形成专长，能独立负责一个模块或项目。','长期（3-5 年）：往专家或管理方向发展，把个人成长和组织/平台的发展绑定。']},
  {id:'c5',scene:'general',lv:2,q:'讲一次你遇到压力或失败的经历。',point:'考察抗压能力与复盘能力，重点在"你怎么走出来"。',tips:['用 STAR：场景 → 应对 → 结果 → 复盘','选"最终挺过来了"的故事，突出成长','后半段的复盘比前半段的困难更重要'],ans:['一次比较典型的经历是 XX：当时时间紧、任务重，还出了 XX 意外，压力很大。','我的应对是：先把问题拆解成能做的部分，稳住情绪，向有经验的人求助，一步步推进。','结果是 XX，虽然没做到满分，但保住了核心目标。','复盘后我学到：提前留缓冲时间、遇事先拆解再行动，这套方法之后帮了我很多。']},
  {id:'c6',scene:'general',lv:2,q:'团队协作中你通常扮演什么角色？',point:'考察协作意识与自我定位。',tips:['说清角色（组织 / 执行 / 协调）+ 具体事例','体现你会补位、会配合，不只顾自己那一摊','避免只说"我擅长合作"不给例子'],ans:['我通常扮演"执行+协调"的角色：既能把分配给我的部分高质量完成，也愿意主动补位。','比如 XX 项目里，队友负责的部分卡住了，我主动顶上帮忙梳理，保证了整体进度。','我理解的团队是"共同目标 + 各自负责 + 随时补位"，我乐意做那个让协作顺畅的人。']},
  {id:'c7',scene:'general',lv:2,q:'你如何管理自己的时间？',point:'考察效率意识与可执行的方法论。',tips:['给出可迁移的具体方法（清单 / 日历 / 番茄钟 / 四象限）','配合一个实际案例，别只说"我很有计划"','体现你会在实践中调整'],ans:['我主要用"清单 + 优先级"两件套：每周列周计划，每天早晨定三件最重要的事，用四象限排优先级。','执行时用番茄钟保持专注，大任务拆成小任务防止拖延。','比如准备竞赛那阵，课程、备赛、部门工作三线并行，我就是靠这套方法没掉链子。']},
  {id:'c8',scene:'general',lv:2,q:'为什么我们应该选择你？',point:'考察自信与总结能力，是收尾定调的一题。',tips:['给三条核心理由（能力 + 经历 + 态度），各配简短例证','别重复自我介绍，做"价值总结"','结尾收束到"我能为对方带来什么"'],ans:['三点理由：第一，能力和目标匹配，我有 XX 技能和 XX 经历，能直接上手；第二，我做事有闭环，交付的东西经得起追问；第三，我学习意愿强、稳定性高，愿意从基础做起长期投入。','总结来说，选我意味着拿到一个"能干活、能成长、留得住"的人，我会用结果证明这次选择。']},
  {id:'c9',scene:'general',lv:1,q:'你最近学到的新技能或新知识是什么？',point:'考察学习能力与成长性。',tips:['选近期、具体、有应用场景的','讲清"学了什么 → 为什么学 → 怎么学 → 怎么用"','突出主动学习，别报网课数量'],ans:['最近在系统学 XX（比如 Spark/数据分析工具），原因是项目/目标里用到，光知道概念不够。','学习方法：官方文档 + 一个小项目练手 + 和前辈交流踩坑经验，不是只刷视频。','已经应用在 XX 上，效果是 XX。我保持这种"学以致用"的节奏，会持续补充短板。']},
  {id:'c10',scene:'general',lv:1,q:'你还有什么问题想问吗？',point:'考察主动性、关注点与思考深度。',tips:['准备 2-3 个高质量问题，体现认真','问发展路径、期望、团队、培养机制','别说"没有了"，也别只问薪资福利'],ans:['我想了解：这个岗位/角色最大的挑战是什么，以及做好它最需要什么能力？','另外，如果我有幸加入，您希望我在前三个月达到什么样的状态？','还想了解团队目前的重点方向和节奏，方便我提前做准备。']}
];
var ICONS = {
  briefcase:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8ABDFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7.5" width="18" height="12" rx="2.5"/><path d="M9 7.5V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2.5M3 12.5h18"/></svg>',
  code:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5EEAD4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4.5l-3 15"/></svg>',
  chart:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F472B6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M7 17v-5M12 17V8M17 17v-8"/><rect x="3" y="4" width="18" height="17" rx="2"/></svg>',
  target:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/></svg>',
  users:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B7A6F9" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M21 21v-2a4 4 0 0 0-3-3.87M15 3.13a4 4 0 0 1 0 7.75"/></svg>',
  mic:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5"/></svg>',
  star:'<svg viewBox="0 0 24 24"><path d="M12 2.8l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 18l-5.8 3.1 1.1-6.5L2.6 9.6l6.5-.9z"/></svg>',
  chev:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  search:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  clock:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
  robot:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M8 4h8"/><circle cx="9" cy="13" r="1.2" fill="currentColor"/><circle cx="15" cy="13" r="1.2" fill="currentColor"/><path d="M9.5 16.5h5"/></svg>',
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09c0 .68.4 1.3 1.03 1.56a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87c.26.63.88 1.03 1.56 1.03H21a2 2 0 1 1 0 4h-.09c-.68 0-1.3.4-1.51 1.03z"/></svg>',
  mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3" fill="currentColor" stroke="none"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  micNav:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5"/></svg>'
};
var SCENE_COLOR = {job:'#8ABDFF',tech:'#5EEAD4',data:'#F472B6',product:'#FBBF24',general:'#B7A6F9'};
var LV_NAME = {1:'基础',2:'进阶',3:'高频难点'};
var AVATARS = ['🦊','🐼','🐯','🦁','🐸','🐰','🐱','🐨','🐳','🦄'];
/* 柔和低饱和渐变：同色系内差值小，blob 叠加后观感弥散不突兀 */
var BG_PRESETS = [
  {name:'薄雾蓝紫',a:'#2a3560',b:'#1c3a55',c:'#362d58'},
  {name:'柔雾青绿',a:'#1f4e4f',b:'#1c3e5c',c:'#18484e'},
  {name:'暖橙烟紫',a:'#4d3548',b:'#553d32',c:'#3a2d48'},
  {name:'薄荷灰夜',a:'#22443c',b:'#1c3d50',c:'#1a3a46'},
  {name:'淡紫幽梦',a:'#362955',b:'#3a3060',c:'#2a2a48'},
  {name:'深海灰蓝',a:'#1a2c42',b:'#1d2e33',c:'#202a38'}
];

function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function fmtSec(s){var m=Math.floor(s/60),x=s%60;return (m<10?'0':'')+m+':'+(x<10?'0':'')+x}
function storeGet(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function storeSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}

function toast(msg,type){
  var box=$('.toast-box');if(!box){box=document.createElement('div');box.className='toast-box';document.body.appendChild(box)}
  var t=document.createElement('div');t.className='toast '+(type||'');t.textContent=msg;box.appendChild(t);
  setTimeout(function(){t.style.opacity='0';t.style.transform='translateY(-8px)';setTimeout(function(){t.remove()},250)},2200);
}

function getUser(){return storeGet('ivsim_user',null)}
function applyBg(){
  var u=getUser();
  var bg=(u&&u.bg)||BG_PRESETS[0];
  var r=document.documentElement.style;
  r.setProperty('--bgA',bg.a);r.setProperty('--bgB',bg.b);r.setProperty('--bgC',bg.c);
  var st=storeGet('ivsim_settings',{});
  document.body.classList.toggle('no-motion',!!st.motionOff);
}
function requireLogin(){
  if(!getUser()){location.href='login.html';return false}
  return true;
}
function logout(){localStorage.removeItem('ivsim_user');location.href='login.html'}

/* 渲染头像：支持 emoji 文本 和 data URL 图片 */
function renderAvatar(el, avatar){
  if(!el)return;
  if(typeof avatar==='string' && avatar.indexOf('data:')===0){
    el.textContent='';
    var img=document.createElement('img');
    img.src=avatar;img.style.cssText='width:100%;height:100%;border-radius:50%;object-fit:cover;display:block';
    img.onerror=function(){el.textContent='👤';img.remove()};
    el.appendChild(img);
  }else{
    el.textContent=avatar||'🦊';
    var oldImg=el.querySelector('img');if(oldImg)oldImg.remove();
  }
}

/* 压缩图片为 data URL：缩放到 maxSize × maxSize 的 jpeg */
function compressImage(file,maxSize,quality,cb){
  var fr=new FileReader();
  fr.onload=function(){
    var img=new Image();
    img.onload=function(){
      var m=maxSize||128;
      var ratio=Math.min(m/img.width,m/img.height,1);
      var w=Math.round(img.width*ratio),h=Math.round(img.height*ratio);
      var cv=document.createElement('canvas');cv.width=w;cv.height=h;
      var ctx=cv.getContext('2d');
      /* 白底，避免透明 PNG 转 JPEG 变黑 */
      ctx.fillStyle='#ffffff';ctx.fillRect(0,0,w,h);
      ctx.drawImage(img,0,0,w,h);
      try{cb(cv.toDataURL('image/jpeg',quality||0.7),null)}catch(e){cb(null,e)}
    };
    img.onerror=function(){cb(null,new Error('图片加载失败'))};
    img.src=fr.result;
  };
  fr.onerror=function(){cb(null,new Error('文件读取失败'))};
  fr.readAsDataURL(file);
}

function mountBg(){
  var d=document.createElement('div');d.className='bg-fx';
  d.innerHTML='<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div><div class="grid"></div>';
  document.body.prepend(d);
}

function mountNav(active){
  var u=getUser()||{name:'访客',avatar:'🦊'};
  var nav=document.createElement('div');nav.className='nav';
  nav.innerHTML=
    '<a class="logo" href="index.html"><span class="lg-ic">'+ICONS.micNav+'</span>模拟面试训练营 Pro</a>'+
    '<div class="links">'+
      '<a href="index.html" class="'+(active==='home'?'on':'')+'">首页</a>'+
      '<a href="interview.html" class="'+(active==='interview'?'on':'')+'">模拟面试</a>'+
      '<a href="bank.html" class="'+(active==='bank'?'on':'')+'">题库</a>'+
      '<a href="videos.html" class="'+(active==='videos'?'on':'')+'">视频</a>'+
      '<a href="square.html" class="'+(active==='square'?'on':'')+'">广场</a>'+
      '<a href="product.html" class="'+(active==='product'?'on':'')+'">产品蓝图</a>'+
      '<a class="ai-nav-link" href="javascript:;">🤖 AI 助手</a>'+
    '</div>'+
    '<button class="icbtn" id="navFeedback" title="反馈给官方">'+ICONS.mail+'</button>'+
    '<button class="icbtn" id="navSettings" title="设置">'+ICONS.gear+'</button>'+
    '<button class="me" id="navMe" title="个人中心"><span class="avatar" id="navMeAvatar"></span><span class="nm">'+esc(u.name)+'</span></button>';
  document.body.prepend(nav);
  $('#navFeedback').onclick=function(){openFeedback()};
  $('#navSettings').onclick=function(){openSettings()};
  $('#navMe').onclick=function(){openProfile()};
  /* AI 助手：打开浮动面板（懒创建） */
  var aiLink=nav.querySelector('.ai-nav-link');
  aiLink.onclick=function(){
    var fab=document.querySelector('.agent-fab');
    if(!fab){/* 还没 mount */ mountAgent();fab=document.querySelector('.agent-fab')}
    /* 触发 fab.click → 展开 panel */
    if(fab)fab.click();
  };
  renderAvatar(document.getElementById('navMeAvatar'),u.avatar||'🦊');
}
function refreshNavAvatar(){
  var u=getUser();if(!u)return;
  var me=$('#navMe');if(me){renderAvatar(me.querySelector('.avatar'),u.avatar||'🦊');me.querySelector('.nm').textContent=u.name}
}

var _vdb=null;
function videoDB(){
  return new Promise(function(res,rej){
    if(_vdb)return res(_vdb);
    var rq=indexedDB.open('ivsim_db',1);
    rq.onupgradeneeded=function(e){e.target.result.createObjectStore('videos')};
    rq.onsuccess=function(e){_vdb=e.target.result;res(_vdb)};
    rq.onerror=function(e){rej(e)};
  });
}
function saveVideoBlob(id,blob){
  return videoDB().then(function(db){return new Promise(function(res,rej){
    var tx=db.transaction('videos','readwrite');tx.objectStore('videos').put(blob,id);
    tx.oncomplete=res;tx.onerror=rej;
  })});
}
function getVideoBlob(id){
  return videoDB().then(function(db){return new Promise(function(res,rej){
    var rq=db.transaction('videos').objectStore('videos').get(id);
    rq.onsuccess=function(){res(rq.result)};rq.onerror=rej;
  })});
}
function delVideoBlob(id){
  return videoDB().then(function(db){return new Promise(function(res,rej){
    var tx=db.transaction('videos','readwrite');tx.objectStore('videos').delete(id);
    tx.oncomplete=res;tx.onerror=rej;
  })});
}
/* 元数据：{id,title,scene,owner,status:pending|approved|rejected,ts,src:interview|upload,dur} */
function getVideos(){return storeGet('ivsim_videos',[])}
function saveVideos(list){storeSet('ivsim_videos',list)}
function addVideoMeta(meta){var l=getVideos();l.unshift(meta);saveVideos(l);return meta}
function updateVideoMeta(id,patch){
  var l=getVideos();
  for(var i=0;i<l.length;i++){if(l[i].id===id){for(var k in patch)l[i][k]=patch[k];saveVideos(l);return l[i]}}
  return null;
}
function removeVideo(id){
  saveVideos(getVideos().filter(function(x){return x.id!==id}));
  return delVideoBlob(id);
}

function openMask(html){
  closeMask();
  var m=document.createElement('div');m.className='mask';
  m.innerHTML='<div class="modal">'+html+'</div>';
  document.body.appendChild(m);
  requestAnimationFrame(function(){m.classList.add('show')});
  m.addEventListener('click',function(e){if(e.target===m)closeMask()});
  return m;
}
function closeMask(){var m=$('.mask');if(m){m.classList.remove('show');setTimeout(function(){m.remove()},220)}}
function miniPop(title,desc){
  var old=$('.mini-mask');if(old)old.remove();
  var m=document.createElement('div');m.className='mini-mask';
  m.innerHTML='<div class="mini-pop"><div class="mp-ic">📋</div><div class="mp-t">'+esc(title)+'</div><div class="mp-d">'+esc(desc)+'</div><button class="btn pri sm" style="width:100%">知道了</button></div>';
  document.body.appendChild(m);
  requestAnimationFrame(function(){m.classList.add('show')});
  m.querySelector('button').onclick=function(){m.classList.remove('show');setTimeout(function(){m.remove()},200)};
  m.addEventListener('click',function(e){if(e.target===m){m.classList.remove('show');setTimeout(function(){m.remove()},200)}});
}

function openFeedback(){
  var u=getUser()||{};
  var m=openMask(
    '<div class="m-head"><div><h3>📮 反馈给官方</h3><div class="m-sub">遇到问题或有建议？直接发给官方（off），我们会尽快处理</div></div><button class="m-x" id="fbX">✕</button></div>'+
    '<div class="f-lab">你的称呼<span class="req">*</span></div><input class="f-in" id="fbName" placeholder="怎么称呼你" value="'+esc(u.name||'')+'">'+
    '<div class="f-lab">联系方式<span class="req">*</span></div><input class="f-in" id="fbContact" placeholder="QQ / 邮箱 / 手机号，方便官方回复你">'+
    '<div class="f-lab">问题或建议<span class="req">*</span></div><textarea class="f-ta" id="fbMsg" placeholder="描述你遇到的问题、想增加的功能、或想对官方说的话…"></textarea>'+
    '<button class="btn pri" id="fbSend" style="width:100%;margin-top:18px">发送给官方</button>');
  $('#fbX').onclick=closeMask;
  $('#fbSend').onclick=function(){
    var name=$('#fbName').value.trim(),contact=$('#fbContact').value.trim(),msg=$('#fbMsg').value.trim();
    var miss=[];
    if(!name){miss.push('你的称呼');$('#fbName').classList.add('err')}else{$('#fbName').classList.remove('err')}
    if(!contact){miss.push('联系方式');$('#fbContact').classList.add('err')}else{$('#fbContact').classList.remove('err')}
    if(!msg){miss.push('问题或建议');$('#fbMsg').classList.add('err')}else{$('#fbMsg').classList.remove('err')}
    if(miss.length){miniPop('还有内容没填哦','请先填写：'+miss.join('、')+'，填写完整后才能发送给官方。');return}
    var list=storeGet('ivsim_feedback',[]);
    list.push({name:name,contact:contact,msg:msg,time:Date.now()});
    storeSet('ivsim_feedback',list);
    closeMask();
    toast('已发送给官方（off），感谢反馈！','ok');
  };
}

function openProfile(){
  var u=getUser()||{name:'',avatar:'🦊'};
  var favs=favQues();
  var favHtml=favs.length?favs.map(function(q){
    return '<div class="pf-fav-row">'+
      '<span style="color:'+SCENE_COLOR[q.scene]+';flex:none">['+SCENES[q.scene].name+']</span>'+
      '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(q.q)+'</span>'+
      '<button class="btn gho sm" style="padding:4px 8px;font-size:11px;flex:none" data-id="'+q.id+'" data-del="1">取消</button>'+
    '</div>'}).join(''):'<div style="font-size:12px;color:var(--ink3);text-align:center;padding:18px 0">还没有收藏的题目，去题库看到喜欢的点 ⭐ 吧</div>';

  var isCustomAv=typeof u.avatar==='string'&&u.avatar.indexOf('data:')===0;
  /* emoji 选项（40px 由 .pf-emoji-row .av-pick 控制） */
  var avHtml=AVATARS.map(function(a){
    var selected=!isCustomAv&&a===u.avatar;
    return '<button class="av-pick'+(selected?' on':'')+'" data-a="'+a+'">'+a+'</button>';
  }).join('');

  /* 当前头像预览 */
  var curAvHtml=isCustomAv
    ? '<div id="curAvBox" class="pf-cur-av img"></div>'
    : '<div id="curAvBox" class="pf-cur-av emoji">'+esc(u.avatar||'🦊')+'</div>';

  /* 背景预设 */
  var isCustomBg=u.bg&&u.bg.isCustom;
  var bgHtml=BG_PRESETS.map(function(b,i){
    var on=u.bg&&u.bg.name===b.name&&!isCustomBg;
    return '<button class="bg-pick'+(on?' on':'')+'" data-i="'+i+'">'+
      '<span style="background:linear-gradient(135deg,'+b.a+','+b.b+','+b.c+')"></span>'+
      '<span>'+b.name+'</span></button>';
  }).join('');
  var initA=(isCustomBg&&u.bg.a)||BG_PRESETS[0].a;
  var initB=(isCustomBg&&u.bg.b)||BG_PRESETS[0].b;
  var initC=(isCustomBg&&u.bg.c)||BG_PRESETS[0].c;
  bgHtml+='<button class="bg-pick'+(isCustomBg?' on':'')+'" data-custom="1">'+
    '<span id="customGrad" style="background:linear-gradient(135deg,'+initA+','+initB+','+initC+')"></span>'+
    '<span>🎨 自定义</span></button>';

  var achList=getAchievements();
  var achGot=achList.filter(function(a){return a.unlocked}).length;
  var recentAch=achList.filter(function(a){return a.unlocked}).sort(function(a,b){return (b.unlockAt||0)-(a.unlockAt||0)}).slice(0,6);
  var lockedAch=achList.filter(function(a){return !a.unlocked}).slice(0,Math.max(0,6-recentAch.length));

  var ci=getCheckInfo();
  var todayStr=new Date().toDateString();
  var todayDone=ci.last===todayStr;
  var weekHtml=buildWeek(ci.history).map(function(d){
    return '<div class="ch-day'+(d.today?' today':'')+(d.done?' done':'')+(d.fu?' future':'')+'" title="'+d.label+'">'+d.num+'</div>'
  }).join('');
  var nextStep=null;
  STREAK_REWARDS.forEach(function(r){if(ci.days<r.days&&!nextStep)nextStep=r});
  var streakPct=nextStep?Math.round(ci.days/nextStep.days*100):100;
  var btnLabel=todayDone?'✅ 今日已签到，明天继续':'✨ 立即签到';

  var m=openMask(
    '<div class="m-head"><div><h3>👤 个人中心</h3><div class="m-sub">昵称、头像、背景色 + 收藏的题目</div></div><button class="m-x" id="pfX">✕</button></div>'+
    '<div class="f-lab">昵称</div><input class="f-in" id="pfName" maxlength="12" value="'+esc(u.name)+'" placeholder="给自己起个名字">'+

    /* 区块一：头像 */
    '<div class="pf-block">'+
      '<div class="pf-b-lab">我的头像 <span style="font-weight:400;color:var(--ink3);font-size:11px">（emoji 或上传图片）</span></div>'+
      '<div class="pf-av-row">'+curAvHtml+
        '<div class="pf-av-act">'+
          '<button type="button" class="pri" id="pfUploadBtn">📷 上传图片</button>'+
          (isCustomAv?'<button type="button" class="danger" id="pfDelAv">✕ 清除自定义</button>':'')+
        '</div>'+
      '</div>'+
      '<div class="pf-emoji-row">'+avHtml+'</div>'+
      '<input type="file" id="pfFile" accept="image/*" style="display:none">'+
    '</div>'+

    /* 区块二：背景颜色 */
    '<div class="pf-block">'+
      '<div class="pf-b-lab">背景颜色 <span style="font-weight:400;color:var(--ink3);font-size:11px">（全站生效）</span></div>'+
      '<div class="pf-bg-grid">'+bgHtml+'</div>'+
      '<div id="customColors" class="pf-custom-colors'+(isCustomBg?' show':'')+'">'+
        '<div style="font-size:11.5px;color:var(--ink3);margin-bottom:8px">自选三段渐变色 · 实时预览</div>'+
        '<div style="display:flex;gap:14px;align-items:center">'+
          '<label>起始<input type="color" id="ccA" value="'+initA+'"></label>'+
          '<label>中间<input type="color" id="ccB" value="'+initB+'"></label>'+
          '<label>结尾<input type="color" id="ccC" value="'+initC+'"></label>'+
        '</div>'+
      '</div>'+
    '</div>'+

    /* 区块三：📈 成长进度（成就+打卡合并，紧凑不冗余） */
    '<div class="pf-block">'+
      '<div class="pf-b-lab">📈 成长进度 <span style="font-weight:400;color:var(--ink3);font-size:11px">成就 '+achGot+'/'+achList.length+' · 连签 '+ci.days+' 天</span></div>'+

      /* 顶部两卡：连签+累计 */
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">'+
        '<div style="text-align:center;padding:8px;border-radius:10px;background:rgba(108,140,255,.1);border:1px solid rgba(108,140,255,.28)">'+
          '<div id="pfStreakDays" style="font-size:20px;font-weight:900;background:linear-gradient(90deg,#8ABDFF,#5EEAD4);-webkit-background-clip:text;background-clip:text;color:transparent">'+ci.days+'</div>'+
          '<div style="font-size:11px;color:var(--ink3)">连续签到</div>'+
        '</div>'+
        '<div style="text-align:center;padding:8px;border-radius:10px;background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.28)">'+
          '<div id="pfStreakTotal" style="font-size:20px;font-weight:900;background:linear-gradient(90deg,#FBBF24,#F472B6);-webkit-background-clip:text;background-clip:text;color:transparent">'+ci.total+'</div>'+
          '<div style="font-size:11px;color:var(--ink3)">累计 / 徽章数</div>'+
        '</div>'+
      '</div>'+

      /* 成就条：4 格紧凑，进度条，查看全部 */
      '<div class="pf-badge-row" style="grid-template-columns:repeat(4,1fr);margin-bottom:8px">'+
        recentAch.concat(lockedAch).slice(0,4).map(function(a){
          return '<div class="pf-badge'+(a.unlocked?'':' locked')+'" data-ach-id="'+a.id+'" title="'+esc(a.t)+' · '+esc(a.d)+'">'+
            '<span class="pf-badge-ic" style="filter:'+(a.unlocked?'none':'grayscale(1) opacity(.45)')+'">'+a.ic+'</span>'+
            '<span class="pf-badge-t">'+esc(a.t)+'</span>'+
          '</div>'
        }).join('')+
      '</div>'+
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">'+
        '<div style="flex:1;height:6px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden">'+
          '<div id="pfAchBar" style="height:100%;width:'+Math.round(achGot/achList.length*100)+'%;background:linear-gradient(90deg,#8ABDFF,#5EEAD4);border-radius:4px;transition:.3s"></div>'+
        '</div>'+
        '<div id="pfAchCount" style="font-size:11px;color:var(--ink3);white-space:nowrap;flex:none">'+achGot+'/'+achList.length+'</div>'+
      '</div>'+

      /* 本周 7 天日历（紧凑） */
      '<div id="pfWeekBox" class="ch-week" style="margin-bottom:8px">'+weekHtml+'</div>'+

      /* 下一个里程碑（替代完整阶梯列表，节省空间） */
      (nextStep
        ? '<div style="font-size:11.5px;color:var(--ink2);margin-bottom:6px">🎯 下一个里程碑：<b style="color:var(--acc2)">'+nextStep.days+' 天</b> · '+esc(nextStep.t)+'（还差 '+(nextStep.days-ci.days)+' 天）</div>'+
          '<div id="pfNextBar" style="height:8px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden;margin-bottom:8px">'+
            '<div id="pfNextFill" style="height:100%;width:'+streakPct+'%;background:linear-gradient(90deg,#FBBF24,#F472B6);border-radius:4px;transition:.3s"></div>'+
          '</div>'
        : '<div id="pfNextAllDone" style="font-size:11.5px;color:#FBBF24;margin-bottom:8px">🎉 已达成全部连续签到里程碑！</div>'
      )+

      /* 签到按钮 + 查看成就（双按钮紧凑） */
      '<div style="display:flex;gap:8px">'+
        '<button type="button" class="btn pri sm" id="pfChBtn" style="flex:1">'+btnLabel+'</button>'+
        '<button type="button" class="btn gho sm" id="pfAllAch" style="flex:1">🏅 全部成就</button>'+
      '</div>'+
    '</div>'+

    /* 区块四：收藏 */
    '<div class="pf-block">'+
      '<div class="pf-b-lab">⭐ 我收藏的题目 <span style="font-weight:400;color:var(--ink3)">('+favs.length+')</span></div>'+
      '<div id="favList" style="max-height:160px;overflow-y:auto">'+favHtml+'</div>'+
    '</div>'+

    /* 粘性保存栏 */
    '<div class="pf-save-bar">'+
      '<button class="btn gho" id="pfLogout" style="flex:1">退出登录</button>'+
      '<button class="btn pri" id="pfSave" style="flex:2">保存设置</button>'+
    '</div>');

  /* 状态变量 */
  var av=u.avatar||'🦊',bg=u.bg||BG_PRESETS[0];

  /* 初始渲染自定义头像图片 */
  if(isCustomAv){renderAvatar($('#curAvBox'),av)}

  /* emoji 选择 */
  $$('.av-pick',m).forEach(function(b){b.onclick=function(){
    av=b.dataset.a;
    $$('.pf-emoji-row .av-pick',m).forEach(function(x){x.classList.remove('on')});
    b.classList.add('on');
    /* 更新预览 */
    var box=$('#curAvBox');box.innerHTML='';box.className='pf-cur-av emoji';box.textContent=av;
    var d=$('#pfDelAv');if(d)d.remove();
  }});

  /* 背景预设选择 */
  $$('.bg-pick',m).forEach(function(b){b.onclick=function(){
    $$('.pf-bg-grid .bg-pick',m).forEach(function(x){x.classList.remove('on')});
    b.classList.add('on');
    if(b.dataset.custom){
      bg={isCustom:true,name:'自定义',a:$('#ccA').value,b:$('#ccB').value,c:$('#ccC').value};
      $('#customColors').classList.add('show');
    }else{
      bg=BG_PRESETS[+b.dataset.i];
      $('#customColors').classList.remove('show');
    }
  }});

  /* 自定义颜色实时联动 */
  function refreshCustomBg(){
    var a=$('#ccA').value,bv=$('#ccB').value,c=$('#ccC').value;
    $('#customGrad').style.background='linear-gradient(135deg,'+a+','+bv+','+c+')';
    bg={isCustom:true,name:'自定义',a:a,b:bv,c:c};
  }
  $('#ccA').addEventListener('input',refreshCustomBg);
  $('#ccB').addEventListener('input',refreshCustomBg);
  $('#ccC').addEventListener('input',refreshCustomBg);

  /* 上传头像 */
  $('#pfUploadBtn').onclick=function(){$('#pfFile').click()};
  $('#pfFile').onchange=function(e){
    var f=e.target.files&&e.target.files[0];if(!f)return;
    if(f.size>3*1024*1024){toast('图片太大啦，选一张 3MB 以内的吧','warn');return}
    toast('正在压缩上传…');
    compressImage(f,128,0.7,function(dataUrl,err){
      if(err){toast('上传失败：'+err.message,'warn');return}
      av=dataUrl;
      var box=$('#curAvBox');box.innerHTML='';box.className='pf-cur-av img';
      renderAvatar(box,av);
      $$('.pf-emoji-row .av-pick',m).forEach(function(x){x.classList.remove('on')});
      /* 确保有清除按钮 */
      if(!$('#pfDelAv')){
        var row=document.createElement('button');row.type='button';row.id='pfDelAv';row.className='danger';row.textContent='✕ 清除自定义';
        row.onclick=function(){
          av='🦊';
          var b=$('#curAvBox');b.innerHTML='';b.className='pf-cur-av emoji';b.textContent=av;
          $('#pfDelAv').remove();
          $$('.pf-emoji-row .av-pick',m).forEach(function(x){x.classList.remove('on')});
          var defAv=$('.pf-emoji-row .av-pick[data-a="🦊"]',m);if(defAv)defAv.classList.add('on');
        };
        $('#pfUploadBtn').after(row);
      }
      toast('头像上传成功！','ok');
    });
  };

  $('#pfX').onclick=closeMask;
  $('#pfLogout').onclick=function(){logout()};
  /* 签到按钮：复用 checkIn（内部已 toast），原地刷新不闪屏 */
  $('#pfChBtn').onclick=function(){
    var r=checkIn();
    if(r&&!r.done){
      /* tryUnlockAll 已经在 checkIn 内部调用了，获取返回值做脉冲 */
      var newlyGot=getLatestUnlocked();/* 拿最近解锁的成就 */
      refreshPfBadges();
      pulseBadges(newlyGot);
    }
  };
  /* 查看全部成就 */
  $('#pfAllAch').onclick=function(){openAchievements()};
  $('#pfSave').onclick=function(){
    var name=$('#pfName').value.trim();
    if(!name){miniPop('昵称还没填哦','个人中心需要一个昵称，填一个喜欢的名字吧。');$('#pfName').classList.add('err');return}
    var nu={name:name,avatar:av,bg:bg};
    storeSet('ivsim_user',nu);applyBg();refreshNavAvatar();closeMask();toast('个人资料已保存','ok');
  };
  $('#favList').addEventListener('click',function(e){
    var btn=e.target.closest('[data-del="1"]');if(!btn)return;
    toggleFav(btn.dataset.id);openProfile();
  });
}

function openSettings(){
  var st=storeGet('ivsim_settings',{});
  var isDark=st.theme!=='light';
  var aiKey=!!st.aiKey;
  var provs=[
    {k:'dashscope',t:'通义千问 (dashscope)'},
    {k:'openai',t:'OpenAI (openai.com)'},
    {k:'deepseek',t:'DeepSeek (deepseek.com)'}
  ];
  var pSel=st.aiProv||'dashscope';

  /* 构建设置弹层 */
  var body=
    '<div class="m-head"><div><h3>⚙️ 设置</h3><div class="m-sub">个性化你的训练体验</div></div><button class="m-x" id="stX">✕</button></div>'+
    settingRow('主题模式','深色 / 浅色界面切换','chip '+(isDark?'on':''),'stTheme',isDark?'深色':'浅色')+
    settingRow('背景动效','关闭可减少卡顿、更省电','chip '+(st.motionOff?'':'on'),'stMotion',st.motionOff?'已关闭':'已开启')+
    settingRow('音效 / 签到反馈','签到、成就解锁的音效','chip '+(st.voiceOff?'':'on'),'stVoice',st.voiceOff?'已关闭':'已开启')+
    /* AI 助手区块 */
    '<div style="padding:16px 0;border-bottom:1px solid var(--line)">'+
      '<div style="font-weight:700;font-size:14px;margin-bottom:4px">🤖 AI 助手 API Key</div>'+
      '<div style="font-size:12px;color:var(--ink3);margin-bottom:10px">可选填。填了调用真实大模型，不填走本地关键词模拟。</div>'+
      '<div style="margin-bottom:8px"><select id="stProv" class="f-in" style="padding:8px 12px">'+
        provs.map(function(p){return '<option value="'+p.k+'"'+(p.k===pSel?' selected':'')+'>'+p.t+'</option>'}).join('')+
      '</select></div>'+
      '<input id="stKey" type="password" class="f-in" style="padding:8px 12px" value="'+esc(st.aiKey||'')+'" placeholder="sk-xxxxxx 你的 API Key">'+
      '<div style="display:flex;gap:8px;margin-top:8px">'+
        '<button class="btn gho sm" id="stKeySave" style="flex:1">保存 Key</button>'+
        '<button class="btn gho sm" id="stKeyClear" style="flex:1;color:var(--danger);border-color:rgba(251,113,133,.4)">清除</button>'+
      '</div>'+
      '<div id="stKeyHint" style="font-size:11.5px;color:'+(aiKey?'#7EE7A7':'var(--ink3)')+';margin-top:8px">'+(aiKey?'✅ 已配置，AI 助手将使用真实大模型对话':'💡 当前为模拟模式')+'</div>'+
    '</div>'+
    '<div style="padding:14px 0"><div style="font-weight:700;font-size:14px;margin-bottom:4px">数据管理</div>'+
      '<button class="btn gho sm" id="stClear" style="color:var(--danger);border-color:rgba(251,113,133,.4)">清空全部本地数据</button></div>'+
    '<div style="font-size:11.5px;color:var(--ink3);text-align:center;margin-top:8px">训练营 Pro · 数据仅保存在本地浏览器</div>';

  var m=openMask(body);
  $('#stX').onclick=closeMask;

  /* 设置行按钮事件 */
  $('#stTheme').onclick=function(){isDark=!isDark;st.theme=isDark?'dark':'light';storeSet('ivsim_settings',st);applyTheme();this.className='chip '+(isDark?'on':'');this.textContent=isDark?'深色':'浅色';};
  $('#stMotion').onclick=function(){st.motionOff=!st.motionOff;storeSet('ivsim_settings',st);applyBg();this.className='chip '+(st.motionOff?'':'on');this.textContent=st.motionOff?'已关闭':'已开启';};
  $('#stVoice').onclick=function(){st.voiceOff=!st.voiceOff;storeSet('ivsim_settings',st);this.className='chip '+(st.voiceOff?'':'on');this.textContent=st.voiceOff?'已关闭':'已开启';};
  $('#stProv').onchange=function(){st.aiProv=this.value};
  $('#stKeySave').onclick=function(){
    var v=$('#stKey').value.trim();st.aiKey=v;storeSet('ivsim_settings',st);
    $('#stKeyHint').textContent=v?'✅ 已配置':'💡 当前为模拟模式';
    $('#stKeyHint').style.color=v?'#7EE7A7':'var(--ink3)';
    toast(v?'已保存':'已清除','ok');
  };
  $('#stKeyClear').onclick=function(){
    st.aiKey='';storeSet('ivsim_settings',st);$('#stKey').value='';
    $('#stKeyHint').textContent='💡 当前为模拟模式';
    $('#stKeyHint').style.color='var(--ink3)';toast('API Key 已清除','ok');
  };
  $('#stClear').onclick=function(){
    /* 清空全部 localStorage（按前缀清理，避免漏 key） */
    var keys=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf('ivsim_')===0)keys.push(k)}
    keys.forEach(function(k){localStorage.removeItem(k)});
    /* 清空视频 blob（IndexedDB）与管理员会话标记 */
    try{sessionStorage.removeItem('ivsim_admin')}catch(e){}
    var finish=function(){toast('本地数据已清空','ok');setTimeout(function(){location.reload()},600)};
    try{
      videoDB().then(function(db){
        return new Promise(function(res){
          var tx=db.transaction('videos','readwrite');tx.objectStore('videos').clear();
          tx.oncomplete=res;tx.onerror=res;
        });
      }).then(finish,finish);
    }catch(e){finish()}
  };
}
function settingRow(title,desc,btnClass,btnId,btnText){
  return '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--line)">'+
    '<div><div style="font-weight:700;font-size:14px">'+title+'</div><div style="font-size:12px;color:var(--ink3);margin-top:3px">'+desc+'</div></div>'+
    '<button class="'+btnClass+'" id="'+btnId+'">'+btnText+'</button></div>';
}

/* AGENT_RULES 延迟到成就/签到定义完毕后初始化，见下方 */
function agentReply(text){
  var t=text.toLowerCase();
  for(var i=0;i<AGENT_RULES.length;i++){
    var rule=AGENT_RULES[i];
    for(var j=0;j<rule.k.length;j++){
      if(t.indexOf(rule.k[j].toLowerCase())>-1)return rule;
    }
  }
  return {r:'这个问题我暂时答不上来 😅 你可以换个说法问我（比如"怎么开始面试""题库在哪里"），或者直接把问题发给官方，他们会回复你。',acts:[{t:'发给官方',fb:1}]};
}

var _aiMsgs=[];
var _SYSTEM_PROMPT='你是"面试小助手"。用简洁中文回答面试相关问题，200字以内。';
function aiEndpoint(provider){
  if(provider==='openai')return {url:'https://api.openai.com/v1/chat/completions',model:'gpt-4o-mini'};
  if(provider==='deepseek')return {url:'https://api.deepseek.com/v1/chat/completions',model:'deepseek-chat'};
  return {url:'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',model:'qwen-plus'};
}
function chatWithRealAI(userMsg){
  var st=storeGet('ivsim_settings',{});
  if(!st.aiKey){return Promise.resolve(null)}
  var ep=aiEndpoint(st.aiProv||'dashscope');
  _aiMsgs=_aiMsgs.concat({role:'user',content:userMsg});
  var msgs=[{role:'system',content:_SYSTEM_PROMPT}].concat(_aiMsgs.slice(-10));
  return fetch(ep.url,{
    method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+st.aiKey},
    body:JSON.stringify({model:ep.model,messages:msgs,temperature:.7})
  }).then(function(resp){
    if(!resp.ok){
      return resp.json().catch(function(){return {}}).then(function(t){
        var em=t.error&&t.error.message?' · '+t.error.message:'';
        return {error:'API '+resp.status+em};
      });
    }
    return resp.json().then(function(data){
      var text=data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content||'';
      if(text){_aiMsgs=_aiMsgs.concat({role:'assistant',content:text})}
      return {text:text};
    });
  }).catch(function(e){return {error:'网络错误：'+e.message}});
}
function resetAIContext(){_aiMsgs=[]}
function mountAgent(){
  var fab=document.createElement('button');fab.className='agent-fab';fab.title='面试小助手';
  fab.innerHTML=ICONS.robot+'<span class="dot"></span>';
  var stNow=storeGet('ivsim_settings',{});
  var headerStatus=stNow.aiKey?'在线 · AI 真实对话':'在线 · 模拟模式';
  var panel=document.createElement('div');panel.className='agent-panel';
  panel.innerHTML=
    '<div class="agent-head"><div class="a-av">🤖</div><div style="flex:1"><div class="a-nm">AI 面试助手</div><div class="a-st" id="agStatus">'+headerStatus+'</div></div><button class="m-x" id="agX">✕</button></div>'+
    '<div class="agent-body" id="agBody"></div>'+
    '<div class="agent-quick"><button data-q="怎么开始模拟面试？">怎么开始</button><button data-q="题库在哪里？">题库</button><button data-q="怎么用语音作答？">语音作答</button><button data-q="面试紧张怎么办？">缓解紧张</button></div>'+
    '<div class="agent-input"><input id="agIn" placeholder="输入你的问题…（可问大模型）" maxlength="200"><button id="agSend" title="发送">'+ICONS.send+'</button></div>'+
    '<div class="agent-foot"><span id="agCtx" style="font-size:10.5px;color:var(--ink3)">对话记录: 0</span><button id="agReset" style="font-size:10.5px;color:var(--ink3);background:none;border:none;cursor:pointer">🔄 重置对话</button><button id="agSet" style="font-size:10.5px;color:var(--ink3);background:none;border:none;cursor:pointer">⚙️ API 配置</button></div>';
  document.body.appendChild(fab);document.body.appendChild(panel);
  var body=panel.querySelector('#agBody'),input=panel.querySelector('#agIn'),
      statusEl=panel.querySelector('#agStatus'),ctxEl=panel.querySelector('#agCtx');
  function push(html,me){
    var d=document.createElement('div');d.className='msg '+(me?'me':'bot');d.innerHTML=html;body.appendChild(d);body.scrollTop=body.scrollHeight;return d;
  }
  function updateStatus(){
    var st2=storeGet('ivsim_settings',{});
    statusEl.textContent=st2.aiKey?'在线 · AI 真实对话':'在线 · 模拟模式';
    ctxEl.textContent='对话记录: '+_aiMsgs.length;
  }
  function answer(q){
    push(esc(q),true);
    fab.querySelector('.dot')&&fab.querySelector('.dot').remove();
    var loading=document.createElement('div');loading.className='msg bot';loading.innerHTML='<span class="typing"><i></i><i></i><i></i></span>';body.appendChild(loading);body.scrollTop=body.scrollHeight;

    var st2=storeGet('ivsim_settings',{});
    if(st2.aiKey){
      /* 有 API Key：走真实大模型；失败回退本地 */
      chatWithRealAI(q).then(function(res){
        loading.remove();
        if(res&&res.text){push(esc(res.text).replace(/\n/g,'<br>'))}
        else if(res&&res.error){push('⚠️ AI 调用失败：'+esc(res.error)+'<br>已切换到本地模拟回答：<br><br>'+agentReply(q).r)}
        else{var r=agentReply(q);push(r.r)}
        updateStatus();
      });
    }else{
      /* 模拟模式：本地关键词匹配 */
      setTimeout(function(){
        loading.remove();
        var r=agentReply(q);
        var html=r.r+'<div class="m-act"><button data-act="set">🤖 启用真实 AI</button></div>';
        var d=push(html);
        $$('.m-act button',d).forEach(function(b){b.onclick=function(){if(b.dataset.act==='set'){openSettings();panel.classList.remove('show')}}});
        if(r.acts){
          var actHtml='<div class="m-act">'+r.acts.map(function(a,i){return '<button data-i="'+i+'">'+esc(a.t)+'</button>'}).join('')+'</div>';
          d.insertAdjacentHTML('beforeend',actHtml);
          $$('.m-act button[data-i]',d).forEach(function(b){b.onclick=function(){var a=r.acts[+b.dataset.i];if(a.go)location.href=a.go;else if(a.fb){panel.classList.remove('show');openFeedback()}else if(a.act==='checkin'){panel.classList.remove('show');checkIn();showCheckinPanel()}else if(a.act==='ach'){panel.classList.remove('show');openAchievements()}}});
        }
      },400);
    }
  }
  push('嗨～我是 AI 面试助手 🤖 模拟模式下回答训练营相关问题，填入 API Key 后能调用真实大模型提供更个性化的面试技巧指导。');
  updateStatus();
  fab.onclick=function(){panel.classList.toggle('show');var d=fab.querySelector('.dot');if(d)d.remove()};
  panel.querySelector('#agX').onclick=function(){panel.classList.remove('show')};
  panel.querySelector('#agSend').onclick=function(){var v=input.value.trim();if(!v)return;input.value='';answer(v)};
  panel.querySelector('#agReset').onclick=function(){resetAIContext();updateStatus();toast('对话历史已重置','ok');closeMask();fab.click()};
  panel.querySelector('#agSet').onclick=function(){panel.classList.remove('show');openSettings()};
  input.addEventListener('keydown',function(e){if(e.key==='Enter'){var v=input.value.trim();if(!v)return;input.value='';answer(v)}});
  $$('.agent-quick button',panel).forEach(function(b){b.onclick=function(){answer(b.dataset.q)}});
}

function checkIn(){
  var key='ivsim_checkin',today=new Date().toDateString();
  var data=storeGet(key,{days:0,total:0,last:'',history:[]});
  if(data.last===today){toast('今天已经签过啦，明天再来吧','warn');return {done:true,data:data,streak:calcStreak(data.history)}}
  var hist=data.history.slice();
  hist.push(today);
  data.history=hist;
  data.last=today;
  data.total=data.total+1;
  data.days=calcStreak(hist);
  storeSet(key,data);
  toast('签到成功！连续 '+data.days+' 天，累计 '+data.total+' 天','ok');
  tryUnlockAll();
  playSound('checkin');
  return {done:false,data:data,streak:data.days};
}
function calcStreak(hist){
  var set={};hist.forEach(function(d){set[d]=1});
  var c=0,t=new Date();
  while(set[t.toDateString()]){c++;t.setDate(t.getDate()-1)}
  return c;
}
function getCheckInfo(){return storeGet('ivsim_checkin',{days:0,total:0,last:'',history:[]})}

var ACH_DEFS=[
  {id:'a1',ic:'🌱',t:'初次见面',d:'完成第一场模拟面试',c:function(s){return s.times>=1}},
  {id:'a2',ic:'💪',t:'百炼成钢',d:'累计作答 ≥ 20 道题',c:function(s){return s.questions>=20}},
  {id:'a3',ic:'🏆',t:'面霸附体',d:'累计作答 ≥ 100 道题',c:function(s){return s.questions>=100}},
  {id:'a4',ic:'🌟',t:'全场景王者',d:'每个场景都练过至少 1 场',c:function(s){return s.scenes&&Object.keys(s.scenes).length>=5}},
  {id:'a5',ic:'📅',t:'持之以恒',d:'连续签到 ≥ 3 天',c:function(_s,c){return c.days>=3}},
  {id:'a6',ic:'🔥',t:'签到达人',d:'累计签到 ≥ 15 天',c:function(_s,c){return c.total>=15}},
  {id:'a7',ic:'💯',t:'五星选手',d:'平均自评 ≥ 4.5 星',c:function(s){return s.questions&&(s.scoreSum/s.questions)>=4.5}},
  {id:'a8',ic:'🎯',t:'首签',d:'完成第一次每日签到',c:function(_s,c){return c.total>=1}},
  {id:'a9',ic:'🔮',t:'每日一签',d:'首次抽取今日面试运势',c:function(){return storeGet('ivsim_fortune',null)!==null}},
  {id:'a10',ic:'⚡',t:'快答战士',d:'随机快答次数 ≥ 10 次（趣味挑战）',c:function(){return (storeGet('ivsim_quick_cnt',0))>=10}},
  {id:'a11',ic:'📮',t:'热心反馈',d:'第一次给官方（off）发送反馈',c:function(){return (storeGet('ivsim_feedback',[])).length>=1}},
  {id:'a12',ic:'🎭',t:'面试人格',d:'完成一次面试人格测试',c:function(){return storeGet('ivsim_persona',null)!==null}},
  {id:'a13',ic:'👑',t:'传说面霸',d:'累计作答 ≥ 300 道题 · 连续签到 ≥ 30 天',c:function(s,c){return s.questions>=300&&c.days>=30}},
  /* 新增：连签阶梯 */
  {id:'a14',ic:'🗓️',t:'一周达人',d:'连续签到 ≥ 7 天（中途不能断签）',c:function(_s,c){return c.days>=7}},
  {id:'a15',ic:'💎',t:'月度之星',d:'连续签到 ≥ 30 天 · 全月无断签',c:function(_s,c){return c.days>=30}},
  {id:'a16',ic:'🎖️',t:'资深面霸',d:'累计签到 ≥ 50 天',c:function(_s,c){return c.total>=50}}
];
/* 连续打卡奖励阶梯（用户可感知的目标） */
var STREAK_REWARDS=[
  {days:3,ic:'📅',t:'持之以恒',reward:'解锁成就「持之以恒」（连签 3 天）'},
  {days:7,ic:'🗓️',t:'一周达人',reward:'解锁成就「一周达人」（连签 7 天）'},
  {days:15,ic:'💎',t:'月度之星',reward:'连签半月里程碑 · 累计 15 天解锁「签到达人」'},
  {days:30,ic:'👑',t:'传说面霸',reward:'连签满月 · 再刷 300 道题解锁终极成就「传说面霸」'}
];
function getStat(){return storeGet('ivsim_stat',{times:0,questions:0,scoreSum:0,scenes:{}})}
var _audioCtx=null;
function getAudioCtx(){
  if(!_audioCtx){try{_audioCtx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}
  return _audioCtx;
}
function playSound(type){
  var set=storeGet('ivsim_settings',{});
  if(set.voiceOff)return;
  var ctx=getAudioCtx();if(!ctx)return;
  try{if(ctx.state==='suspended')ctx.resume()}catch(e){}
  var now=ctx.currentTime;
  var N={
    checkin:[[261.63,0],[329.63,.09],[392,.18]],
    unlock: [[329.63,0],[392,.06],[523.25,.12],[659.25,.20]],
    click:  [[523.25,0]],
    fail:   [[220,0],[196,.12],[174.61,.24]],
    done:   [[392,0],[523.25,.08],[659.25,.16],[784,.24]]
  };
  var seq=N[type]||N.click;
  seq.forEach(function(p){
    var osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type='sine';osc.frequency.value=p[0];
    gain.gain.setValueAtTime(0,now+p[1]);
    gain.gain.linearRampToValueAtTime(.18,now+p[1]+.02);
    gain.gain.exponentialRampToValueAtTime(.001,now+p[1]+.22);
    osc.connect(gain);gain.connect(ctx.destination);
    osc.start(now+p[1]);osc.stop(now+p[1]+.25);
  });
}

function tryUnlockAll(){
  var s=getStat(),c=getCheckInfo(),set=storeGet('ivsim_ach',{}),got=[];
  ACH_DEFS.forEach(function(a){if(!set[a.id]&&a.c(s,c)){set[a.id]=Date.now();got.push(a)}});
  if(got.length){
    storeSet('ivsim_ach',set);
    window._pfNewlyGot=(window._pfNewlyGot||[]).concat(got.map(function(a){return a.id}));
    got.forEach(function(a){toast('🏅 解锁成就：'+a.t,'ok')});
    playSound('unlock');
  }
  return got;
}
function getLatestUnlocked(){var q=window._pfNewlyGot||[];window._pfNewlyGot=[];return q}
function pulseBadges(ids){
  if(!ids||!ids.length)return;
  ids.forEach(function(id){
    var el=document.querySelector('.pf-badge[data-ach-id="'+id+'"]');
    if(el){el.classList.add('unlocked-anim');setTimeout(function(){el.classList.remove('unlocked-anim')},900)}
  });
}
function getAchievements(){var set=storeGet('ivsim_ach',{});return ACH_DEFS.map(function(a){return Object.assign({},a,{unlocked:!!set[a.id],unlockAt:set[a.id]||null})})}

/* 智能体规则（放在所有依赖 var 定义之后，避免初始化时引用 undefined） */
var AGENT_RULES=[
  {k:['你好','hi','hello','在吗','在不在'],r:'你好呀！我是面试小助手 🤖，可以问我：怎么开始模拟面试、题库怎么用、语音作答、自评标准、复盘报告等问题。'},
  {k:['开始','怎么练','如何开始','怎么用','如何使用','流程'],r:'流程很简单：<br>1️⃣ 点顶部「开始模拟面试」<br>2️⃣ 选择场景、题数和每题时间<br>3️⃣ 限时作答（支持语音输入）<br>4️⃣ 对照参考答案自评打分<br>5️⃣ 生成复盘报告，看自己的短板',acts:[{t:'去练一场',go:'interview.html'}]},
  {k:['题库','题目','有哪些题','多少题'],r:'题库共有 '+QUESTIONS.length+' 道高频题，覆盖 5 大场景：求职实习、技术开发、数据分析、产品运营、通用行为。每题都带考察点、作答技巧和参考回答。',acts:[{t:'去刷题库',go:'bank.html'}]},
  {k:['语音','麦克风','说话','语音输入'],r:'在面试作答框右下角有麦克风按钮 🎤，点击后说话即可自动转文字（需要浏览器支持并授权麦克风，推荐 Chrome）。识别结果会直接填进作答框，可以再手动修改。'},
  {k:['自评','评分','打分','几颗星'],r:'每题作答后会展示参考要点，按 1-5 星给自己打分：<br>⭐ 完全没思路<br>⭐⭐ 说了一点但不全<br>⭐⭐⭐ 覆盖主要要点<br>⭐⭐⭐⭐ 要点全+表达顺<br>⭐⭐⭐⭐⭐ 亮点突出、可迁移'},
  {k:['复盘','报告','统计','记录'],r:'每场训练结束后会生成复盘报告：完成题数、平均自评、总用时、累计场次，还有教练点评和逐题回顾。首页也能看到累计统计数据。'},
  {k:['计时','时间','限时','倒计时'],r:'开始训练前可以选每题限时：60 / 90 / 120 秒。超时会自动提交当前答案。建议先求完整再求速度。'},
  {k:['自我介绍'],r:'自我介绍万能三段式：我是谁（专业+标签）→ 我有什么（成绩/竞赛/项目）→ 为什么适合（岗位匹配）。控制在 1-2 分钟，结尾落到岗位价值。题库里有 5 个不同方向的自我介绍示范，可以去看看。',acts:[{t:'看示范',go:'bank.html'}]},
  {k:['紧张','害怕','怯场'],r:'紧张很正常！三个小技巧：1）把面试当聊天而不是考试；2）提前把自我介绍练到脱口而出；3）每天来这里抽签看运势 + 随机快答一题，低成本练胆量 💪'},
  {k:['头像','昵称','改名','个人中心'],r:'点右上角你的头像，就能打开个人中心：改昵称、换头像、还能自定义全站背景颜色 🎨'},
  {k:['背景','颜色','主题','皮肤'],r:'点右上角头像 → 个人中心 → 背景颜色，有 6 套渐变背景可选，保存后全站生效。'},
  {k:['反馈','官方','off','建议','bug','问题反馈'],r:'可以点右上角 ✉️ 图标或下方按钮，把问题直接发给官方（off）。称呼、联系方式、问题描述三项必填，方便官方回复你。',acts:[{t:'立即反馈',fb:1}]},
  {k:['登录','账号','注册'],r:'登录很简单：在登录页输入昵称一键登录即可，不需要密码。数据保存在本地浏览器。'},
  {k:['数据','隐私','安全'],r:'放心，所有数据（训练记录、反馈、个人设置）都只保存在你自己的浏览器本地，不会上传到服务器。'},
  {k:['签到','打卡','每日签到'],r:'右下角有 ✔️ 签到按钮，或者浮动快捷菜单里也能一键签到。连续签到 3 天、累计签到 15 天都能解锁成就哦！',acts:[{t:'去签到',act:'checkin'}]},
  {k:['成就','勋章','徽章','解锁'],r:'目前有 '+ACH_DEFS.length+' 个成就可以解锁，包括初次面试、全场景王者、连续签到、面试人格测试等。右下角 🏅 按钮可以查看已解锁的成就墙。',acts:[{t:'查看成就墙',act:'ach'}]},
  {k:['人格','面试人格','测试','性格'],r:'首页娱乐区有「面试人格测试」，5 道题测出你是"即兴戏精 / 结构王者 / 成长型选手 / 佛系选手"中的哪一类，附个性化改进建议。',acts:[{t:'去测一测',go:'index.html#persona'}]},
  {k:['每日挑战','今日挑战','今天练什么'],r:'首页有「每日挑战」，每天根据日期生成一道固定面试题，今天的挑战是：<b>'+dailyChallenge().q.q+'</b>。点"去练"直接进入面试间。',acts:[{t:'去练这道',go:'interview.html'}]},
  {k:['梗','黑话','面试梗','互联网黑话'],r:'面试里经常会出现一些互联网黑话，比如"闭环""赋能""北极星指标""MVP"。首页有「面试梗百科」卡片，每天翻一个，下次听到就不会懵啦～'},
  {k:['翻卡','知识卡','tips','知识点'],r:'首页有「知识翻卡」，随机蹦出一个答题技巧点（来自 50 道题库），点一下翻一张，碎片时间也能练一下。'},
  {k:['快答','随机快答','趣味'],r:'首页娱乐区有「随机快答一题」，随机蹦题，60 秒口述思路再对答案，低成本热身效果好。连答 10 次解锁"快答战士"成就！'}
];

// 面试人格测试（简化版，直接算分）
var PERSONA_QS=[
  {q:'面对面试官突然抛出的奇怪问题，你通常会？',opts:[
    {t:'立刻组织语言，先给答案再解释',v:5},
    {t:'先确认题意，把球抛回去“我理解你的意思是…对吗？”',v:4},
    {t:'坦诚说“这个我确实没准备过，我会先从 XX 角度拆解”',v:3},
    {t:'假装淡定，其实脑子里一片空白',v:1}]},
  {q:'当你连续两次自评都在 2 星以下，你会？',opts:[
    {t:'立刻再刷 3 道同类题，当场补上',v:5},
    {t:'对照参考要点写成错题笔记，明天再战',v:4},
    {t:'先休息一下，明天状态好再来',v:2},
    {t:'怀疑自己不适合面试，心情低落',v:1}]},
  {q:'面对简历上自己最熟的项目，你讲的时间通常是？',opts:[
    {t:'90 秒 STAR 框架，不超纲',v:5},
    {t:'3 分钟，重点数据和技术细节',v:4},
    {t:'5 分钟以上，讲得很细但有时跑题',v:2},
    {t:'没仔细算过时间',v:1}]},
  {q:'你喜欢用哪种方式练面试？',opts:[
    {t:'限时模拟 + 语音转文字 + 自评（全真）',v:5},
    {t:'对着题库大声念答案',v:3},
    {t:'和同学互相 mock',v:4},
    {t:'看看参考要点就行，不开口',v:1}]},
  {q:'如果面完一面被拒，你会？',opts:[
    {t:'主动发邮件请反馈，针对性改简历/话术',v:5},
    {t:'复盘整场，和同学讨论改进点',v:4},
    {t:'换个方向投，不再想它',v:2},
    {t:'失落，几天不想面',v:1}]}
];
var PERSONA_RES=[
  {max:21,ic:'🎭',t:'即兴戏精',d:'临场反应极强，面对奇怪问题能立刻搭话，面试官会被你的节奏带跑。但容易忽略答题结构，建议每次开口前加一句“我想从 X 个角度说”来稳住。',rate:'⭐⭐⭐⭐ 面霸潜力'},
  {max:17,ic:'🧠',t:'结构王者',d:'你做事有条理、讲逻辑，STAR 框架刻在骨子里。建议在“结构清晰”之外，多加点个人故事和情绪感，面试不是写 PPT。',rate:'⭐⭐⭐⭐⭐ 稳妥之选'},
  {max:13,ic:'🌱',t:'成长型选手',d:'你有自我复盘和迭代的意识，这比单次答得好更珍贵。保持每天练一题 + 写笔记的节奏，两周后会有质的飞跃。',rate:'⭐⭐⭐⭐ 厚积薄发'},
  {max:0,ic:'😴',t:'佛系选手',d:'面试不是考研，不需要背完所有题；但也不能完全躺平。建议每天用本工具限时练 1 场，慢慢找回开口的感觉。',rate:'⭐⭐ 需要加油'}
];
function calcPersona(vals){
  var s=vals.reduce(function(a,b){return a+b},0);
  for(var i=0;i<PERSONA_RES.length;i++){if(s>=PERSONA_RES[i].max)return Object.assign({score:s},PERSONA_RES[i])}
  return Object.assign({score:s},PERSONA_RES[PERSONA_RES.length-1]);
}
// 面试梗 / 黑话
var MEME_POOL=[
  ['“了解嘛，了解嘛”','字节系互联网黑话，出自张一鸣讲话风格，意思是让你先大概理解一下，别纠结细节。'],
  ['“这个东西我们内部再对齐一下”','字面意思是内部开会讨论一下；潜台词：“我现在还拿不准/还在推/别催我”。'],
  ['“闭环”','产品/运营圈高频词，指一个业务从入口到出口完整跑通。被用烂后有时等于“这件事差不多做完了”。'],
  ['“底层逻辑”','不管啥问题先扯“底层逻辑是…”能显得专业，哪怕后面接的是常识。'],
  ['“赋能”','“给 XX 赋能”= 让 XX 更能干/给 XX 更多资源。被吐槽的互联网黑话之一。'],
  ['“抓手”','“找个抓手”= 找个切入点/着力点。互联网圈高频。'],
  ['“北极星指标”','一个业务只看一个最核心的长期值（如电商 GMV、教育完课率），其他指标围着它转。'],
  ['“做一个 MVP”','做一个最小可用版本，先上线试错而不是憋大招。面试里提一下会显得有产品 sense。'],
  ['“数据驱动”','任何决策先看数据，不靠拍脑袋。数据分析岗必考点。'],
  ['“A/B 实验”','分两组用不同方案跑一段时间，对比哪个效果好再全量。互联网产品的基本操作。'],
  ['“用户旅程”','一个用户从知道你、注册、使用、付费、离开的完整路径。产品岗常用。'],
  ['“技术栈”','这个岗位/项目用了哪些技术（语言+框架+工具）。技术面试必问。']
];
// 每日挑战（根据日期生成稳定题目）
function dailyChallenge(){
  var d=new Date();var seed=d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
  var idx=seed%QUESTIONS.length;
  return {date:d.toLocaleDateString('zh-CN',{month:'long',day:'numeric'}),q:QUESTIONS[idx]};
}
// 知识翻卡（抽一个"tips"点）
function flipCard(){
  var all=[];QUESTIONS.forEach(function(q){q.tips.forEach(function(t){all.push({tip:t,q:q})})});
  return all[Math.floor(Math.random()*all.length)];
}

var QBAR_ICONS={
  me:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>',
  mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/></svg>',
  checkin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  ach:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>'
};
function mountQuickBar(){
  if($('.qbar'))return;
  var bar=document.createElement('div');bar.className='qbar';
  var items=[
    {k:'me',title:'个人中心',act:function(){openProfile()}},
    {k:'mail',title:'反馈给官方（off）',act:function(){openFeedback()}},
    {k:'checkin',title:'每日签到',act:function(){checkIn();showCheckinPanel()}},
    {k:'ach',title:'成就墙',act:function(){openAchievements()}}
  ];
  var html=items.map(function(i){
    var dot=(i.k==='checkin'&&getCheckInfo().last!==new Date().toDateString())?'<span class="qbar-dot"></span>':'';
    return '<button class="qbar-btn" data-k="'+i.k+'" title="'+i.title+'">'+QBAR_ICONS[i.k]+dot+'</button>';
  }).join('');
  bar.innerHTML='<div class="qbar-wrap">'+html+'</div>';
  document.body.appendChild(bar);
  items.forEach(function(i){bar.querySelector('[data-k="'+i.k+'"]').onclick=i.act});
}

function showCheckinPanel(){
  var c=getCheckInfo();var today=new Date().toDateString();
  var done=c.last===today;/* 只读取，不写入 — 避免打开弹窗就自动签到 */
  var set7=buildWeek(c.history);
  var weekHtml=set7.map(function(d){
    return '<div class="ch-day'+(d.today?' today':'')+(d.done?' done':'')+(d.fu?' future':'')+'" title="'+d.label+'">'+d.num+'</div>'
  }).join('');
  var m=openMask(
    '<div class="m-head"><div><h3>📅 每日签到</h3><div class="m-sub">坚持签到，解锁更多成就和惊喜</div></div><button class="m-x" id="ciX">✕</button></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:18px">'+
      '<div class="card" style="padding:14px;text-align:center"><div id="ciDays" style="font-size:24px;font-weight:900;background:linear-gradient(90deg,#8ABDFF,#41E0C8);-webkit-background-clip:text;background-clip:text;color:transparent">'+c.days+'</div><div style="font-size:11.5px;color:var(--ink3);margin-top:3px">连续签到</div></div>'+
      '<div class="card" style="padding:14px;text-align:center"><div id="ciTotal" style="font-size:24px;font-weight:900;background:linear-gradient(90deg,#FBBF24,#F472B6);-webkit-background-clip:text;background-clip:text;color:transparent">'+c.total+'</div><div style="font-size:11.5px;color:var(--ink3);margin-top:3px">累计签到</div></div>'+
      '<div class="card" style="padding:14px;text-align:center"><div id="ciWeek" style="font-size:24px;font-weight:900;background:linear-gradient(90deg,#B7A6F9,#8ABDFF);-webkit-background-clip:text;background-clip:text;color:transparent">'+(c.days>=7?'已满7天':'还差'+(7-c.days)+'天')+'</div><div style="font-size:11.5px;color:var(--ink3);margin-top:3px">本周目标</div></div>'+
    '</div>'+
    '<div id="ciWeekBox" class="ch-week">'+weekHtml+'</div>'+
    '<div style="font-size:12px;color:var(--ink3);text-align:center;margin-top:12px">7 天一个循环，连签解锁专属成就</div>'+
    '<button class="btn pri" id="ciBtn" style="width:100%;margin-top:16px;padding:12px;font-size:14px">'+(done?'✅ 今日已签到':'✨ 立即签到')+'</button>');
  $('#ciX').onclick=closeMask;
  $('#ciBtn').onclick=function(){
    var r=checkIn();
    if(r&&!r.done){refreshCheckinPanel();pulseBadges(getLatestUnlocked())}
    else if(r&&r.done){/* 已签到 — 按钮已置灰，不用更新 */}
  };
}
/* 签到面板原地刷新 */
function refreshCheckinPanel(){
  var m=document.querySelector('.mask.show .modal');if(!m)return;
  var c=getCheckInfo();var today=new Date().toDateString();
  /* 数字弹跳 */
  var daysEl=$('#ciDays',m);if(daysEl){daysEl.textContent=c.days;daysEl.classList.add('num-pop');setTimeout(function(){daysEl.classList.remove('num-pop')},400)}
  var totalEl=$('#ciTotal',m);if(totalEl){totalEl.textContent=c.total;totalEl.classList.add('num-pop');setTimeout(function(){totalEl.classList.remove('num-pop')},400)}
  var weekEl=$('#ciWeek',m);if(weekEl){weekEl.textContent=(c.days>=7?'已满7天':'还差'+(7-c.days)+'天')}
  /* 日历重绘 */
  var weekBox=$('#ciWeekBox',m);if(weekBox){
    weekBox.innerHTML=buildWeek(c.history).map(function(d){
      return '<div class="ch-day'+(d.today?' today':'')+(d.done?' done':'')+(d.fu?' future':'')+'" title="'+d.label+'">'+d.num+'</div>'
    }).join('');
  }
  /* 按钮置灰 */
  var btn=$('#ciBtn',m);if(btn){btn.textContent='✅ 今日已签到';btn.disabled=true}
}
function buildWeek(hist){
  var set={};hist.forEach(function(d){set[d]=1});
  var out=[];
  for(var i=6;i>=0;i--){
    var t=new Date();t.setDate(t.getDate()-i);var ds=t.toDateString();
    out.push({num:t.getDate(),label:['周日','周一','周二','周三','周四','周五','周六'][t.getDay()]+' '+ds.slice(4).slice(0,-5),today:i===0,done:!!set[ds],future:false});
  }
  return out;
}

function openAchievements(){
  var list=getAchievements();
  var got=list.filter(function(a){return a.unlocked}).length;
  var html=
    '<div class="m-head"><div><h3>🏅 成就墙</h3><div class="m-sub">已解锁 '+got+' / '+list.length+' · 继续努力！</div></div><button class="m-x" id="acX">✕</button></div>'+
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px">'+
      list.map(function(a){
        return '<div class="ach-card'+(a.unlocked?'':' locked')+'" style="padding:14px;text-align:center;border-radius:14px;border:1px solid '+(a.unlocked?'rgba(108,140,255,.45)':'var(--line)')+';background:'+(a.unlocked?'rgba(108,140,255,.08)':'var(--card)')+';transition:.2s">'+
          '<div style="font-size:26px;filter:'+(a.unlocked?'none':'grayscale(1) opacity(.5)')+'">'+a.ic+'</div>'+
          '<div style="font-size:12px;font-weight:700;margin-top:4px">'+esc(a.t)+'</div>'+
          '<div style="font-size:10.5px;color:var(--ink3);margin-top:2px;line-height:1.5">'+esc(a.d)+'</div>'+
        '</div>'
      }).join('')+
    '</div>';
  var m=openMask(html);
  $('#acX').onclick=closeMask;
}

function refreshPfBadges(m){
  m=m||document.querySelector('.mask.show .modal');if(!m)return;
  /* 1. 成就徽章条：重新筛选最近解锁 + 锁定预览 */
  var achList=getAchievements();
  var achGot=achList.filter(function(a){return a.unlocked}).length;
  var recentAch=achList.filter(function(a){return a.unlocked}).sort(function(a,b){return (b.unlockAt||0)-(a.unlockAt||0)}).slice(0,6);
  var lockedAch=achList.filter(function(a){return !a.unlocked}).slice(0,Math.max(0,6-recentAch.length));
  var seenIds={};
  var newOrder=recentAch.concat(lockedAch);
  var row=m.querySelector('.pf-badge-row');if(row){
    row.innerHTML=newOrder.map(function(a){
      return '<div class="pf-badge'+(a.unlocked?'':' locked')+'" data-ach-id="'+a.id+'" title="'+esc(a.t)+' · '+esc(a.d)+'">'+
        '<span class="pf-badge-ic" style="filter:'+(a.unlocked?'none':'grayscale(1) opacity(.45)')+'">'+a.ic+'</span>'+
        '<span class="pf-badge-t">'+esc(a.t)+'</span>'+
      '</div>'
    }).join('');
  }
  var barFill=$('#pfAchBar',m);if(barFill){barFill.style.width=Math.round(achGot/achList.length*100)+'%'}
  var count=$('#pfAchCount',m);if(count){count.textContent=achGot+'/'+achList.length}

  /* 2. 签到数字卡 */
  var ci=getCheckInfo();
  var daysEl=$('#pfStreakDays',m);if(daysEl){daysEl.textContent=ci.days;daysEl.classList.add('num-pop');setTimeout(function(){daysEl.classList.remove('num-pop')},400)}
  var totalEl=$('#pfStreakTotal',m);if(totalEl){totalEl.textContent=ci.total;totalEl.classList.add('num-pop');setTimeout(function(){totalEl.classList.remove('num-pop')},400)}

  /* 3. 本周日历 */
  var weekBox=$('#pfWeekBox',m);if(weekBox){
    weekBox.innerHTML=buildWeek(ci.history).map(function(d){
      return '<div class="ch-day'+(d.today?' today':'')+(d.done?' done':'')+(d.fu?' future':'')+'" title="'+d.label+'">'+d.num+'</div>'
    }).join('');
  }

  /* 4. 阶梯档位：根据 ci.days 重新 .done 类 */
  var stepBox=$('#pfStepsBox',m);if(stepBox){
    $$('.pf-step',stepBox).forEach(function(el){
      var target=+el.getAttribute('data-step');
      el.classList.toggle('done',ci.days>=target);
      var ic=el.querySelector('.pf-step-ic');
      if(ic){ic.textContent=ci.days>=target?'✓':STREAK_REWARDS.find(function(r){return r.days===target}).ic}
    });
  }

  /* 5. 下一个里程碑进度条 */
  var nextStep=null;
  STREAK_REWARDS.forEach(function(r){if(ci.days<r.days&&!nextStep)nextStep=r});
  var nextBar=$('#pfNextBar',m);var nextFill=$('#pfNextFill',m);var nextAll=$('#pfNextAllDone',m);
  if(nextStep){
    var pct=Math.round(ci.days/nextStep.days*100);
    if(nextBar){nextBar.style.display='block'}
    if(nextFill){nextFill.style.width=pct+'%'}
    if(nextAll){nextAll.style.display='none'}
  }else{
    if(nextBar){nextBar.style.display='none'}
    if(nextAll){nextAll.style.display='block'}
  }

  /* 6. 签到按钮状态 */
  var todayStr=new Date().toDateString();
  var btn=$('#pfChBtn',m);
  if(btn){
    btn.textContent=(ci.last===todayStr)?'✅ 今日已签到，明天继续':'✨ 立即签到';
    btn.disabled=ci.last===todayStr;
  }
}

function getFavs(){return storeGet('ivsim_favs',[]).filter(function(x){return typeof x==='string'})}
function isFav(id){return getFavs().indexOf(id)>=0}
function toggleFav(id){
  var list=getFavs();
  var i=list.indexOf(id);
  if(i>=0){list.splice(i,1);storeSet('ivsim_favs',list);toast('已取消收藏','warn');return false}
  list.push(id);storeSet('ivsim_favs',list);toast('⭐ 已加入收藏','ok');return true
}
function favQues(limit){var ids=getFavs();var list=QUESTIONS.filter(function(q){return ids.indexOf(q.id)>=0});return limit?list.slice(0,limit):list}

var ttsOn=false,ttsUttr=null;
function canTTS(){return !!('speechSynthesis' in window)}
function speakTTS(text){
  if(!canTTS()){toast('浏览器不支持语音朗读（需要 SpeechSynthesis API）','warn');return}
  stopSpeak();
  ttsUttr=new SpeechSynthesisUtterance(text);
  ttsUttr.lang='zh-CN';ttsUttr.rate=0.95;ttsUttr.pitch=1;
  window.speechSynthesis.speak(ttsUttr);ttsOn=true;
  ttsUttr.onend=function(){ttsOn=false};
  ttsUttr.onerror=function(){ttsOn=false};
}
function stopSpeak(){if('speechSynthesis' in window){window.speechSynthesis.cancel();ttsOn=false}}

function drawRadar(canvas,labels,values,opt){
  opt=opt||{};var w=opt.w||260,h=opt.h||260,max=opt.max||5,levels=opt.levels||5;
  canvas.width=w;canvas.height=h;var cx=w/2,cy=h/2,r=Math.min(w,h)/2-30;
  var c=canvas.getContext('2d');c.clearRect(0,0,w,h);
  var n=labels.length;
  // 网
  c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=1;
  for(var lv=1;lv<=levels;lv++){
    c.beginPath();
    for(var i=0;i<n;i++){var a=-Math.PI/2+2*Math.PI*i/n;var rr=r*lv/levels;var x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;i?c.lineTo(x,y):c.moveTo(x,y)}
    c.closePath();c.stroke();
  }
  for(var i=0;i<n;i++){
    var a=-Math.PI/2+2*Math.PI*i/n;
    c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);c.stroke();
  }
  // 数据区
  c.beginPath();
  for(var i=0;i<n;i++){
    var a=-Math.PI/2+2*Math.PI*i/n;var rr=r*values[i]/max;var x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;
    i?c.lineTo(x,y):c.moveTo(x,y);
  }
  c.closePath();
  var g=c.createRadialGradient(cx,cy,10,cx,cy,r);
  g.addColorStop(0,'rgba(108,140,255,.55)');g.addColorStop(1,'rgba(65,224,200,.35)');
  c.fillStyle=g;c.fill();
  c.strokeStyle='#8ABDFF';c.lineWidth=2;c.stroke();
  // 标签
  c.fillStyle='#cdd8ff';c.font='12px "PingFang SC","Microsoft YaHei",sans-serif';c.textAlign='center';
  for(var i=0;i<n;i++){var a=-Math.PI/2+2*Math.PI*i/n;var x=cx+Math.cos(a)*(r+18),y=cy+Math.sin(a)*(r+18);c.fillText(labels[i],x,y+4)}
  // 数据点
  for(var i=0;i<n;i++){
    var a=-Math.PI/2+2*Math.PI*i/n;var rr=r*values[i]/max;var x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;
    c.beginPath();c.arc(x,y,3.5,0,6.28);c.fillStyle='#FBBF24';c.fill();
  }
}

function applyTheme(){
  var st=storeGet('ivsim_settings',{});var isDark=st.theme!=='light';
  document.body.classList.toggle('light',!isDark);
  /* --bgA/--bgB/--bgC 由 applyBg() 根据用户选择的背景预设统一管理，此处不再覆盖 */
  document.documentElement.style.setProperty('--ink',isDark?'#eef2ff':'#1a2340');
  document.documentElement.style.setProperty('--ink2',isDark?'#aab4d8':'#4b5882');
  document.documentElement.style.setProperty('--ink3',isDark?'#7c86ad':'#7a86a8');
}

function getGoal(){return storeGet('ivsim_goal',null)}
function setGoal(dateStr,name){storeSet('ivsim_goal',{date:dateStr,name:name});toast('已设置目标面试日','ok')}
function daysToGoal(){var g=getGoal();if(!g)return -1;var d=new Date(String(g.date).replace(/-/g,'/'));d.setHours(0,0,0,0);var now=new Date();now.setHours(0,0,0,0);return Math.ceil((d-now)/86400000)}

function mountOnboarding(){
  if(getUser()&&storeGet('ivsim_seen_tour',false))return;
  if(!getUser())return;
  var STEPS=[
    {t:'👋 欢迎来到模拟面试训练营 Pro',d:'我们帮你把每一次练习都当成真正的面试。先花 30 秒快速熟悉一下核心功能。',btn:'开始了解'},
    {t:'📍 首页 · 选择场景直接开练',d:'5 大场景卡片 + 6 张趣味卡。顶部导航随时切换页面，右下角有快捷菜单（个人中心 / 反馈官方 / 签到 / 成就）。',btn:'下一个 →'},
    {t:'🎤 模拟面试 · 限时作答',d:'设置场景题量时长 → 作答（支持语音转写）→ 对照参考要点 → 1-5 星自评 → 生成复盘报告。热身模式可以不计时先找找状态。',btn:'下一个 →'},
    {t:'🏅 成就 / 签到 / 每日挑战',d:'每天签到解锁成就，面试人格测试帮你找到自己的答题风格，面试梗百科让下次听到"闭环"不懵。右下角快捷菜单可以随时点。',btn:'去练一场 →'}
  ];
  var i=0;
  function show(){
    var s=STEPS[i];
    openMask('<div class="m-head"><div style="flex:1"><h3>'+s.t+'</h3><div class="m-sub" style="max-width:360px">'+s.d+'</div></div><button class="m-x" id="tnX">✕</button></div>'+
      '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px">'+
        (i>0?'<button class="btn gho sm" id="tnBack">← 上一个</button>':'')+
        '<button class="btn gho sm" id="tnSkip">跳过</button>'+
        '<button class="btn pri sm" id="tnNext">'+s.btn+'</button></div>');
    $('#tnX').onclick=closeMask;$('#tnSkip').onclick=done;
    if(i>0)$('#tnBack').onclick=function(){i--;show()};
    $('#tnNext').onclick=function(){i++;if(i>=STEPS.length){closeMask();done();location.href='interview.html'}else{closeMask();show()}};
  }
  function done(){storeSet('ivsim_seen_tour',true)}
  setTimeout(show,600);
}

function initPage(active,needLogin){
  mountBg();applyBg();applyTheme();
  if(needLogin&&!requireLogin())return false;
  mountNav(active);mountAgent();mountQuickBar();
  setTimeout(function(){tryUnlockAll()},800);
  setTimeout(mountOnboarding,1200);
  return true;
}
