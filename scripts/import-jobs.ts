import { importVacancies, readVacanciesFromJson } from "@/server/services/vacancy-import/service";

async function main() {
  const filePath = process.argv[2] ?? "public/sample-jobs.json";
  const records = await readVacanciesFromJson(filePath);
  const result = await importVacancies(records, filePath);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
