---
id: starter-snmp-plugin
title: Starter SNMP Plugin
sidebar_label: Starter SNMP Plugin
---

### Writing your first SNMP Polling Plugin.

If you've been exploring the Panoptes code base, then you have most likely come across the PanoptesSNMPBasePlugin. Every SNMP plugin inherits from this class.
It automatically provides the inheriting class with the correct SNMP handle (V2, V3, Yahoo Steamroller Proxy), error handling, and hooks + logging to run the plugin.
If inheriting from the PanoptesSNMPBasePlugin, the user only needs to implement the get_results() -> PanoptesMetricsGroupSet function; everything else is taken care of by hidden function calls. While this is great,it has a steeper learning curve for individuals new to Panoptes who are looking to write their first SNMP Plugin. The SandboxSNMPPollingPlugin provides new plugin authors a basic skeleton that they can use to hit the ground running. This skeleton is executable in a dev environment for test
 and development. Instructions are provided below to transform it into a runnable plugin.


#### sandbox_snmp_polling_plugin.py
```python3
from yahoo_panoptes.framework.utilities.snmp.connection import PanoptesSNMPV2Connection
from typing import Dict, Any
from yahoo_panoptes.polling.polling_plugin import PanoptesPollingPlugin
from yahoo_panoptes.framework.metrics import PanoptesMetricsGroupSet, PanoptesMetricsGroup, \
    PanoptesMetric, PanoptesMetricType, PanoptesMetricDimension
from yahoo_panoptes.framework.plugins.context import PanoptesPluginContext
from yahoo_panoptes.framework.plugins.base_snmp_plugin import PanoptesSNMPBasePlugin
from yahoo_panoptes.framework.resources import PanoptesResource

# OID Definitions http://cric.grenoble.cnrs.fr/Administrateurs/Outils/MIBS/?oid=1.3.6.1.2.1.31.1.1.1
ifXTable = '.1.3.6.1.2.1.31.1.1.1'
ifName = ifXTable + '.1'
ifHCInUcastPkts = ifXTable + '.7'
ifHCOutUcastPkts = ifXTable + '.11'
ifSpeed = ifXTable + '.15'
ifAlias = ifXTable + '.18'


class SandboxSNMPPollingPlugin:

    def __init__(self):
        # Default SNMPv2 Connection - Wrapper over EasySNMP.
        self._snmp_connection: PanoptesSNMPV2Connection = None

        self._interface_table = {} # {[oid.index]: {[oid.name]: [oid.value]}

        # Panoptes Time Series Container
        self._panoptes_metrics_group_set: PanoptesMetricsGroupSet = PanoptesMetricsGroupSet()


    def queryAndPopulateInterfaceTable(self, oid, name) -> None:
        """
        oid: str - oid to query,
        name: str - name of the oid to query. Used to store the value the index maps to
        """
        varbinds = self._snmp_connection.bulk_walk(oid)
        for var in varbinds:
            if var.index not in self._interface_table:
                self._interface_table[var.index] = {}

            self._interface_table[var.index][name] = var.value

    def buildInterfaceTable(self) -> None:
        """
        Builds the `interface_table` which is then converted into Panoptes time series.
        """
        self.queryAndPopulateInterfaceTable(ifName, 'interface_name')
        self.queryAndPopulateInterfaceTable(ifHCInUcastPkts, 'interface_unicast_pkt_in')
        self.queryAndPopulateInterfaceTable(ifHCOutUcastPkts, 'interface_unicast_pkt_out')
        self.queryAndPopulateInterfaceTable(ifSpeed, 'interface_speed')
        self.queryAndPopulateInterfaceTable(ifAlias, 'interface_alias')

    def populatedMetricsGroupSetWithTimeSeries(self) -> None:
        """
        Converts the `interface_table` into Panoptes time series, which will be
        ingested downstream and stored in a time series database.

        The text below shows the structure of how time series data is stored within the PanoptesMetricsGroupSet.
        
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
        """
        for index, data in self._interface_table.items():

            # In the next iteration a PanoptesResource won't have to be  passed this way to the PanoptesMetricsGroup.
            # This will be substituted with a real resource, once the plugin is moved out of sandbox mode.
            panoptes_metrics_group = PanoptesMetricsGroup(PanoptesResource(resource_site='test',
                                                                           resource_class='test',
                                                                           resource_subclass='test',
                                                                           resource_type='test',
                                                                           resource_id='test',
                                                                           resource_endpoint='test',
                                                                           resource_plugin='test'),
                                                          'interface_data', 60)

            panoptes_metrics_group.add_dimension(
                PanoptesMetricDimension('interface_name', data['interface_name']))
            panoptes_metrics_group.add_dimension(
                PanoptesMetricDimension('interface_alias', data['interface_alias'] or 'no_alias'))
            panoptes_metrics_group.add_metric(
                PanoptesMetric('interface_speed', int(data['interface_speed']), PanoptesMetricType.GAUGE))
            panoptes_metrics_group.add_metric(
                PanoptesMetric('interface_unicast_pkt_in', int(data['interface_unicast_pkt_in']), PanoptesMetricType.COUNTER))
            panoptes_metrics_group.add_metric(
                PanoptesMetric('interface_unicast_pkt_out', int(data['interface_unicast_pkt_out']), PanoptesMetricType.COUNTER))

            self._panoptes_metrics_group_set.add(panoptes_metrics_group)


    def run(self) -> PanoptesMetricsGroupSet:

        self._snmp_connection = PanoptesSNMPV2Connection(host='<put-host-here>',
                                                         port=161,
                                                         timeout=20,
                                                         retries=2,
                                                         community='<fill me in>')

        self.buildInterfaceTable()
        self.populatedMetricsGroupSetWithTimeSeries()

        return self._panoptes_metrics_group_set
```

Run the plugin locally and verify the output is what is expected.

```python3
sandbox_polling_plugin = SandboxSNMPPollingPlugin()

results = sandbox_polling_plugin.run()

for timeseries in results:
    print(timeseries.json)
```

When a plugin's run() method is called it is passed a PanoptesContext object. The PanoptesContext holds connections to kafka, zookeeper, redis, along with device information of which the device is to be run against.
The following changes are needed to make this plugin 'runnable' are:
 1. It must inherit from PanoptesPollingPlugin - plugins are ignored in the loading process if they aren't a subclass.
 2. The PanoptesSNMPConnection must use the host contained within the PanoptesPluginContext passed to the run() function
 3. Logging must be added to the run method.
 4. The SandboxSNMPPollingPlugin must update instance variables set to none by accessing various properties PanoptesPluginContext object passed to run()
 5. The .panoptes-plugin file must be added.


```python3
class SandboxSNMPPollingPlugin(PanoptesPollingPlugin): #1 Inherit
    """
    SandboxSNMPPollingPlugin
    """

    def __init__(self):
        # Default SNMPv2 Connection - Wrapper over EasySNMP.
        self._snmp_connection: PanoptesSNMPV2Connection = None
        self._plugin_context: PanoptesPluginContext = None
        self._config: Dict[str, Any] = {}
        self._panoptes_metrics_group_set: PanoptesMetricsGroupSet = PanoptesMetricsGroupSet()
        self._interface_table: Dict[str, Dict[str, str]] = {} # {[oid.index]: {[oid.name]: [oid.value]}
        self._device: PanoptesResource = None
        self._execute_frequency: int = 60
        self._logger = None

        super(SandboxSNMPPollingPlugin, self).__init__()


    def queryAndPopulateInterfaceTable(self, oid, name) -> None:
        """
        oid: str - oid to query,
        name: str - name of the oid to query. Used to store the value the index maps to
        """
        varbinds = self._snmp_connection.bulk_walk(oid)
        for var in varbinds:
            if var.index not in self._interface_table:
                self._interface_table[var.index] = {}

            self._interface_table[var.index][name] = var.value

    def buildInterfaceTable(self) -> None:
        """
        Builds the `interface_table` which is then converted into Panoptes time series.
        """
        self.queryAndPopulateInterfaceTable(ifName, 'interface_name')
        self.queryAndPopulateInterfaceTable(ifHCInUcastPkts, 'interface_unicast_pkt_in')
        self.queryAndPopulateInterfaceTable(ifHCOutUcastPkts, 'interface_unicast_pkt_out')
        self.queryAndPopulateInterfaceTable(ifSpeed, 'interface_speed')
        self.queryAndPopulateInterfaceTable(ifAlias, 'interface_alias')

    def populateMetricsGroupSetWithTimeSeries(self):
        """
        Converts the `interface_table` into Panoptes time series, which will be
        ingested downstream and stored in a time series database.

        The text below shows the structure of how time series data is stored within the PanoptesMetricsGroupSet.

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

        """
        for index, data in self._interface_table.items():

            # 2. Pass the resource here along with the execution frequency (provided to run() inside of the panoptes_context)
            panoptes_metrics_group = PanoptesMetricsGroup(self._device, 'interface_data', self._execute_frequency) 

            panoptes_metrics_group.add_dimension(
                PanoptesMetricDimension('interface_name', data['interface_name']))
            panoptes_metrics_group.add_dimension(
                PanoptesMetricDimension('interface_alias', data['interface_alias'] or 'no_alias'))
            panoptes_metrics_group.add_metric(
                PanoptesMetric('interface_speed', int(data['interface_speed']), PanoptesMetricType.GAUGE))
            panoptes_metrics_group.add_metric(
                PanoptesMetric('interface_unicast_pkt_in', int(data['interface_unicast_pkt_in']), PanoptesMetricType.COUNTER))
            panoptes_metrics_group.add_metric(
                PanoptesMetric('interface_unicast_pkt_out', int(data['interface_unicast_pkt_out']), PanoptesMetricType.COUNTER))

            self._panoptes_metrics_group_set.add(panoptes_metrics_group)


    def run(self, context: PanoptesPluginContext) -> PanoptesMetricsGroupSet:
        # 4) Update instance variables using the PanoptesPluginContext properties.
        self._plugin_context = context
        self._config = context.config
        self._logger = context.logger
        self._device = context.data
        self._execute_frequency = int(context.config['main']['execute_frequency']) # Set the execution frequency
        self._snmp_connection = PanoptesSNMPV2Connection(host=self._device.resource_endpoint, # 2. Use device info from the panoptes context passed to run()
                                                         port=161,
                                                         timeout=20,
                                                         retries=2,
                                                         community='<fill me in>')
        self._logger.info("Running {} against {}".format(type(self).__name__, self._device))

        start_time = time.time()
        self.buildInterfaceTable()
        self.populateMetricsGroupSetWithTimeSeries()
        end_time = time.time()

        self._logger.info(
            "{} ran against device {} in {:.2f} seconds, {} metrics produced".format(
                type(self).__name__, self._device, end_time - start_time, len(self._panoptes_metrics_group_set))
        ) # 3). Add logging.

        return self._panoptes_metrics_group_set
```

5. .panoptes-plugin file

```
[Core]
Name = Sandbox SNMP Polling Plugin
Module = /home/panoptes_v/lib/python3.6/site-packages/yahoo_panoptes/plugins/polling/sandbox_plugin/sandbox_snmp_polling_plugin.py

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
interface_data = rate:interface_data:interface_unicast_pkt_in,interface_unicast_pkt_out
```

Great! You have written and converted your first SNMP Panoptes Polling Plugin. 


Resulting time series data after transformations.
```json
{
    "metrics_group_type": "interface_data",
    "metrics_group_interval": 60,
    "metrics_group_creation_timestamp": 1580949986.184,
    "metrics_group_schema_version": "0.2",
    "resource": {
        "resource_site": "test",
        "resource_class": "test",
        "resource_subclass": "test",
        "resource_type": "test",
        "resource_id": "test",
        "resource_endpoint": "test",
        "resource_metadata": {
            "_resource_ttl": "604800"
        },
        "resource_creation_timestamp": 1580949986.184,
        "resource_plugin": "test"
    },
    "metrics": [
        {
            "metric_creation_timestamp": 1580945950.852,
            "metric_name": "interface_unicast_pkt_in",
            "metric_value": 195448,
            "metric_type": "counter"
        },
        {
            "metric_creation_timestamp": 1580949986.185,
            "metric_name": "interface_unicast_pkt_in",
            "metric_value": 1,
            "metric_type": "gauge"
        },
        {
            "metric_creation_timestamp": 1580945950.852,
            "metric_name": "interface_unicast_pkt_out",
            "metric_value": 5477552,
            "metric_type": "counter"
        },
        {
            "metric_creation_timestamp": 1580949986.186,
            "metric_name": "interface_unicast_pkt_out",
            "metric_value": 1,
            "metric_type": "gauge"
        },
        {
            "metric_creation_timestamp": 1580945950.852,
            "metric_name": "interface_speed",
            "metric_value": 1000,
            "metric_type": "gauge"
        }
    ],
    "dimensions": [
        {
            "dimension_name": "interface_alias",
            "dimension_value": "no_alias"
        },
        {
            "dimension_name": "interface_name",
            "dimension_value": "em1"
        }
    ]
}
```

The data shows up immediately and is graphable on Grafana.

<p align="left">
  <img src="https://user-images.githubusercontent.com/29840907/73912210-d9dd7c00-48ab-11ea-9e6e-616008704207.png" width="450" title="Grafana Dashboard">
</p>

