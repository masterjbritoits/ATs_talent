// Bicep main orchestration — deploys all ATs Talent infrastructure
// Usage:
//   az group create -n rg-ats-prod -l westeurope
//   az deployment group create -g rg-ats-prod -f infra/main.bicep \
//     -p env=prod adminPassword=<secret>

targetScope = 'resourceGroup'

@description('Environment: dev | staging | prod')
param env string = 'prod'

@description('Azure region (default: resource group location)')
param location string = resourceGroup().location

@description('PostgreSQL admin password')
@secure()
param adminPassword string

@description('Key Vault name (created separately or pre-existing)')
param keyVaultName string = 'kv-ats-${env}'

// ── Modules ───────────────────────────────────────────────────────────────────
module postgres 'postgres.bicep' = {
  name: 'postgres'
  params: {
    location: location
    env: env
    adminPassword: adminPassword
  }
}

module storage 'storage.bicep' = {
  name: 'storage'
  params: {
    location: location
    env: env
  }
}

module serviceBus 'service-bus.bicep' = {
  name: 'serviceBus'
  params: {
    location: location
    env: env
  }
}

module appService 'app-service.bicep' = {
  name: 'appService'
  params: {
    location: location
    env: env
    keyVaultName: keyVaultName
  }
  dependsOn: [postgres, storage, serviceBus]
}

// ── Outputs ───────────────────────────────────────────────────────────────────
output appServiceHostname string = appService.outputs.appServiceHostname
output postgresHost string = postgres.outputs.serverFqdn
output storageAccountName string = storage.outputs.storageAccountName
output serviceBusNamespace string = serviceBus.outputs.namespaceHostname
