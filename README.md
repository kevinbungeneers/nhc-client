# Niko Home Control Client
Niko Home Control Client or NHC Client for short, allows you to interface with your Home Control installation.

The following features are or will be supported:
- [x] Switching on and off lights
- [ ] Controlling motor-controlled applications (Roller blinds, curtains, garage door)
- [ ] Access to video feed from doorbell

## Requirements
- Niko Home Control API v1.19
- Niko Home Control v1.10
- Node >= 7.3.0

## Installation
```bash
npm install nhc-client --save
```

## Usage
Niko's Home Control installation consists of three basic elements: an input, an output and an action.
The input could be a sensor or a switch and the output could be the light in your bedroom. The action links the two together: as soon as the input starts the action, the state of your output changes.

The client follows this idea: the actions are loaded from the installation and you can code a virtual input that triggers an action by calling its `execute()` function.

### Example
The following example shows you how to load all the available actions and how to execute a certain one to switch on/off a light:

```js
const HomeControlClient  = require('nhc-client').HomeControlClient;

var client = new HomeControlClient();
client.connect("192.168.0.226");

client.on('connect', function() {
  client.listActions(function(actions) {
    actions.forEach(function(action) {
        if (action.id == 43) {
          action.execute();
        }
    });
  });
});
```

## Notes
Niko does not provide an API or any official documentation so this client has been reverse engineered, which might mean this project will never be 100% feature-complete. Furthermore, I'm limited to develop the features I have access to so I can't build in support for every possible module Niko offers. If you can contribute to remedy this, please do!
