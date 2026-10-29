---
title: 手把手教你搭一个自己的博客（零基础版）
date: 2025-08-10 18:00:00
tags:
  - 教程
  - 建站
---

8 月的头几天我把这个博客搭起来了，全程没花一分钱。搭完发现：最难的不是技术，是不敢开始。这篇就把我走过的路原样写下来，照着做，一个下午就能拥有自己的小站。

## 开始前，你只需要两样东西

1. **一个 GitHub 账号**：去 [github.com](https://github.com) 注册（免费，全世界的程序员都在用，以后还能放代码）
2. **装 Node.js**：去 [nodejs.org](https://nodejs.org) 下载 LTS 版本，一路「下一步」装完就行

> 装完可以在命令行里输入 `node -v` 检查，能打印出版本号就说明成功了。

## 第一步：装 Hexo（10 分钟）

Hexo 就是一个「把 Markdown 文章变成网站」的工具。打开命令行（Windows 按 `Win + R` 输入 `cmd`），依次执行：

```bash
npm install -g hexo-cli
hexo init my-blog
cd my-blog
npm install
```

> 国内下载慢的话，换国内镜像再装：`npm config set registry https://registry.npmmirror.com`

然后输入 `hexo server`，浏览器打开 `http://localhost:4000` —— 恭喜，你的博客已经诞生了，虽然还很丑。

## 第二步：换一件好看的衣服（挑主题）

默认主题确实不太好看。主题就是给博客穿的「皮肤」，网上能搜到一堆免费主题，比如我用的是 Butterfly，粉粉嫩嫩还够折腾。

装主题的大致套路（以 Butterfly 为例）：

```bash
npm install hexo-theme-butterfly
```

再把站点配置文件 `_config.yml` 里的 `theme:` 改成 `butterfly`，重新 `hexo server`，画风立刻不一样。

> 选主题小建议：先去主题官网看「示例站」，看着顺眼再装，别贪多。改配置前记得备份原文件。

## 第三步：免费上线（最爽的一步）

博客写在自己电脑上，别人看不到。要上线就要一个「放网站的地方」——GitHub Pages 免费送你一个网址：`你的用户名.github.io`。

1. 在 GitHub 上新建仓库，名字就叫 `你的用户名.github.io`（比如我叫 `mocen-bear`，就建 `Mocen-Bear.github.io`）
2. 装一个小工具帮我们传文件：

```bash
npm install hexo-deployer-git --save
```

3. 在 `_config.yml` 最底下加上：

```yaml
deploy:
  type: git
  repo: https://github.com/你的用户名/你的用户名.github.io.git
  branch: main
```

4. 执行 `hexo clean && hexo deploy`，等几分钟，访问你的网址 —— 「上线了，老板！」

## 以后怎么写文章？

就一个文件的事：在 `source/_posts` 文件夹里新建一个 `xxx.md`，开头写上标题和日期：

```markdown
---
title: 文章标题
date: 2025-08-10 18:00:00
tags:
  - 随笔
---

正文用 Markdown 想写啥写啥
```

保存后 `hexo server` 本地看看效果，满意就 `hexo clean && hexo deploy` 发布。完事。

## 踩坑预警（我都替你踩过了）

- **命令报错先别慌**：90% 是没装完依赖或者路径不对，把报错复制去搜索引擎
- **文件名用英文**：文章文件名会变成网址，中文会变成一长串乱码一样的符号
- **杀毒软件可能误报**：有些建站工具会被拦，加个信任就好，别怀疑人生
- **改配置出不来效果**：先 `hexo clean` 再 `hexo generate`，缓存是玄学的温床

---

到这里你已经超越 99% 只停留在「想做个博客」的人了。剩下的（换头像、改公告、加访客统计）都是慢慢装修的事，不着急。

欢迎常来我的小站，有任何问题可以在下面留言 🍓