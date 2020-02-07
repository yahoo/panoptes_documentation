---
id: plugin-guide
title: Writing a Plugin
sidebar_label: Writing A Plugin
---

Writing a Panoptes Polling Plugin

**NOTE** This tutorial is written assuming the reader has already read the `plugin-overview` docs [here](https://getpanoptes.io/docs/panoptes-reference/plugin-overview), has the [docker](https://github.com/yahoo/panoptes_docker) running and is working out of your local `panoptes_docker/resources/panoptes/polling/plugins` directory which is mounted directly in the container. All changes in the plugins directory are immediately mirrorred and are live in the container.

```
panoptes_docker % tree
panoptes_docker
├── Code-of-Conduct.md
├── Contributing.md
├── Dockerfile
├── LICENSE
├── Readme.md
├── docker_quickstart.md
└── resources
    ├── panoptes
    │   ├── polling
    │   │   └── plugins <-- You should be here
    │   │       ├── tutorial_plugin.panoptes-plugin.example
    │   │       └── tutorial_plugin.py
........
```
Shown above is the tree structure of the [panoptes docker](https://github.com/yahoo/panoptes_docker) director you should be working out of.

If you haven't cloned the docker, run the following commands to get caught up.

```sh
git clone https://github.com/yahoo/panoptes_docker
cd panoptes_docker
docker build . -t panoptes_docker
docker run -d --sysctl net.core.somaxconn=511 -v `pwd`/resources/panoptes/polling/plugins:/home/panoptes_v/lib/python3.6/site-packages/yahoo_panoptes/plugins/polling/mounted --name="panoptes_docker" --shm-size=2G -p 127.0.0.1:8080:3000/tcp panoptes_docker
cd resources/panoptes/polling/plugins
```

1) Start With The Provided Plugin Skeleton and paste it into the tutorial_plugin.py file.
```python
from typing import Dict, Any
import time
from yahoo_panoptes.polling.polling_plugin import PanoptesPollingPlugin
from yahoo_panoptes.framework.metrics import PanoptesMetricsGroupSet, PanoptesMetricsGroup, \
    PanoptesMetric, PanoptesMetricType, PanoptesMetricDimension
from yahoo_panoptes.framework.plugins.context import PanoptesPluginContext
from yahoo_panoptes.framework.resources import PanoptesResource


class TutorialPollingPlugin(PanoptesPollingPlugin):
    """
    Only classes that inherit from PanoptesPollingPlugin are loaded. (Upstream Configuration Knobs Control This)
    """
    def __init__(self):
        self._plugin_context: PanoptesPluginContext = None
        self._config: Dict[str, Any] = {}
        self._panoptes_metrics_group_set: PanoptesMetricsGroupSet = PanoptesMetricsGroupSet()
        self._device: PanoptesResource = None
        self._execute_frequency: int = 60
        self._logger = None
        super(TutorialPollingPlugin, self).__init__()

    def populateMetricsGroupSetWithTimeSeries(self) -> None:
        """
        PanoptesMetricsGroupSet<set>{
            PanoptesMetricsGroup<dict>{
                dimensions<set>: {
                    PanoptesMetricDimension(name: str, value: str),
                    PanoptesMetricDimension(name: str, value: str),
                    ....
                },
                metrics<set>: {
                    PanoptesMetric(metric_name: str, metric_value: number, metric_type: {1: 'COUNTER', 0: 'GAUGE'}),
                    PanoptesMetric(metric_name: str, metric_value: number, metric_type: {1: 'COUNTER', 0: 'GAUGE'}),
                }
            },
            PanoptesMetricsGroup<dict>{...},
            PanoptesMetricsGroup<dict>{...}
        }

        Signatures:
            PanoptesMetricsGroup(resource: PanoptesResource, group_type: str, interval: int)
                - Timeseries container which is able to hold any number of metrics & dimensions.

            PanoptesMetricDimension(name: string_types, value: string_types)
            PanoptesMetric(metric_name: string_types, metric_value: number, metric_type: {1: 'COUNTER', 0: 'GAUGE'})
                - Note: Panoptes performs rate conversions specified in the .panoptes-plugin file

        The text above shows the structure of how time series data is stored within the PanoptesMetricsGroupSet.
        """
        pass


    def run(self, context: PanoptesPluginContext) -> PanoptesMetricsGroupSet:
        """
        This function is called by the runner.py::class PanoptesPluginRunner::execute_plugin()::177
        The PluginRunner creates an instance of the PanoptesPluginManager which recursively searches the directory tree
        and collects all .panoptes-plugin files, loading them into the PanoptesPluginInfo class. The PanoptesPluginInfo
        class contains all metadata associated with a plugin: last execution time, device to run the plugin against
        (if applicable), last results time, key value store, the zookeeper lock, along with a link to the plugin itself.
        The PluginManager uses these provided functions to verify that the plugin should be run. Once verifications
        are complete, a lock is acquired and this function called. The PanoptesMetricsGroupSet (timeseries container)
        object returned is passed to the callback function `_process_metrics_group_set`. The callback function emits
        the provided metrics groups set on to the message bus (Kafka).
        Returns:
            PanoptesMetricsGroupSet: Timeseries Container

            JSON from the PanoptesMetricsGroupSet created in the `populatedMetricsGroupSetWithTimeSeries` function.
        """
        self._plugin_context = context
        self._config = context.config
        self._logger = context.logger
        self._device = context.data
        self._execute_frequency = int(context.config['main']['execute_frequency'])

        self._logger.info("Running {} against {}".format(type(self).__name__, self._device))

        start_time = time.time()
        self.populateMetricsGroupSetWithTimeSeries()
        end_time = time.time()

        self._logger.info(
            "{} ran against device {} in {:.2f} seconds, {} metrics produced".format(
                type(self).__name__, self._device, end_time - start_time, len(self._panoptes_metrics_group_set))
        )

        return self._panoptes_metrics_group_set
        
```

For the docker container to run this plugin. Please follow the steps outlined below. 

2. From inside the container, add a `resource` for the plugin to run against.

    - `nano /home/panoptes/conf/localhost.json` and add the additional device shown below.
    
    
```json
{
    "resource_plugin": "plugin_discovery_from_json_file",
    "resource_site": "local",
    "resource_class": "system",
    "resource_subclass": "host",
    "resource_type": "generic",
    "resource_id": "tutorial_device",
    "resource_endpoint": "localhost",
    "resource_creation_timestamp": "1512629517.03121",
    "resource_metadata": {
        "_resource_ttl": "900"
    }
}
```
(ctrl-x to exit)

When finished the file should look like this.

    root@dbe423716f34:/home/panoptes/conf# cat localhost.json 
    [
        {
            "resource_plugin": "plugin_discovery_from_json_file",
            "resource_site": "local",
            "resource_class": "system",
            "resource_subclass": "host",
            "resource_type": "generic",
            "resource_id": "localhost",
            "resource_endpoint": "localhost",
            "resource_creation_timestamp": "1512629517.03121",
            "resource_metadata": {
            "_resource_ttl": "900"
            }
        },
        {
            "resource_plugin": "plugin_discovery_from_json_file",
            "resource_site": "local",
            "resource_class": "tutorial",
            "resource_subclass": "host",
            "resource_type": "generic",
            "resource_id": "tutorial_device",
            "resource_endpoint": "localhost",
            "resource_creation_timestamp": "1512629517.03121",
            "resource_metadata": {
            "_resource_ttl": "900"
            }
        }
    ]

The next time the discovery plugin runs (60 second interval), this resource will be discovered and added to the internal device store.

To verify it this is the case you do either of the following.

i) Check redis with `echo "keys *panoptes:resource_manager_kv*" | /usr/bin/redis-cli` look for the `id|tutorial_device`
        
        [ Inside The Container ]
        root@dbe423716f34:/home/panoptes# echo "keys *panoptes:resource_manager_kv*" | /usr/bin/redis-cli
        "panoptes:resource_manager_kv:resource:plugin|plugin_discovery_from_json_file|site|local|class|tutorial|subclass|host|type|generic|id|tutorial_device|endpoint|localhost"
        "panoptes:resource_manager_kv:resource:plugin|plugin_discovery_from_json_file|site|local|class|system|subclass|host|type|generic|id|localhost|endpoint|localhost"
        
   
            
ii) Tail the discovery plugin agent logs and verify that the logged number of devices discovered increased (2 members).
        
        [ Inside The Container ]
        tail -f /home/panoptes/logs/discovery_plugin_agent.log
        [INFO] [runner] [info():76] [PID:629 TID:140015174395712] [From JSON File Discovery Plugin] Plugin returned a result set with 2 members
        

3. Copy the following .panoptes-plugin file into tutorial_plugin.panoptes-plugin.example and rename it to remove the '.example' suffix. Remember the scheduler recursively scans the directories for all files which end with '.panoptes-plugin', if it doesn't match it's ignored.
    
    ```sh
    [Core]
    Name = Tutorial Plugin
    Module = /home/panoptes_v/lib/python3.6/site-packages/yahoo_panoptes/plugins/polling/mounted/tutorial_plugin.py

    [Documentation]
    Author = <Your Name>
    Version = 0.1
    Website = github.com/<you>
    Description = This is a tutorial plugin

    [main]
    execute_frequency = 60
    resource_filter = resource_id = "tutorial_device"
    namespace = metrics
    ```

4. The next time the scheduler runs it will pick up the 'tutorial_plugin.panoptes-plugin' file and execute the plugin. However, this plugin will produce an empty set `{}`. This is because no time series data is ever added to the PanoptesMetricsGroupSet. 

5. Extend the functionality of the plugin by implementing the populatedMetricsGroupSetWithTimeSeries() function. 

```python3
def populatedMetricsGroupSetWithTimeSeries(self) -> None:
    panoptes_metrics_group = PanoptesMetricsGroup(self._device, 'example', self._execute_frequency)
    self._panoptes_metrics_group_set.add(panoptes_metrics_group)
```

Those two additional lines will cause the plugin to produce the output shown below.

```json
{
    "metrics_group_type": "example",
    "metrics_group_interval": 60,
    "metrics_group_creation_timestamp": 1580339222.678,
    "metrics_group_schema_version": "0.2",
    "resource": {
        "resource_site": "test_site",
        "resource_class": "test_class",
        "resource_subclass": "test_subclass",
        "resource_type": "test_type",
        "resource_id": "tutorial_device",
        "resource_endpoint": "test_endpoint",
        "resource_metadata": {
            "_resource_ttl": "604800"
        },
        "resource_creation_timestamp": 1580339222.6764865,
        "resource_plugin": "test_plugin"
    },
    "metrics": [],
    "dimensions": []
}
```

To see the output of the plugin, add the following code to the end of the run() function right before the _panoptes_metrics_group_set is returned.


```python3
for panoptes_metrics_group in self._panoptes_metrics_group_set:
    self._logger.info(panoptes_metrics_group.json)
```

Logs are routed to the polling_plugins.log file. To see the results open up a new terminal, exec into the panoptes_docker container and tail the log file.

```
tail -f /home/panoptes/logs/polling_plugins.log
```


This is a great start, but there still isn't any meaningful information stored within the MetricsGroup. Extend the populateMetricsGroupSetWithTimeSeries function and add data.

```python
def populateMetricsGroupSetWithTimeSeries(self) -> None:
    panoptes_metrics_group = PanoptesMetricsGroup(self._device, 'example', self._execute_frequency)
    dimension = PanoptesMetricDimension('cpu_no', '5')
    panoptes_metrics_group.add_dimension(dimension)

    counter = PanoptesMetric('context_switch_count', 50, PanoptesMetricType.COUNTER)
    gauge = PanoptesMetric('cpu_load', .3, PanoptesMetricType.GAUGE)
    panoptes_metrics_group.add_metric(counter)
    panoptes_metrics_group.add_metric(gauge)

    self._panoptes_metrics_group_set.add(panoptes_metrics_group)
```

The plugin now returns the time series shown below.
```
{
    "metrics_group_type": "example",
    "metrics_group_interval": 60,
    "metrics_group_creation_timestamp": 1580339222.678,
    "metrics_group_schema_version": "0.2",
    "resource": {
        "resource_site": "test_site",
        "resource_class": "test_class",
        "resource_subclass": "test_subclass",
        "resource_type": "test_type",
        "resource_id": "tutorial_device",
        "resource_endpoint": "test_endpoint",
        "resource_metadata": {
            "_resource_ttl": "604800"
        },
        "resource_creation_timestamp": 1580339222.6764865,
        "resource_plugin": "test_plugin"
    },
    "metrics": [
        {
            "metric_creation_timestamp": 1580339222.681,
            "metric_name": "cpu_load",
            "metric_value": 0.3,
            "metric_type": "gauge"
        },
        {
            "metric_creation_timestamp": 1580339222.68,
            "metric_name": "context_switch_count",
            "metric_value": 50,
            "metric_type": "counter"
        }
    ],
    "dimensions": [
        {
            "dimension_name": "cpu_no",
            "dimension_value": "5"
        }
    ]
}
```

The plugin's callback function will place the output shown above on the message queue. This will be consumed by the downstream InfluxDB consumer.
The data is immediately graphable on Grafana.

![Grafana Image](https://user-images.githubusercontent.com/29840907/73494691-e4c87600-43ac-11ea-8adb-4316ba63aeab.png)

You have now finished writing a basic Panoptes polling plugin, below are additional tips.

Panoptes has built in support for counter / rate transformations. In order to tell the plugin runner to perform the transformations, add a [transforms] key to the .panoptes-plugins and under it, add the metric names in the following format: `<metrics_group_type> = rate:<resulting_metrics_group_type>:<COUNTERNAMES>`. For the example above, it would be `example = rate:example:context_switch_count`.


```sh
[Core]
Name = Tutorial Plugin
Module = /home/panoptes_v/lib/python3.6/site-packages/yahoo_panoptes/plugins/polling/tutorial_plugin/tutorial_polling_plugin.py

[Documentation]
Author = <Your Name>
Version = 0.1
Website = github.com/<you>
Description = This is a tutorial plugin

[main]
execute_frequency = 60
resource_filter = resource_id = "tutorial_device"
namespace = metrics

[transforms]
example = rate:example:context_switch_count

```

Plugins can do anything a python function and class can do. While Panoptes was built for the purpose of network monitoring, its applicable scope isn't limited there. 

If you would like to extend your plugin to make an API call you can add the skeleton code below inside the plugin.

```python
import requests
def makeAPICall(self) -> Any:
        try:
            response = requests.get('API Endpoint')
            response.raise_for_status()
        except (HTTPError, Timeout, ConnectionError):
            return 10000

        return response.<data>
        
def populateMetricsGroupSetWithTimeSeries(self) -> None:
        api_call_metrics_group = PanoptesMetricsGroup(self._device, 'panoptes_api_test', self._execute_frequency)
        bitcoin_price_metrics_group.add_dimension(PanoptesMetricDimension('call', 'first'))  # (self, name, value)
        bitcoin_price_metrics_group.add_metric(PanoptesMetric('api_data', self.makeAPICall(),
                                                              PanoptesMetricType.GAUGE))
        self._panoptes_metrics_group_set.add(api_call_metrics_group)
```
    
    