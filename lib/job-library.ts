export interface JobLibraryGroup {
  id: string;
  name: string;
  roles: string[];
}

export interface JobLibraryCategory {
  id: string;
  name: string;
  groups: JobLibraryGroup[];
}

export interface JobLibraryEntry {
  title: string;
  category: string;
  group: string;
}

export const jobLibrary: JobLibraryCategory[] = [
  {
    id: "tech",
    name: "技术研发与数字化",
    groups: [
      {
        id: "backend",
        name: "后端开发",
        roles: ["Java高级开发工程师", "Go语言研发工程师", "Python开发工程师", "C/C++系统开发工程师", "Node.js全栈工程师", "分布式后端架构师"],
      },
      {
        id: "frontend",
        name: "前端与跨端",
        roles: ["高级前端开发工程师", "React前端工程师", "Web前端架构师", "移动端开发工程师", "跨端应用工程师"],
      },
      {
        id: "ai",
        name: "人工智能与算法",
        roles: ["大模型算法工程师", "机器学习工程师", "推荐算法工程师", "AI应用工程师", "计算机视觉工程师", "算法平台工程师"],
      },
      {
        id: "devops",
        name: "测试与运维架构",
        roles: ["测试开发工程师", "自动化测试工程师", "SRE运维工程师", "云平台架构师", "DevOps工程师"],
      },
      {
        id: "data",
        name: "数据与安全",
        roles: ["数据分析师", "数据仓库工程师", "数据产品经理", "信息安全工程师", "风控算法工程师"],
      },
    ],
  },
  {
    id: "product",
    name: "产品与体验设计",
    groups: [
      {
        id: "pm",
        name: "产品管理",
        roles: ["高级产品经理", "AI产品经理", "B端产品经理", "产品总监", "商业化产品经理", "策略产品经理"],
      },
      {
        id: "ux",
        name: "交互与体验设计",
        roles: ["高级交互设计师", "用户体验设计师", "服务设计师", "设计系统工程师"],
      },
      {
        id: "visual",
        name: "视觉与品牌设计",
        roles: ["视觉设计师", "品牌设计师", "UI设计师", "创意设计总监"],
      },
      {
        id: "research",
        name: "用户研究",
        roles: ["用户研究员", "体验研究专家", "市场研究分析师"],
      },
    ],
  },
  {
    id: "growth",
    name: "市场、运营与增长",
    groups: [
      {
        id: "marketing",
        name: "市场与品牌",
        roles: ["品牌市场经理", "市场营销总监", "整合营销经理", "公关传播经理"],
      },
      {
        id: "content",
        name: "内容与社区",
        roles: ["内容运营经理", "新媒体运营", "社区运营", "内容策划编辑"],
      },
      {
        id: "growth-ops",
        name: "增长与投放",
        roles: ["用户增长经理", "投放优化师", "增长策略分析师", "私域运营经理"],
      },
      {
        id: "customer",
        name: "客户成功",
        roles: ["客户成功经理", "解决方案顾问", "实施交付经理", "客户运营专员"],
      },
    ],
  },
  {
    id: "manufacturing",
    name: "生产制造与自动化",
    groups: [
      {
        id: "process",
        name: "工艺工程",
        roles: ["工艺工程师", "制造工程师", "精益生产工程师"],
      },
      {
        id: "automation",
        name: "设备与自动化",
        roles: ["自动化工程师", "设备维护工程师", "电气工程师"],
      },
      {
        id: "quality",
        name: "质量管理",
        roles: ["质量工程师", "供应商质量工程师", "质量体系经理"],
      },
    ],
  },
  {
    id: "supply",
    name: "供应链与现代物流",
    groups: [
      {
        id: "purchase",
        name: "采购与供应链",
        roles: ["采购经理", "供应链计划经理", "供应商管理经理"],
      },
      {
        id: "warehouse",
        name: "仓储与物流",
        roles: ["仓储运营经理", "物流规划工程师", "配送运营主管"],
      },
      {
        id: "planning",
        name: "计划与履约",
        roles: ["需求计划经理", "订单履约经理", "库存计划分析师"],
      },
    ],
  },
  {
    id: "corporate",
    name: "财务法务与人力职能",
    groups: [
      {
        id: "finance",
        name: "财务",
        roles: ["财务分析师", "财务经理", "税务经理", "资金管理经理"],
      },
      {
        id: "legal",
        name: "法务与合规",
        roles: ["法务经理", "合规经理", "知识产权顾问"],
      },
      {
        id: "hr",
        name: "人力资源",
        roles: ["招聘负责人", "HRBP", "组织发展经理", "薪酬绩效经理", "人力资源总监"],
      },
      {
        id: "admin",
        name: "行政与综合",
        roles: ["行政经理", "总裁助理", "办公室运营专员"],
      },
    ],
  },
];

export const jobLibraryEntries: JobLibraryEntry[] = jobLibrary.flatMap((category) =>
  category.groups.flatMap((group) =>
    group.roles.map((title) => ({ title, category: category.name, group: group.name }))
  )
);
