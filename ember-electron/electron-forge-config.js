  module.exports = {
  "make_targets": {
    "win32": [
      "squirrel"
    ],
    "darwin": [
      "zip"
    ],
    "linux": [
      "deb",
      "rpm"
    ]
  },
  "electronPackagerConfig": {
    "platform": "all",
    "packageManager": "npm",
    "executableName": "Aperture",
    "icon": __dirname + "/resources/aperture"
  },
  "electronWinstallerConfig": {
    "name": "aperture_web"
  },
  "electronInstallerDebian": {},
  "electronInstallerRedhat": {},
  "github_repository": {
    "owner": "",
    "name": ""
  },
  "windowsStoreConfig": {
    "packageName": "",
    "name": "apertureapp"
  }
};