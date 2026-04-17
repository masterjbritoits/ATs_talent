// Bicep module: Azure App Service Plan + Web App
// Usage: az deployment group create -g <rg> -f infra/app-service.bicep -p ...

@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Environment tag: dev | staging | prod')
param env string = 'prod'

@description('App Service Plan SKU')
param sku string = 'P1v3'

@description('Docker/Node version tag used by App Service')
param nodeVersion string = '20-lts'

@description('Key Vault name (must already exist)')
param keyVaultName string

@description('Azure Container Registry login server (optional)')
param acrLoginServer string = ''

var appName = 'ats-talent-${env}'
var planName = 'plan-ats-${env}'

// ── App Service Plan ──────────────────────────────────────────────────────────
resource appPlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: planName
  location: location
  sku: {
    name: sku
    tier: 'PremiumV3'
  }
  properties: {
    reserved: true // Linux
  }
}

// ── Web App ───────────────────────────────────────────────────────────────────
resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: appName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appPlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|${nodeVersion}'
      minTlsVersion: '1.2'
      http20Enabled: true
      alwaysOn: true
      ftpsState: 'Disabled'
      appSettings: [
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~20'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'false'
        }
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'SESSION_SECRET'
          value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=session-secret)'
        }
        {
          name: 'DATABASE_URL'
          value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=database-url)'
        }
        {
          name: 'DIRECT_DATABASE_URL'
          value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=direct-database-url)'
        }
      ]
    }
  }
}

// ── Key Vault access policy for the Web App managed identity ─────────────────
resource kv 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

resource kvAccessPolicy 'Microsoft.KeyVault/vaults/accessPolicies@2023-07-01' = {
  name: 'add'
  parent: kv
  properties: {
    accessPolicies: [
      {
        tenantId: webApp.identity.tenantId
        objectId: webApp.identity.principalId
        permissions: {
          secrets: ['get', 'list']
        }
      }
    ]
  }
}

output appServiceName string = webApp.name
output appServiceHostname string = webApp.properties.defaultHostName
output managedIdentityPrincipalId string = webApp.identity.principalId
