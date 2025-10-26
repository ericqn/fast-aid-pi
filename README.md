## Fast Aid PI

Bridging the gap between patients and doctors through AI-powered prediagnosis and communication. Various features to help prediagnose patients, offer solutions, refer to specialists and relevant practitioners, alongside features to help doctors provide care more efficiently.

## Features:

- Secure authentication and role-based access
- AI chatbot for prediagnosis and patient reassurance
- Prediagnosis Feature: Analyzes questionnaire then offers action plan, recommended practitioners, and health support.
- Persistent chat and prediagnosis records
- Patients can add relevant recommended doctors to their conversations and prediagnoses.

## Tech Stack:

- Frontend: Typescript, React, Tailwind, ESLint, Anthropic
- Backend: Python, FastAPI, uvicorn, SQLAlchemy, Anthropic, pyjwt, passlib, 

## Getting Started:

Backend: Uses uv to handle packages.

```
$ cd fast-aid-pi/server
$ uv install
$ uv run server.py
```

Server should be running on http://localhost:8000

---

Frontend: Packages managed by npm.

```
$ cd fast-aid-pi/server
$ npm install
$ npm run dev
```

Frontend components should be running and visible on http://localhost:3000

## Next Steps:

- Allow doctors to edit and highlight patient summaries
- Enable cross-specialist communication for holistic treatment
- Add patient history integration for more accurate prediagnoses
- Improve encryption and compliance
- Train a custom ML model for prediagnosis instead of relying on an LLM