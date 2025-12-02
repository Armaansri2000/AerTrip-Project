## How to Run

Clone the project
git clone <repo-url>
cd project-folder


## Install dependencies
npm install


##Start development server
npm run dev

##Build for production
npm run build

## Project Summary
This is a React-based flight search UI built as an assignment.
It includes:

Header with search and recent searches

Flight listing UI

Filters

Local JSON dataset (flights.json)

Airline logos using airlineCode mapping

## Why Airline Logos Were Not Showing Previously

The original flights.json had distorted / inconsistent data, including:

Missing or incorrect airlineCode

Repeated or malformed JSON objects

Incorrect mapping between airlineCode → logo filename

This caused logos to break.
The JSON was cleaned and standardized, so logos now load correctly.

## Assumptions Made
Flight data is static and loaded from flights.json (no API needed).
LocalStorage is enough for storing recent searches.
No authentication or backend required.
Modern browsers only (Chrome/Edge/Firefox).
Icon library used: lucide-react.

##Tradeoffs

Used simple React state instead of Redux to keep the solution readable.

Styling kept minimal and custom instead of using heavy UI frameworks.

Mock data instead of dynamic API to keep the focus on UI behaviour.

Responsive layout implemented lightly due to assignment time constraints.
A ZIP-ready README.md file formatted for GitHub.
