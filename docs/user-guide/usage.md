---
id: usage
sidebar_label: Usage
title: Using Panoptes
---
> Note that these services run in the foreground and should be run under a job control system like 
[supervisord](http://supervisord.org/) or [daemontools](https://cr.yp.to/daemontools.html) for production usage.

## Usage

After adjusting the config files to your environment, start the following services. 

If using the example configuration files perform the following commands first before starting each of the services:

```bash
mkdir -p /home/panoptes/plugins/discovery
mkdir -p /home/panoptes/plugins/polling
mkdir -p /home/panoptes/plugins/enrichment

mkdir -p /home/panoptes/log/discovery/agent
mkdir -p /home/panoptes/log/polling/scheduler/
mkdir -p /home/panoptes/log/polling/agent/
mkdir -p /home/panoptes/log/resources/
mkdir -p /home/panoptes/log/enrichment/scheduler/
mkdir -p /home/panoptes/log/enrichment/agent/
mkdir -p /home/panoptes/log/consumers/influxdb/
```

The services should be started in the order list below.

### Discovery Plugin Scheduler
```bash
mkdir -p /home/panoptes/log/discovery/scheduler
celery beat -A yahoo_panoptes.discovery.discovery_plugin_scheduler -l info \
    -S yahoo_panoptes.framework.celery_manager.PanoptesCeleryPluginScheduler
```

### Discovery Plugin Agent
```bash
mkdir -p /home/panoptes/log/discovery/agent
celery worker -A yahoo_panoptes.discovery.discovery_plugin_agent -l info \
    -f /home/panoptes/log/discovery/agent/discovery_plugin_agent_celery_worker.log \
    -Q discovery_plugin_agent -n discovery_plugin_agent.%h
```
    
### Resource Manager
```bash
mkdir -p /home/panoptes/log/resources/
cd ~
./package/bin/panoptes_resource_manager
```

### Enrichment Plugin Scheduler
```bash
mkdir -p /home/panoptes/log/enrichment/scheduler
celery beat -A yahoo_panoptes.enrichment.enrichment_plugin_scheduler -l info \
    -S yahoo_panoptes.framework.celery_manager.PanoptesCeleryPluginScheduler \
    --pidfile eps.pid
```

### Enrichment Plugin Agent
```bash
echo 'SET panoptes:secrets:snmp_community_string:<site> <snmp community string>' | redis-cli
mkdir -p /home/panoptes/log/enrichment/agent
celery worker -A yahoo_panoptes.enrichment.enrichment_plugin_agent -l info \
    -f /home/panoptes/log/enrichment/agent/enrichment_plugin_agent_celery_worker.log \
    -Q enrichment_plugin_agent -n enrichment_plugin_agent.%h
```

### Polling Plugin Scheduler
```bash
mkdir -p /home/panoptes/log/polling/scheduler
celery beat -A yahoo_panoptes.polling.polling_plugin_scheduler -l info \
    -S yahoo_panoptes.framework.celery_manager.PanoptesCeleryPluginScheduler \
    --pidfile pps.pid
```

### Polling Plugin Agent
```bash
mkdir -p /home/panoptes/log/polling/agent
celery worker -A yahoo_panoptes.polling.polling_plugin_agent -l info \
    -f /home/panoptes/log/polling/agent/polling_plugin_agent_celery_worker_001.log \
    -Q polling_plugin_agent -n polling_plugin_agent_001.%h \
    -Ofair --max-tasks-per-child 10
```

### InfluxDB Consumer
```bash
mkdir -p /home/panoptes/log/consumers/influxdb
cd ~
./package/bin/panoptes_influxdb_consumer
```
