---
id: installation
title: Installation
sidebar_label: Installation
---

## Pre-requisites

> If you would be installing the entire stack on a single host, we recommend using a host with at least 8 Cores, 
> 16GB RAM and 50GB Disk Space.

> These instructions are for installing Panoptes in a production environment.  If you're testing or developing Panoptes
> we would recommend the [Panoptes_docker](https://github.com/yahoo/panoptes_docker) project instead.

### OS

Panoptes has been extensively tested on Redhat Linux, though it should run on any distribution that's compatible 
with [LSB](https://en.wikipedia.org/wiki/Linux_Standard_Base). 

The OS should also have the following packages installed:

 - python3
 - python3-venv
 - python3-pip
 - python3-setuptools

### Python

Panoptes supports Python3.  Our reference version for the moment is Python 3.6, and you'll need venv or another 
virtual environment for Python3.

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

Install Panoptes by running the following commands (assuming `venv`):

```bash
sudo useradd panoptes
sudo -su panoptes
cd ~
mkdir -p /home/panoptes/conf
mkdir -p /home/panoptes/log
python3 -m venv /home/panoptes_v
source /home/panoptes_v/bin/activate
pip3 install wheel
pip3 install yahoo_panoptes
```

## Configuration
Panoptes is configured with ini style configuration files

`/home/panoptes/conf/panoptes.ini` is the main configuration file; and you can find an examples of config files 
under `examples`

For a quick start, you can copy all config files under `examples` to `/home/panoptes`

See [Configuration](./configuration.md) for more details on these files.

