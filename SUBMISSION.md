# Skillpath Submission

## Published Framer link

https://frank-way-219411.framer.app

## Code

https://github.com/yashbudhia/skillpath-framer-assignment/blob/main/SkillpathCourses.tsx

## Short note

With two more days, I would add deterministic component tests with mocked course and country responses, cover every independent failure combination, and run a deeper accessibility pass across browsers. The hardest decision was the country-failure fallback: when courses load but location does not, the component keeps the useful content visible and shows both correctly converted INR and USD prices with a clear notice. I am least happy that the intentionally flaky production API makes the empty state difficult to trigger predictably during manual review, even though the branch is implemented. I would also replace the remaining template navigation with a smaller, purpose-built Skillpath menu.

## AI used

OpenAI Codex in ChatGPT.

Codex drafted the React code component, implemented the API and error-state logic, helped adapt the Framer design, and automated verification, publication, and repository setup. I directed the visual revisions, reviewed the output in Framer and published screenshots, and requested corrections. I understand that I must be able to explain every submitted line.

## Actual AI conversation

PENDING: Add the public URL generated from this conversation's Share control. It should look like `https://chatgpt.com/share/...`.