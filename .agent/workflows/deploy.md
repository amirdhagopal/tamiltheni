---
description: Format code, run all checks, and deploy to GitHub
---

1. Format the code to ensure style consistency.
   `npm run format`

2. Run the comprehensive check suite (Lint, Test, Build).
   // turbo
   `npm run check-all`

3. If the checks pass, stage all changes.
   `git add .`

4. Generate a concise and descriptive commit message based on the recent changes.
   `git commit -m "<generated_message>"`

5. Push the changes to the remote repository.
   `git push origin HEAD`
