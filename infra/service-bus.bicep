// Bicep module: Azure Service Bus namespace + queues

@description('Azure region')
param location string = resourceGroup().location

@description('Environment: dev | staging | prod')
param env string = 'prod'

var namespaceName = 'sb-ats-${env}'

resource sbNamespace 'Microsoft.ServiceBus/namespaces@2022-10-01-preview' = {
  name: namespaceName
  location: location
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
}

// ── Queues (must match QUEUES constants in lib/queue/service-bus.ts) ──────────
var queues = [
  'mailbox-sync'
  'attachment-processing'
  'rescore'
  'export'
  'notification'
]

resource sbQueues 'Microsoft.ServiceBus/namespaces/queues@2022-10-01-preview' = [
  for name in queues: {
    name: name
    parent: sbNamespace
    properties: {
      maxDeliveryCount: 5
      lockDuration: 'PT5M'
      defaultMessageTimeToLive: 'P1D'
      deadLetteringOnMessageExpiration: true
    }
  }
]

output namespaceName string = sbNamespace.name
output namespaceHostname string = '${sbNamespace.name}.servicebus.windows.net'
