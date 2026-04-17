// Bicep module: Azure Storage Account + Blob containers

@description('Azure region')
param location string = resourceGroup().location

@description('Environment: dev | staging | prod')
param env string = 'prod'

var storageAccountName = 'stats${env}${uniqueString(resourceGroup().id)}'

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
    publicNetworkAccess: 'Enabled' // restrict to VNet in prod
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  name: 'default'
  parent: storageAccount
}

// ── Blob containers (mirrors CONTAINER_MAP in lib/storage/blob-client.ts) ────
var containers = [
  'raw-emails'
  'attachments'
  'processed'
  'ocr'
  'exports'
  'temp'
]

resource blobContainers 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = [
  for name in containers: {
    name: name
    parent: blobService
    properties: {
      publicAccess: 'None'
    }
  }
]

output storageAccountName string = storageAccount.name
output storageAccountId string = storageAccount.id
