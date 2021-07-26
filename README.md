# MSL Notebook
MSL Notebook is a TypeScript application built with web components based on Lit. It uses the MSL.js Library to connect with WebSocket servers and send and receive asynchronous messages using a "harness" which allows them to be tracked and kept in order as though they were synchronous.

# Run Requirements
1. A webserver that can transpile TS. I recommend [Vite](https://vitejs.dev/).
2. An MSL engine to test MSL expressions. 

# Dev Requirements
See [full instructions](https://nebula.mimix.io/en/msl-notebook/program-flow).

MSL Notebook uses the [MSL.js](https://nebula.mimix.io/en/msl-js/program-flow) library to provide message sychronicity and control for websockets. MSL.js has no dependencies and can also be used separately from MSL Notebook.
