---
id: starter-napalm-plugin
title: Starter Napalm Plugin
sidebar_label: Starter Napalm Plugin
---

A basic Panoptes polling plugin that uses napalm is shown below.

### napalm_polling_plugin.py
```python
from typing import Dict, Any
import time
import napalm
from yahoo_panoptes.polling.polling_plugin import PanoptesPollingPlugin
from yahoo_panoptes.framework.metrics import PanoptesMetricsGroupSet, PanoptesMetricsGroup, \
    PanoptesMetric, PanoptesMetricType, PanoptesMetricDimension
from yahoo_panoptes.framework.plugins.context import PanoptesPluginContext
from yahoo_panoptes.framework.resources import PanoptesResource


class IOSXRNapalmPollingPlugin(PanoptesPollingPlugin):
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
        self.iosxr_driver = napalm.get_network_driver('iosxr')
        self.napalm_device_connection = None
        super(IOSXRNapalmPollingPlugin, self).__init__()

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
        boolean_conversion = {
            False: 0,
            True: 1
        }

        for interface, object in self.napalm_device_connection.get_interfaces().items():
            panoptes_metrics_group = PanoptesMetricsGroup(self._device, 'napalm_interface', self._execute_frequency)

            panoptes_metrics_group.add_dimension(PanoptesMetricDimension('interface_name', interface))
            panoptes_metrics_group.add_dimension(PanoptesMetricDimension('mac_address', object['mac_address'] or 'no_mac_address'))
            panoptes_metrics_group.add_dimension(PanoptesMetricDimension('description', object['description'] or 'no_device_description'))

            panoptes_metrics_group.add_metric(
                PanoptesMetric('is_enabled', boolean_conversion[object['is_enabled']], PanoptesMetricType.GAUGE))
            panoptes_metrics_group.add_metric(
                PanoptesMetric('is_up', boolean_conversion[object['is_up']], PanoptesMetricType.GAUGE))

            self._panoptes_metrics_group_set.add(panoptes_metrics_group)

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

        self.napalm_device_connection = self.iosxr_driver(
            hostname=self._device.resource_endpoint,
            username=context.config['napalm']['username'],
            password=context.config['napalm']['password']
        )

        self.napalm_device_connection.open()

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

### napalm_polling_plugin.panoptes-plugin file
```sb
[Core]
Name = <Napalm Plugin>
Module = <Path Here>
[Documentation]
Author = <Your Name>
Version = 0.1
Website = github.com/<you>
Description = This is a tutorial plugin

[main]
execute_frequency = 60
resource_filter = <add filter here>
namespace = metrics

[napalm]
username = # Device Username (For the sake of the tutorial. In production secrets are stored elsewhere.)
password = # Device Password DON'T DO THIS IN PROD. Create a class which inherits from the PanoptesKeyValueStore to store secrets in.
```

Don't forget to "discover" the device by updating /home/panoptes/conf/localhost.json
```json
{
    "resource_plugin": "plugin_discovery_from_json_file",
    "resource_site": "local",
    "resource_class": "tutorial",
    "resource_subclass": "host",
    "resource_type": "generic",
    "resource_id": "iosxr.test.<>.com",
    "resource_endpoint": "iosxr.test.<>.com",
    "resource_creation_timestamp": "1512629517.03121",
    "resource_metadata": {
      "_resource_ttl": "900"
    }
  }
  ```

Resulting Time Series
```json
{
    "metrics_group_type": "napalm_interface",
    "metrics_group_interval": 60,
    "metrics_group_creation_timestamp": 1580494576.694,
    "metrics_group_schema_version": "0.2",
    "resource": {
        "resource_site": "local",
        "resource_class": "tutorial",
        "resource_subclass": "host",
        "resource_type": "generic",
        "resource_id": "iosxr.test.<>.com",
        "resource_endpoint": "iosxr.test.<>.com",
        "resource_metadata": {
            "_resource_ttl": "900"
        },
        "resource_creation_timestamp": 1512629517.03,
        "resource_plugin": "plugin_discovery_from_json_file"
    },
    "metrics": [
        {
            "metric_creation_timestamp": 1580494576.694,
            "metric_name": "is_up",
            "metric_value": 0,
            "metric_type": "gauge"
        },
        {
            "metric_creation_timestamp": 1580494576.694,
            "metric_name": "is_enabled",
            "metric_value": 0,
            "metric_type": "gauge"
        }
    ],
    "dimensions": [
        {
            "dimension_name": "mac_address",
            "dimension_value": "92:99:00:07:00:04"
        },
        {
            "dimension_name": "interface_name",
            "dimension_value": "GigabitEthernet0/0/0/4"
        },
        {
            "dimension_name": "description",
            "dimension_value": "empty_description"
        }
    ]
}

{
    "metrics_group_type": "napalm_interface",
    "metrics_group_interval": 60,
    "metrics_group_creation_timestamp": 1580494576.695,
    "metrics_group_schema_version": "0.2",
    "resource": {
        "resource_site": "local",
        "resource_class": "tutorial",
        "resource_subclass": "host",
        "resource_type": "generic",
        "resource_id": "iosxr.test.<>.com",
        "resource_endpoint": "iosxr.test.<>.com",
        "resource_metadata": {
            "_resource_ttl": "900"
        },
        "resource_creation_timestamp": 1512629517.03,
        "resource_plugin": "plugin_discovery_from_json_file"
    },
    "metrics": [
        {
            "metric_creation_timestamp": 1580494576.696,
            "metric_name": "is_enabled",
            "metric_value": 1,
            "metric_type": "gauge"
        },
        {
            "metric_creation_timestamp": 1580494576.696,
            "metric_name": "is_up",
            "metric_value": 1,
            "metric_type": "gauge"
        }
    ],
    "dimensions": [
        {
            "dimension_name": "interface_name",
            "dimension_value": "Null0"
        },
        {
            "dimension_name": "mac_address",
            "dimension_value": "no_mac_address"
        },
        {
            "dimension_name": "description",
            "dimension_value": "empty_description"
        }
    ]
}
{
    "metrics_group_type": "napalm_interface",
    "metrics_group_interval": 60,
    "metrics_group_creation_timestamp": 1580494576.695,
    "metrics_group_schema_version": "0.2",
    "resource": {
        "resource_site": "local",
        "resource_class": "tutorial",
        "resource_subclass": "host",
        "resource_type": "generic",
        "resource_id": "iosxr.test.<>.com",
        "resource_endpoint": "iosxr.test.<>.com",
        "resource_metadata": {
            "_resource_ttl": "900"
        },
        "resource_creation_timestamp": 1512629517.03,
        "resource_plugin": "plugin_discovery_from_json_file"
    },
    "metrics": [
        {
            "metric_creation_timestamp": 1580494576.695,
            "metric_name": "is_up",
            "metric_value": 0,
            "metric_type": "gauge"
        },
        {
            "metric_creation_timestamp": 1580494576.695,
            "metric_name": "is_enabled",
            "metric_value": 0,
            "metric_type": "gauge"
        }
    ],
    "dimensions": [
        {
            "dimension_name": "mac_address",
            "dimension_value": "92:99:00:07:00:08"
        },
        {
            "dimension_name": "interface_name",
            "dimension_value": "GigabitEthernet0/0/0/8"
        },
        {
            "dimension_name": "description",
            "dimension_value": "empty_description"
        }
    ]
}
```