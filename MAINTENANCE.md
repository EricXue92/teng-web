# 网站维护指南（给滕老师）

网站上的**团队动态（News）**、**团队成员（Team）**、**科研项目（Projects）**和**获奖记录（Awards）**都来自 Google 表格。
您只需要在表格里加一行或改一格，网站会在几分钟内自动更新，不需要碰任何代码。

表格链接：

- 团队动态（News）：https://docs.google.com/spreadsheets/d/1_nqWBsD7XeLpJ_eqm1PBBtPH2Y-am0o41axTltJBQiE/edit
- 团队成员（Team）：https://docs.google.com/spreadsheets/d/1fkD6DYenQXB1iWBPmMnFbkzwvTQkwlECpPXvULxx5Kg/edit
- 科研项目（Projects）：https://docs.google.com/spreadsheets/d/1azAKximDZH-W7Aq6YqiSAR_lEkWU5_SQUV6YaCY2XF4/edit
- 获奖记录（Awards）：https://docs.google.com/spreadsheets/d/1Hqdr9gVlvEtRt8wFk29Cixl6YeGNxjhTLSXlCSObUjw/edit

---

## 一、发布一条团队动态

1. 打开「团队动态（News）」表格。
2. 在最后一行下面新增一行，按列填写：

| 列          | 填什么                                                    | 例子                                       |
| ----------- | --------------------------------------------------------- | ------------------------------------------ |
| date        | 日期，格式 年-月-日                                       | 2025-09-01                                 |
| title       | 标题（一句话）                                            | Paper accepted in Building and Environment |
| description | 一两句说明，可留空                                        | Our work on … has been accepted.           |
| category    | 类别，任选一个：Award / Publication / Event               | Publication                                |
| link        | 相关网址，可留空                                          | https://doi.org/10.1016/…                  |
| image       | 图片路径，通常留空（见第五节）                            |                                            |

3. 不用点保存，Google 表格会自动保存。约 1 分钟后刷新网站即可看到。

最新的动态会自动排在最前面，News 页显示全部。

## 二、增加或修改团队成员

1. 打开「团队成员（Team）」表格。
2. 新增一行，按列填写：

| 列     | 填什么                                                                                              | 例子                                 |
| ------ | --------------------------------------------------------------------------------------------------- | ------------------------------------ |
| name   | 姓名                                                                                                | Zhang San                            |
| role   | 身份，任选一个：Postdoc / PhD Student / MPhil Student / Research Assistant / Visiting Scholar       | PhD Student                          |
| status | 在读填 Current，已毕业填 Alumni                                                                     | Current                              |
| year   | 起止时间，可以写到月份。在读成员只填起始时间加横线（如 2023.09–），网站会自动显示为 2023.09–Present | 2023.09– 或 2020.09–2024.06          |
| email  | 邮箱，可留空                                                                                        | zhang.san@connect.polyu.hk           |
| photo  | 照片路径，通常留空（见第五节）                                                                      |                                      |
| bio    | 一句话研究方向（结尾不加句号）。需要加链接时写成 `[显示文字](网址)`，见下方说明                       | Embodied carbon of modular buildings |
| link   | 个人主页，可留空                                                                                    |                                      |

3. 成员毕业后，把 status 改成 **Alumni**，bio 保留研究方向，网站会自动把这个人移到 Alumni 区。
4. 要删除某人，直接删掉那一行。

没有照片的成员会显示姓名首字母的圆形头像。

bio 里可以换行和加链接：

- 换行：在单元格里按 **Alt+Enter**（Mac 上按 **Option+Enter** 或 **Cmd+Enter**），网站上会在同一位置换行。
- 链接：把要显示的文字放在方括号里，紧跟着把网址放在圆括号里，中间不要有空格。

例如单元格里写两行：

```
Urban buildings, carbon emissions, spatio-temporal analysis
Co-supervised by [Prof. Geoffrey Shen](https://www.polyu.edu.hk/ppoffice/senior-management-team/avpgp/)
```

网站上第二行会显示成 "Co-supervised by Prof. Geoffrey Shen"，其中名字可以点击。

成员会按 year 列的开始时间自动排序：在读成员在各自的身份分组内，最早加入的排在最前面；已毕业成员（Alumni）则是最近加入的排在前面。表格里行的先后顺序不影响显示。

## 三、增加或修改科研项目

1. 打开「科研项目（Projects）」表格。
2. 新增一行，按列填写：

| 列          | 填什么                                                             | 例子                                                            |
| ----------- | ------------------------------------------------------------------ | --------------------------------------------------------------- |
| title       | 项目名称                                                           | Carbon Responsibility Allocation in Prefabricated Supply Chains |
| role        | 您的角色，如 PI / Co-PI / Co-I / Lead Researcher / Key Participant | PI                                                              |
| funder      | 资助机构                                                           | Research Grants Council (RGC) Early Career Scheme               |
| period      | 起止年份                                                           | 2025–2027                                                       |
| amount      | 金额，可留空                                                       | HK$ 1,000,000                                                   |
| status      | 进行中填 Ongoing，已结题填 Completed                               | Ongoing                                                         |
| description | 一两句项目简介                                                     | Develops a fair allocation framework for …                      |
| link        | 项目网址，可留空                                                   |                                                                 |
| details     | 详细介绍，可留空。填了之后，项目标题可以点击展开                   | This project aims to develop …                                  |
| images      | 详细介绍里的配图路径，可留空；多张图用分号隔开（见第五节）         | assets/img/projects/a-1.jpg; assets/img/projects/a-2.jpg        |

3. 项目结题后把 status 改成 **Completed**，网站会自动移到 Completed 区。
4. 想让某个项目可以点开看详细介绍：在 details 列写一段文字；需要配图时把图片发给管理员，管理员上传后把路径填进 images 列。两列都留空的项目不会出现展开按钮。

注意：

- 网站只显示 role 为 **PI** 或 **Co-PI** 的项目，PI 的排在 Co-PI 前面。其他角色（Co-I、Lead Researcher 等）的项目可以留在表格里备查，但不会出现在网站上。
- description 里的项目编号（写成 `Project No. 15220923.` 这种格式）不会显示在网站上，其余文字照常显示。

## 四、增加或修改获奖记录

1. 打开「获奖记录（Awards）」表格。
2. 新增一行，按列填写：

| 列     | 填什么                                                         | 例子                           |
| ------ | -------------------------------------------------------------- | ------------------------------ |
| title  | 奖项名称                                                       | Best Paper Award               |
| issuer | 颁奖的会议或机构，可留空                                       | CIB World Building Congress    |
| year   | 获奖年份；同一奖项多次获得时用逗号隔开                         | 2022, 2025                     |
| note   | 补充说明，可留空，会显示在卡片底部                             | Top 1%                         |
| link   | 相关网址，可留空；填了之后奖项名称会变成可点链接               |                                |
| image  | 获奖证书图片的路径，可留空（见第五节）；留空时显示一个默认图标 | assets/img/awards/cib-2025.jpg |

奖项会按年份自动排序，最近获得的排在最前面；一行里有多个年份时，网站会把每个年份拆成单独的一条分别显示；同一年的奖项按表格里的先后顺序显示。

## 五、照片怎么处理

网站上的照片需要由管理员上传到服务器。请把照片发给管理员，并说明是谁的 / 哪条动态的。
管理员上传后会告诉您一个路径（例如 `assets/img/team/zhang-san.jpg`），把它填进表格的 photo 或 image 列即可。

### 团队成员照片的要求

向成员收集照片时，可以直接把下面几条转给他们：

- 正方形，或者人周围留有余地、能裁成正方形的照片
- 至少 400×400 像素（手机原图或证件照都够用）
- 脸在画面中间，头顶和肩膀周围留一些空白
- 光线清楚，正面或微侧，背景不要太杂乱

网站会把照片裁成圆形显示，四个角会被切掉，所以贴着边的头发和肩膀会看不到。
成员直接发原图即可，不需要自己裁剪，管理员会统一裁剪和缩小，让所有人的头像比例一致。

## 六、论文列表

Publications 页面直接读取您的 ORCID 记录，不需要维护。
Scopus 会自动把新论文同步到 ORCID；如果某篇没有出现，登录 https://orcid.org 手动添加即可。

ORCID 里暂时没有的论文和专利（2026 年 10 月按简历补充了 32 条）由管理员放在网站的补充列表里，同样会显示在 Publications 页面。
以后某篇论文进入 ORCID，网站会自动只保留一条，不会重复。需要往补充列表里加内容时告诉管理员。

每篇论文按期刊参考文献格式显示（作者、年份、题目、期刊、卷期、页码），您的名字加粗。作者和卷期页码由网站自动从 Crossref 查到，不需要填写。
通讯作者的星号（\*）是按简历标的；新论文需要标星号时告诉管理员。

## 七、其他内容

简介、研究方向、课程、联系方式等文字变动很少，需要修改时告诉管理员。
首页上的教育经历和 Join Us 页面的招生说明也属于这一类：有变动时，把内容发给管理员更新。
