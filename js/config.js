/* ==========================================================================
   Site configuration — the ONLY file you need to edit to connect data sources.

   NEWS_CSV_URL / TEAM_CSV_URL / PROJECTS_CSV_URL
     CSV export link of the Google Sheet (the sheet must be shared as
     "Anyone with the link → Viewer"). Format:
       https://docs.google.com/spreadsheets/d/<SHEET_ID>/export?format=csv
     Add &gid=<TAB_ID> if the data is not on the first tab.
     Leave as "" to use the local sample files in data/ (useful for previews).

   ORCID_ID
     Publications are fetched live from ORCID. Nothing else to maintain.
   ========================================================================== */

window.SITE_CONFIG = {
  NEWS_CSV_URL: "https://docs.google.com/spreadsheets/d/1_nqWBsD7XeLpJ_eqm1PBBtPH2Y-am0o41axTltJBQiE/export?format=csv&gid=435193556",
  TEAM_CSV_URL: "https://docs.google.com/spreadsheets/d/1fkD6DYenQXB1iWBPmMnFbkzwvTQkwlECpPXvULxx5Kg/export?format=csv&gid=990698655",
  PROJECTS_CSV_URL: "",
  ORCID_ID: "0000-0002-0333-639X",
};
