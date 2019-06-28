---
id: concepts
title: Concepts
---

Panoptes is a Python based network telemetry ecosystem that implements discovery, enrichment and polling. Key features 
include:

- A [modular design](#modular-design) with well defined separation of concerns,
- [Plugin architecture](#plugin-architecture) that enables the implementation of any telemetry collection, enrichment, 
or transformation,
- [Horizontally scalable](#horizontally-scalable): supports clustering to add more capacity, and
- Network telemetry specific constructs like SNMP abstractions, built in counter-to-gauge conversion.

## Modular Design

Discovery tasks figure out what metrics to collect, and on what devices.  Polling Plugins do the metric collection, and 
Enrichment Plugins add context to the metrics.  The separation of tasks allows Panoptes to scale easily.

![panoptes_architecture](assets/diagrams/panoptes_architecture.png)

We use Celery to run the individual tasks throughout the system.  Celery has some attractive characteristics in not 
having a single point of failure and allowing for scaling for capacity as needed.  Redis, Zookeeper and Kafka handle 
different types of persistent data. 

## Plugin Architecture

Plugins are written to make the data more homogeneous and consumer-friendly and are designed to be written very quickly,
providing a way to take a specific manufacturer's, device range and device models MIBs into account, and translating 
them to a well-defined abstraction in the case of the [system metrics](./panoptes-reference/system-metrics.md).

We provide a consistent framework and set certain conventions, then get out of the way.

## Horizontally Scalable

Our smallest model is a single Docker container.  Our largest model covers devices being monitored from multiple 
geographical locations.


#### Next Steps:
[Getting Started](./getting-started.md)

[Start of the reference guide](./panoptes-reference/objects-and-abstraction.md)
