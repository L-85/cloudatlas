# 云迹数据与素材来源记录

## 1. 科学分类依据

- World Meteorological Organization (WMO), International Cloud Atlas — Genera: https://cloudatlas.wmo.int/en/clouds-genera.html
- WMO 对十种云属的定义、识别方法和高度层级用于图鉴文案参考。WMO 图集中的图片不打包再分发。

## 2. 公开图像数据集

### CCAiM-CloudsDataset

- 页面：https://huggingface.co/datasets/serbekun/CCAiM-CloudsDataset
- 页面列出的数据量：971 张图像，10 个云属类别。
- 数据集卡片标注 MIT。
- 页面显示整体数据文件约 3.09 GB，因此本项目不将全量数据集打包。
- 类别计数（数据集卡片）：Cirrus 118、Cirrocumulus 33、Cirrostratus 48、Altocumulus 124、Altostratus 63、Nimbostratus 17、Stratocumulus 99、Stratus 38、Cumulus 398、Cumulonimbus 33。
- 云迹预载首批 100 张样本，图片来自 Hugging Face `clouds_1` 目录。其余样本通过 Dataset Viewer `/rows` 接口按批次读取，接口返回图像记录与类别标签；每次最多读取 100 行。图片使用仓库 `clouds_1` 目录中与 Viewer 行号对应的稳定原图路径。完整 971 条数据仍保留在原始仓库，项目不复制整套 3.09 GB 文件。
- 原始样本入口示例：
  - https://huggingface.co/datasets/serbekun/CCAiM-CloudsDataset/resolve/main/clouds_1/0.jpg
  - https://huggingface.co/datasets/serbekun/CCAiM-CloudsDataset/resolve/main/clouds_1/1.jpg
  - https://huggingface.co/datasets/serbekun/CCAiM-CloudsDataset/resolve/main/clouds_1/10.jpg
  - https://huggingface.co/datasets/serbekun/CCAiM-CloudsDataset/resolve/main/clouds_1/18.jpg

### Cloud-ImVN 1.0 (SWIMCAT extension)

- 页面：https://data.mendeley.com/datasets/vwdd9grvdp/2
- 2,100 张彩色图像，6 个类别，150 × 150 像素。
- 页面标注许可：CC BY 4.0。
- 适合后续增加云况分类、聚类或图像分析实验。

## 3. Pexels 视觉摄影素材

以下图片页面标注为 Pexels Free Photo。网站中使用远程图片链接；本项目保留了作品页面与摄影师信息。Pexels 页面标注为 Free / Free to use；如需公开部署或商业使用，应再次核对当前许可与摄影师页面要求。

| 用途 | 摄影师 | Pexels 页面 |
|---|---|---|
| 卷云 | Taahir Lone | https://www.pexels.com/photo/wispy-cirrus-clouds-in-a-clear-blue-sky-40401134/ |
| 卷积云 | Engin Akyurt | https://www.pexels.com/photo/cirrocumulus-clouds-in-the-sky-6137902/ |
| 高积云 | Adriana De Oliveira | https://www.pexels.com/photo/altocumulus-clouds-on-a-blue-sky-15393006/ |
| 积云 | Pouya Lucky | https://www.pexels.com/photo/white-cumulus-clouds-in-a-blue-sky-12135522/ |
| 层积云 | Lucas Pezeta | https://www.pexels.com/photo/cloudy-sky-in-sunny-day-4978423/ |
| 积雨云 | Jan van der Wolf | https://www.pexels.com/photo/dramatic-cumulonimbus-clouds-against-clear-sky-40908950/ |
| 粉紫晚霞 | Vera Silkina | https://www.pexels.com/photo/pink-sunset-clouds-9303386/ |
| 厚重云景 | Mustafa ezz | https://www.pexels.com/photo/cumulonimbus-clouds-1642660/ |
| 层云景观 | Diana | https://www.pexels.com/photo/small-houses-in-village-in-cloudy-day-5020997/ |
| 卷云 | Mahmoud Zakariya | https://www.pexels.com/photo/dramatic-sky-with-cirrus-clouds-at-daytime-34953157/ |
| 积云 | Mahmoud Zakariya | https://www.pexels.com/photo/cumulus-clouds-in-a-clear-blue-sky-37144017/ |
| 积云 | Mahmoud Zakariya | https://www.pexels.com/photo/blue-sky-with-fluffy-white-cumulus-clouds-36355691/ |
| 积云 | İremnur ÖZTÜRK | https://www.pexels.com/photo/cumulus-clouds-against-clear-blue-sky-37651581/ |
| 高积云 | Dom Sch-veg-man | https://www.pexels.com/photo/altocumulus-clouds-in-the-sky-14644830/ |
| 卷层云 | Diana | https://www.pexels.com/photo/cirrostratus-cloud-in-the-blue-sky-19203208/ |
| 层云景观 | Diogo Miranda | https://www.pexels.com/photo/stratus-clouds-at-sunset-25252453/ |
| 混合云景 | Victor Cayke | https://www.pexels.com/photo/altocummulus-and-stratocumulus-clouds-20568677/ |
| 粉橙晚霞 | TD Caldarello | https://www.pexels.com/photo/vibrant-orange-and-pink-sunset-clouds-28921646/ |
| 混合云景 | Brett Sayles | https://www.pexels.com/photo/fluffy-cumulus-and-cirrus-clouds-in-blue-sky-6635906/ |
| 积雨云景 | Kássia Melo | https://www.pexels.com/photo/storm-clouds-in-sky-20363859/ |
| 积雨云 | Md Rahidur Rahman | https://www.pexels.com/photo/dramatic-cumulonimbus-cloud-in-blue-sky-36316282/ |
| 卷积云 | Suzy Hazelwood | https://www.pexels.com/photo/photo-of-the-sky-12494015/ |
| 混合云景 | Amanda Moore | https://www.pexels.com/photo/close-up-of-clouds-in-sky-11318607/ |

Pexels 许可说明：https://www.pexels.com/license/

## 4. 使用边界

- 数据集许可证、单张图片版权、第三方摄影素材许可是不同层面的事项，应分别核对。
- 公开展示数据集名称与统计信息，不代表已经将整套数据集下载到项目本地。
- 图鉴卡片中的摄影作品仅作视觉参考；正式云型识别应结合云体结构、透明度、尺度和观测条件。

## 5. Dataset Viewer 分批接口

- 接口说明：https://huggingface.co/docs/dataset-viewer/rows
- 本项目请求：`https://datasets-server.huggingface.co/rows?dataset=serbekun%2FCCAiM-CloudsDataset&config=default&split=train&offset={offset}&length=100`
- 每次最多返回 100 行；接口按需返回标签，网页根据 `row_idx` 对应 `clouds_1` 目录中的稳定原图文件路径。
- 若接口暂时不可用，网站保留已预载的 100 张数据集样本，并提供原始数据集入口。

## 6. 用户个人拍摄照片

- 用户可在「我的云图」页面上传自己日常拍摄的天空照片。
- 用户照片与公开数据集、Pexels 摄影作品分开标注为「个人上传」。
- 用户可以自行选择 WMO 十种云属之一，也可以先标记为「待分类」，之后再修改。
- 用户照片存储在当前浏览器 IndexedDB，不会上传至云迹服务器；照片仅供该用户当前浏览器中的本地项目使用。
- 当前版本不进行自动云型识别。分类由用户手动选择，避免把未经验证的算法判断伪装成科学识别结果。
