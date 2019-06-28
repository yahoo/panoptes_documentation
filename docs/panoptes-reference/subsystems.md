---
id: subsystems
title: Subsystems
sidebar_label: Subsystems
---
## Discovery

Discovery is the process of enumerating resources to be used throughout the rest of the system. A discovery plugin
interacts with any external system (for e.g. a CMDB) and produces a set of resources, with relevant metadata, which can
be used by the rest of the system.

The base Panoptes package contains a discovery plugin that can read a JSON file for a list of resources and add them
to the system.

## Enrichment

The enrichment subsystem in Panoptes schedules and executes enrichment plugins and upserts their output into Redis.

## Polling

Polling is the act of actually collecting metrics. As mentioned above, polling plugins (like all other plugins) are
Python code and thus can collect from any source - SNMP, API, CLI.

### Transformations

The polling agent has the ability to apply transforms to telemetry collected by polling plugins - this is done before
the data is placed on the message bus. Currently, there is only one implemented transformation - conversion from counter
to gauge. This is immensely useful for network telemetry since a lot of devices return only counters.

### Message Bus

The polling agent places collected and transformed metrics onto topics on the Kafka bus.

## Consumers

Consumers take the data produced by the discovery, enrichment or polling subsystems and integrate them with external
systems. The base Panoptes package ships with a consumer to transform metrics and emit metrics to InfluxDB.
