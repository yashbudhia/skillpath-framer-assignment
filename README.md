# Skillpath — Framer Junior Developer Assignment

Skillpath is a responsive Framer landing page for a fictional learning platform. Its course catalogue is a React code component that loads live, intentionally flaky API data and presents deliberate loading, error, empty, and success states.

## Submission links

- Published Framer site: https://frank-way-219411.framer.app
- Code component: [SkillpathCourses.tsx](./SkillpathCourses.tsx)
- Submission note and AI disclosure: [SUBMISSION.md](./SUBMISSION.md)
- AI conversation: pending the user-generated public Share URL

## What the component covers

- GET-only requests to both assignment endpoints
- Independent course and country request handling with `Promise.allSettled`
- Correct paise/cents conversion and locale-aware INR/USD formatting
- Safe fallback showing both currencies when only country detection fails
- Loading skeletons, friendly error state, retry, and zero-results handling
- Dynamic course arrays with no hardcoded course records
- Three-column desktop, two-column tablet, and one-column phone grid
- Search, price sorting, and conditional refundable badges
- Exactly two Framer property controls: section title and accent color

## API

- https://syncsphere-hiv6.onrender.com/assignment/course-data
- https://syncsphere-hiv6.onrender.com/assignment/country-code

## Media

The classroom video and poster are sourced from Pexels. See [SOURCES.md](./SOURCES.md).

## Framer usage

Create a new code file in Framer, paste in `SkillpathCourses.tsx`, and place the default export on the canvas. Framer supplies React and the `framer` package.

## Current status

The website and repository are public. The only remaining submission item is the actual public share link for the AI conversation; it must be generated from the conversation's Share control and then added to `SUBMISSION.md`.