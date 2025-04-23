# LeavesApp

TECHNOLOGIES USED:
## MongoDB: NoSQL database program, uses JSON-like documents with schema.
## Express: 
## Node.js: Server runtime environment - allows JS on backend
## React:

BACKEND APP STRUCTURE
## server.py: The main ENTRY-POINT of the application
## routes: The 'front desk' - groups routes, and DIRECTS them to correct controller
## controllers: A BRIDGE between routes and services - validation - returns https responses
## services: Perform the CORE LOGIC of the app - tranformations, conversions, saves, etc
## schemas: DEFINE SHAPE of incoming/outgoing data - validates frontend requests
## models: the database documents - the ACTUAL OBJECTS