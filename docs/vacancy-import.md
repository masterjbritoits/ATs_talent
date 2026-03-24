# Vacancy Import

## Sources
- Manual API creation
- JSON import
- Controlled scraper/import extension point

## Current MVP Behavior
- Reads structured JSON records
- Updates existing jobs by title + location match
- Creates missing jobs
- Logs runs in `ImportRun`

## Sample Command
`npm.cmd run jobs:import -- public/sample-jobs.json`
