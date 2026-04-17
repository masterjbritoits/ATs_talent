// Bicep module: Azure Database for PostgreSQL Flexible Server

@description('Azure region')
param location string = resourceGroup().location

@description('Environment: dev | staging | prod')
param env string = 'prod'

@description('PostgreSQL admin username')
param adminUser string = 'atsadmin'

@secure()
@description('PostgreSQL admin password')
param adminPassword string

@description('SKU name')
param skuName string = 'Standard_D2ds_v4'

@description('PostgreSQL major version')
param version string = '16'

var serverName = 'pg-ats-${env}'
var dbName = 'atsdb'

resource pgServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-06-01-preview' = {
  name: serverName
  location: location
  sku: {
    name: skuName
    tier: 'GeneralPurpose'
  }
  properties: {
    version: version
    administratorLogin: adminUser
    administratorLoginPassword: adminPassword
    storage: {
      storageSizeGB: 32
      autoGrow: 'Enabled'
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
    authConfig: {
      activeDirectoryAuth: 'Enabled'
      passwordAuth: 'Enabled'
    }
  }
}

resource pgDb 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-06-01-preview' = {
  name: dbName
  parent: pgServer
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

output serverFqdn string = pgServer.properties.fullyQualifiedDomainName
output databaseName string = pgDb.name
