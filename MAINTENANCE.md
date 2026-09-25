# 网站维护指南（给滕老师）

网站上的**团队动态（News）**和**团队成员（Team）**都来自一个 Google 表格。
您只需要在表格里加一行或改一格，网站会在几分钟内自动更新，不需要碰任何代码。

表格链接：

- 团队动态（News）：https://docs.google.com/spreadsheets/d/1_nqWBsD7XeLpJ_eqm1PBBtPH2Y-am0o41axTltJBQiE/edit
- 团队成员（Team）：https://docs.google.com/spreadsheets/d/1fkD6DYenQXB1iWBPmMnFbkzwvTQkwlECpPXvULxx5Kg/edit

---

## 一、发布一条团队动态

1. 打开「团队动态（News）」表格。
2. 在最后一行下面新增一行，按列填写：

| 列 | 填什么 | 例子 |
|---|---|---|
| date | 日期，格式 年-月-日 | 2025-09-01 |
| title | 标题（一句话） | Paper accepted in Building and Environment |
| description | 一两句说明，可留空 | Our work on … has been accepted. |
| category | 类别，任选一个：Award / Publication / Event / Recruitment | Publication |
| link | 相关网址，可留空 | https://doi.org/10.1016/… |
| image | 图片路径，通常留空（见第三节） | |

3. 不用点保存，Google 表格会自动保存。约 1 分钟后刷新网站即可看到。

最新的动态会自动排在最前面，首页显示最近 4 条，News 页显示全部。

## 二、增加或修改团队成员

1. 打开「团队成员（Team）」表格。
2. 新增一行，按列填写：

| 列 | 填什么 | 例子 |
|---|---|---|
| name | 姓名 | Zhang San |
| role | 身份，任选一个：Postdoc / PhD Student / MPhil Student / Research Assistant / Visiting Scholar | PhD Student |
| status | 在读填 Current，已毕业填 Alumni | Current |
| year | 起止年份 | 2023– 或 2020–2024 |
| email | 邮箱，可留空 | zhang.san@connect.polyu.hk |
| photo | 照片路径，通常留空（见第三节） | |
| bio | 一句话研究方向或去向 | Embodied carbon of modular buildings. |
| link | 个人主页，可留空 | |

3. 成员毕业后，把 status 改成 **Alumni**，在 bio 里写去向，网站会自动把这个人移到 Alumni 区。
4. 要删除某人，直接删掉那一行。

没有照片的成员会显示姓名首字母的圆形头像。

## 三、照片怎么处理

网站上的照片需要由管理员上传到服务器。请把照片发给管理员，并说明是谁的 / 哪条动态的。
管理员上传后会告诉您一个路径（例如 `assets/img/team/zhang-san.jpg`），把它填进表格的 photo 或 image 列即可。

## 四、论文列表

Publications 页面直接读取您的 ORCID 记录，不需要维护。
Scopus 会自动把新论文同步到 ORCID；如果某篇没有出现，登录 https://orcid.org 手动添加即可。

## 五、其他内容

简介、研究方向、课程、联系方式等文字变动很少，需要修改时告诉管理员。
