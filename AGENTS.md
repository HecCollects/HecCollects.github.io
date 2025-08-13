# Agent Instructions

All binary assets must be stored in text form (e.g., base64 `.b64` files) and decoded during build or deployment. Do **not** commit decoded binaries to the repository.

Use the provided build scripts to decode assets before running tests or serving the site.
