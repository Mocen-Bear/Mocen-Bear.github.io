---
title: 如何使用ESP32
date: 2026-11-02 20:40:00
tags:
  - 教程
---

ESP32 是一块十几块钱、自带 WiFi 和蓝牙的开发板。我第一次用它，是因为要做一个能连手机的小装置，当时对比了一圈：同样的事拿 Arduino UNO 做，得再挂一个蓝牙模块、一个联网模块，线接得跟蜘蛛网一样。ESP32 把这些都塞进一颗芯片里了。

这篇从头走一遍：拆快递、装环境、点亮第一盏灯，顺带把几个我踩过的坑标出来。

## 和 Arduino UNO 比，差在哪

| | ESP32 | Arduino UNO |
|---|---|---|
| 主频 | 240 MHz（双核） | 16 MHz |
| 内存 | 520 KB RAM 左右 | 2 KB |
| 无线 | WiFi + 蓝牙，内置 | 都没有，要外挂模块 |
| 价格 | 十几到二十几块 | 三四十块（原版更贵） |
| IO 电压 | 3.3V | 5V |
| 适合 | 联网、连手机、要算点东西的 | 纯点灯、纯电机、教学入门 |

一个提醒：ESP32 的 IO 是 **3.3V**，直接拿 5V 的传感器往上怼可能烧。UNO 是 5V，两边的传感器别混着抄。

## 买板子时看一眼这几点

- 认准 **ESP32-WROOM-32** 或 **ESP32-WROVER**，板子上金属罩印着。网上那种二三十块、带 USB 口、两排针的「ESP32 DevKit V1」就是最常见的入门板。
- 板载 USB 转串口一般是 **CH340** 或 **CP2102**，Windows 上要装驱动，不然插上没端口。
- 30 针和 38 针两种版本，功能差不多，38 针多引出几个脚。
- ESP32-S3 / C3 / S2 是另外的系列，引脚和部分 API 不一样。新手别买来当「ESP32」用，照抄教程会怀疑人生。

## 装环境

用 Arduino IDE 最省事，2.x 版本就行。

1. 打开 `文件 → 首选项`（Mac 是 `Arduino IDE → Settings`）。
2. 在 **其他开发板管理器地址** 里填：

```
https://espressif.github.io/arduino-esp32/package_esp32_index.json
```

3. 打开 **开发板管理器**，搜 `esp32`，装 **esp32 by Espressif Systems**。这个包不小，网慢就耐心等。
4. 插上板子，`工具 → 开发板` 选 **ESP32 Dev Module**，`工具 → 端口` 选新冒出来的那个 COM 口。

装完先别写代码，拿空程序编译上传一次。能传进去，说明驱动和端口都没问题。

## 第一个程序：让灯闪

```cpp
void setup() {
  Serial.begin(115200);
  pinMode(2, OUTPUT);
}

void loop() {
  digitalWrite(2, HIGH);
  delay(500);
  digitalWrite(2, LOW);
  delay(500);
}
```

大部分 DevKit 板子上的蓝色小灯接在 **GPIO2**，所以这段能让它一秒闪一下。你的板子不亮就把 `2` 换成 `5` 再试，接错引脚最多是不亮，不会坏。

上传时如果一直停在：

```
Connecting........_____....._____
```

多半是没进下载模式。**按住 BOOT，点一下 EN（或 RST），再松开 BOOT**，然后重新点上传。

## 串口：程序的眼睛

调试基本靠它。初始化一句，打印一句：

```cpp
void setup() {
  Serial.begin(115200);
  Serial.println("开机了");
}

void loop() {
  Serial.println(millis());
  delay(1000);
}
```

打开串口监视器，右下角波特率选 **115200**，就能看到数字往上跳。看到乱码，基本就是波特率没对上。

## 连 WiFi

```cpp
#include <WiFi.h>

void setup() {
  Serial.begin(115200);
  WiFi.begin("你的WiFi名", "你的密码");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
}
```

两个最常见的坑：

- **ESP32 只认 2.4GHz**。路由器把 2.4G 和 5G 合并成同一个名字，或者你只填了 5G 的网络名，它就会一直转圈。进路由器后台把 2.4G 的名字确认一下。
- 断线重连别想当然。库默认会尝试重连，但路由器重启、改了密码这些情况，最好还是在代码里看 `WiFi.status()`，别假设连上就一直连着。

另外，WiFi 密码直接写在代码里、代码又推到 GitHub 上，等于把钥匙贴门口。自己练手无所谓，真要公开就把账号密码挪到一个不提交的文件里。

## 蓝牙：手机能直接连

ESP32 的蓝牙分经典蓝牙和 BLE 两种，手机 App 一般用 **BLE**。最短的「能被搜到」的代码：

```cpp
#include <BLEDevice.h>

void setup() {
  BLEDevice::init("MyESP32");
  BLEDevice::getAdvertising()->start();
}
```

烧进去，手机装个 nRF Connect 就能扫到一个叫 `MyESP32` 的设备。这只是广播，要真收发数据还得建 service 和 characteristic，那部分稍长，以后单独写。

## 接舵机（这里最容易翻车）

```cpp
#include <ESP32Servo.h>

Servo s;

void setup() {
  s.attach(13, 500, 2500);   // 13 号脚，脉宽 500~2500us
}

void loop() {
  s.write(70);
  delay(600);
  s.write(130);
  delay(600);
}
```

记住一条：**舵机电源别从板子上取**。USB 供电的时候舵机一转，瞬间电流把电压拉下来，板子直接重启，串口里全是启动日志。正确做法是舵机接独立的 5V 电源，再把两边的 GND 接在一起。

## 引脚速查

| 引脚 | 注意 |
|---|---|
| GPIO 6 ~ 11 | 内部接 flash，别用 |
| GPIO 34 ~ 39 | 只能输入，没有内部上拉 |
| GPIO 0 / 2 / 12 / 15 | 上电瞬间有特殊作用，外接东西要小心（12 上电时不能为高） |
| ADC2 那组 | 开了 WiFi 就不能用，测电压换 ADC1 |
| 3.3V | 适合小传感器，别带电机 |

## 常见坑

1. 开发板选错。明明是 S3 的板子却选了「ESP32 Dev Module」，编译能过，跑起来不对。
2. 上传卡在 `Connecting...`，按住 BOOT 再复位。
3. 串口乱码，波特率没选 115200。
4. WiFi 连不上，九成是把 5G 的名字填进去了。
5. 一加外设就重启，供电不够，电机、舵机、继电器尤其明显。
6. 抄来的 `ledcSetup()` / `ledcAttachPin()` 编译报错。那是 Arduino-ESP32 2.x 的写法，3.x 换成了 `ledcAttach()`，装的是哪个版本就翻哪个版本的文档。

## 最后

ESP32 好玩的地方是，从「点灯」到「手机能连上」中间没多少台阶，一块板子、一根线、一个 IDE 就能开始。我拿它做过一个按电梯按钮的小装置：两块板各管一层楼，手机通过蓝牙发指令，舵机去压墙上的实体按钮。原理不复杂，难的是现场那点信号和供电的脾气。

先点亮那盏灯，后面的慢慢来 🍓
