# AGENTS.md

## 项目定位

这是项目事实制度与模板资料库。它维护通用规则、模板、安装脚本和 Agent Skill，不保存某个业务项目的正式批准需求。

## 修改前读取

修改制度或模板前读取：

1. `README.md`
2. `docs/project-facts-governance.zh-CN.md`
3. `docs/adoption-guide.zh-CN.md`
4. 涉及 neuDrive 接入时读取 `docs/neudrive-integration.zh-CN.md`

## 规则

- 不把 AI 推断写成已批准业务规则。
- 外部工具版本、标准内容和产品能力如会发生变化，更新前重新查官方资料并写日期。
- 制度正文有变化时，同步检查 `template/`、`skills/project-facts-maintainer/` 与安装脚本的表达是否仍一致。
- 来源快照位于 `docs/research/source-neudrive/`，保留原样用于追溯；需要修订的通用规则写到本项目自己的文档。
- 不让模板安装脚本覆盖目标仓库已有项目事实目录或已有 Skill。

## 验证

提交前执行：

```bash
./scripts/check-kit.sh
git diff --check
```

若修改了 Skill，再运行 Agent Skills 校验工具；若本机没有该工具，明确记录未验证。
