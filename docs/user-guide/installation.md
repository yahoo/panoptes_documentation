---
id: installation
title: Installation
sidebar_label: Installation
---

## Pre-requisites

> If you would be installing the entire stack on a single host, we recommend using a host with at least 8 Cores, 16GB 
RAM and 50GB Disk Space.

### OS

Panoptes has been extensively tested on Redhat Linux, though it should run on any distribution that's compatible 
with [LSB](https://en.wikipedia.org/wiki/Linux_Standard_Base). 

The OS should also have the following packages installed:

 - gcc
 - gcc-c++
 - python-dev
 - openssl-devel

### Python

Panoptes currently supports Python 2.7 only. You can download the latest stable version of Python 2.7 from 
[here](https://www.python.org/downloads/release/python-2716/)

python-virtualenv should also be installed in order to run panoptes in a contained python environment, as per the 
examples below.

### Dependencies

Before downloading and installing Panoptes, you would need the following services installed and configured

- [Redis](#Redis)
- [Zookeeper](#Zookeeper)
- [Kafka](#Kafka)
- [InfluxDB](#InfluxDB)
- [Grafana](#Grafana)

#### Redis

Panoptes has been tested with [Redis 4.0.9](http://download.redis.io/releases/)

#### Zookeeper

Panoptes has been tested with [Zookeeper version 3.4.10](https://archive.apache.org/dist/zookeeper/zookeeper-3.4.10/)

#### Kafka

Panoptes has been tested with [Kafka version 1.1.0](https://kafka.apache.org/downloads#1.1.0)

#### InfluxDB

Please follow these instructions to download and install [InfluxDB](https://portal.influxdata.com/downloads)

#### Grafana

[Grafana](https://grafana.com/get) is a mature visualization product.  We'll use this to visualize output.

## Installation

Install Panoptes by running the following commands:

```bash
sudo useradd panoptes
sudo -su panoptes
cd ~
mkdir -p /home/panoptes/conf
mkdir -p /home/panoptes/log
virtualenv -p python2.7 package
source ~/package/bin/activate
pip install --upgrade setuptools
pip install yahoo_panoptes
```

## Configuration
Panoptes is configured with ini style configuration files

`/home/panoptes/conf/panoptes.ini` is the main configuration file; and you can find an examples of config files 
under `examples`

For a quick start, you can copy all config files under `examples` to `/home/panoptes`

See [Configuration](./configuration.md) for more details on these files.

