---
title: 如何编辑固件并使用地瓜X5开发板
date: 2026-11-02 20:00:00
tags:
  - 教程
---

地瓜 X5 是我最近一直在用的一块开发板。简单说，它是一台巴掌大的 Linux 小电脑，ARM 架构，自带 NPU，插上电、接上网线就能通过 SSH 登进去干活。

我用它跑过一个本地 HTTP 服务，也用它通过串口控制过外设。这篇文章把第一次上手踩过的地方记下来，按顺序做基本能少走弯路。

## 先搞清楚一件事：它不是单片机

如果你之前用 Arduino 或者 ESP32，第一反应可能是「写代码 → 点上传」。X5 不是这个套路。

它跑的是完整的 Linux 系统（一般是 Ubuntu），能 `apt install`，能开服务，能装 Python 库，重启之后程序要自己想办法活过来。所以思维要从「烧程序」切换到「部署服务」。

| | Arduino / ESP32 | 地瓜 X5 |
|---|---|---|
| 系统 | 无（裸机循环） | 完整 Linux |
| 写代码方式 | 编译上传固件 | SSH 上去改文件、跑进程 |
| 适合干的事 | 引脚控制、传感器 | 跑服务、处理数据、带 NPU 做推理 |
| 程序常驻 | 天然常驻 | 要自己配开机自启 |

## 第一次开机

按官方文档烧好镜像，插电。我建议第一件事就插网线，比折腾无线省事得多。

要连上它，得先知道它的 IP。两个办法：登录路由器后台看设备列表，或者接串口控制台看启动日志。拿到 IP 之后：

```bash
ssh root@192.168.x.x     # 换成板子的真实 IP
```

首次登录的默认密码记得马上改掉，别让它一直挂着出厂密码。

登进去先看一眼时间。这类板子基本都没有 RTC 电池，断电久了时间会停在过去，而时间不对会让 HTTPS、证书、日志全都出怪问题：

```bash
date                                              # 看当前时间
sudo timedatectl set-timezone Asia/Shanghai       # 设时区
sudo timedatectl set-ntp true                     # 联网自动对时
```

## 装环境：记得它是 ARM64

```bash
uname -m    # 输出 aarch64 就对了
```

后面装东西之前，先把基础工具补齐：

```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv build-essential python3-dev
```

Python 环境建议用 venv 隔开，别往系统 Python 里直接 pip：

```bash
python3 -m venv /root/venv
source /root/venv/bin/activate
pip install pyserial requests
```

这里有个新手常懵的点：**pip 装包比笔记本上慢很多，甚至在编译源码**。原因是网上现成的预编译包大多是 x86 的，ARM 上找不到对应的轮子，pip 只好下载源码现编译。这属于正常现象，不是网络坏了。编译报错的话，八成是缺 `build-essential` 或 `python3-dev`。

## 让程序开机自启：systemd

自己 `nohup` 挂后台，重启就没了，而且不好查日志。Linux 上的正规做法是写一个 systemd 服务：

```ini
# /etc/systemd/system/my-service.service
[Unit]
Description=my service
After=network.target

[Service]
ExecStart=/root/venv/bin/python3 /root/app/main.py
WorkingDirectory=/root/app
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

写完执行：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now my-service
systemctl status my-service          # 看状态
journalctl -u my-service -f          # 实时看日志
```

`Restart=always` 那行很重要，程序崩了会自动拉起来，板子长期无人值守靠的就是它。

## 用串口接外设

很多模块（舵机驱动板、传感器、单片机）还是走串口。Python 里用 pyserial 就够了：

```python
import serial
import time

ser = serial.Serial("/dev/ttyUSB0", 115200, timeout=1)
ser.write(bytes([0x01, 0x02, 0x03]))
time.sleep(0.05)
print(ser.read(8).hex())   # 读回来的数据，十六进制打印最直观
```

两个坑提前说：

- **权限**：普通用户读不了串口，把你加进 dialout 组（`sudo usermod -aG dialout $USER`），重新登录生效；图省事就直接 root 跑。
- **设备名会变**：插拔顺序不同，`ttyUSB0` 可能变成 `ttyUSB1`。先 `ls /dev/ttyUSB*` 确认，长期用建议写 udev 规则固定名字。

## 网络上的几个坑

这部分是我花时间最多的地方，整理成表：

| 现象 | 原因 | 处理 |
|---|---|---|
| SSH 挂一会儿就断，ping 时通时不通 | 无线网卡省电，空闲自动休眠 | 关省电，见下面 |
| 下载很慢，信号强度忽高忽低（-70 到 -85 来回跳） | 板载 USB 网卡本身弱，和摆放位置关系很大 | 优先插网线；不行就把热点挪近，别指望调参数解决 |
| 时间跳回过去 | 没有 RTC 电池 | 联网自动对时 |
| 重启后服务不见了 | 只 start 没 enable | `systemctl enable` |

关 WiFi 省电这件事，临时执行一次是：

```bash
sudo iw dev wlan0 set power_save off
```

但重启会失效，所以做成服务，开机自动关：

```ini
# /etc/systemd/system/wifi-awake.service
[Unit]
Description=Disable WiFi power saving
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/sbin/iw dev wlan0 set power_save off
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now wifi-awake
```

顺带说一句，我试过把无线速率固定到最低档想换稳定，实测没收益，反而更慢，后来还原成自适应了。信号弱这件事，物理上解决（换位置、插网线）比改软件参数靠谱。

## 几个省时间的习惯

- 远程改文件用 `scp` 或 SFTP 传上去，别在 SSH 里写那种绕好几层引号的命令，引号嵌套是翻车的重灾区。
- 改 `/etc` 下的文件之前先 `cp` 一份备份，改坏了还能退。
- 每次改完服务先 `systemctl restart`，再实际请求一次接口验证，别只看「服务已启动」就完事。
- 日志别靠猜，`journalctl -u 服务名 -f` 挂在那儿，问题自己会说话。

## 最后

X5 这种板子的定位很清楚：一台不吵、不占地方、常年在线的小电脑。上手成本几乎全在头一天——把网络连顺、把时间校好、把服务做成开机自启，这三件事弄完，剩下的都是普通 Linux 的活。

真要说经验，就一句：**先让它稳定在线，再去折腾功能。**
