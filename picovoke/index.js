// raspi version
'use strict';
require('json-tryparse');
// const Gpio = require('onoff').Gpio;
const Gpio = require('gpio');
var mqtt = require('mqtt')
const devtopic = '#';
const mqttHost = '127.0.0.1';

// // Array of GPIO Objects onoff
// var mqttmsg = new Array(8);
// mqttmsg[0] = new Gpio(0, 'out');
// mqttmsg[1] = new Gpio(1, 'out');
// mqttmsg[2] = new Gpio(2, 'out');
// mqttmsg[3] = new Gpio(3, 'out');
// mqttmsg[4] = new Gpio(4, 'out');
// mqttmsg[5] = new Gpio(5, 'out');
// mqttmsg[6] = new Gpio(6, 'out');
// mqttmsg[7] = new Gpio(7, 'out');

// Array of GPIO Objects onoff
var mqttmsg = new Array(8);
mqttmsg[0] = Gpio.export(0, {
  direction: Gpio.DIRECTION.OUT,
  intervall: 100,
  ready: function () {
  }
});
mqttmsg[1] = Gpio.export(1, {
  direction: Gpio.DIRECTION.OUT,
  intervall: 100,
  ready: function () {
  }
});
mqttmsg[2] = Gpio.export(2, {
  direction: Gpio.DIRECTION.OUT,
  intervall: 100,
  ready: function () {
  }
});
mqttmsg[3] = Gpio.export(3, {
  direction: Gpio.DIRECTION.OUT,
  intervall: 100,
  ready: function () {
  }
});
mqttmsg[4] = Gpio.export(4, {
  direction: Gpio.DIRECTION.OUT,
  intervall: 100,
  ready: function () {
  }
});
mqttmsg[5] = Gpio.export(5, {
  direction: Gpio.DIRECTION.OUT,
  intervall: 100,
  ready: function () {
  }
});
mqttmsg[6] = Gpio.export(6, {
  direction: Gpio.DIRECTION.OUT,
  intervall: 100,
  ready: function () {
  }
});
mqttmsg[7] = Gpio.export(7, {
  direction: Gpio.DIRECTION.OUT,
  intervall: 100,
  ready: function () {
  }
});

const parseJsonAsync = (message) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(JSON.tryParse(message))
    });
  });
}


// MQTT Object
var client  = mqtt.connect('mqtt://'+ mqttHost)

client.on('connect', function () {
  client.subscribe('presence', function (err) {
    if (!err) {
      client.publish('presence', 'Hello gpio GW')
    }
  })
})
client.subscribe('picovoke/'+devtopic)

client.on('message', function (topic, message) {
  // console.log("MQTT: %o", message);
  // parseJsonAsync(message.toString()).then(msgString => console.log("Dev: %s Msg.: %s", msgString.friendlyName, msgString.action))
  const msg = JSON.tryParse(message.toString());
  var dev = new Array(2);
  var cmd = new Array(3);
  var val = new Array(3);
  var cmdToSend = new Array(8);

  if (msg.action) {
    const device = JSON.tryParse(msg.device);
    if (device) {
      if (device.friendlyName == 'cube1') dev = [0, 0];
      else dev = [0, 1];

      switch (msg.action) {
        case 'slide':
          parsedValue(msg.action, msg.side, function (values) {
            val = values;
            cmd = [0, 0, 0];
          })
          break;
        case 'flip90':
          parsedValue(msg.action, msg.to_side, function (values) {
            val = values;
            cmd = [0, 0, 1];
          })
          break;
        case 'flip180':
          parsedValue(msg.action, msg.side, function (values) {
            val = values;
            cmd = [0, 1, 0];
          })
          break;
        case 'rotate_right':
          parsedValue(msg.action, msg.angle, function (values) {
            val = values;
            cmd = [0, 1, 1];
          })
          break;
        case 'rotate_left':
          parsedValue(msg.action, msg.angle, function (values) {
            val = values;
            cmd = [1, 0, 0];
          })
          break;
        case 'tap':
          parsedValue(msg.action, msg.side, function (values) {
            val = values;
            cmd = [1, 0, 1];
          })
          break;
        case 'shake':
          cmd = [1, 1, 0];
          val = [0, 0, 0];
          break;
        case 'fall':
          cmd = [1, 1, 1];
          val = [0, 0, 0];
          break;
        case 'wakeup':
          cmd = [0, 0, 0];
          val = [1, 1, 1];
          break;
        default:
          cmd = [0, 0, 0];
          val = [0, 0, 0];
          break;
      }

      // console.log("Dev.: %o Action: %o Value: %o", dev, cmd, val);
      var cmdToSend = dev.concat(cmd, val);
      writeGPIO(cmdToSend);
    }
  }
})


const parsedValue = (myAction, myMessage, callback) => {
  var returnMsg = new Array(3);

  if (myAction == 'slide' || myAction == 'flip90' || myAction == 'flip180' || myAction == 'tap') {
    switch (myMessage) {
      case 0:
        returnMsg = [0, 0, 0];
        break;
      case 1:
        returnMsg = [0, 0, 1];
        break;
      case 2:
        returnMsg = [0, 1, 0];
        break;
      case 3:
        returnMsg = [0, 1, 1];
        break;
      case 4:
        returnMsg = [1, 0, 0];
        break;
      case 5:
        returnMsg = [1, 0, 1];
        break;
      default:
        returnMsg = [0, 0, 0];
        break;
    }
  } else if (myAction == 'rotate_left') {
    returnMsg = [0, 0, 0];
  } else if (myAction == 'rotate_right') {
    returnMsg = [0, 0, 1];
  }
  callback(returnMsg);
}

function makeCommand(strDev, strCmd, strVal) {
  var dev = new Array(2);
  // bit 0,1 = dev
  // 0,0 = dev0
  // 0,1 = dev1
  // 1,0 = dev2
  // 1,1 = dev3
  var cmd = new Array(3);
  // bit 2,3,4 = cmd
  // 0,0,0 = slide
  // 0,0,1 = flip90
  // 0,1,0 = flip180
  // 0,1,1 = rotRight
  // 1,0,0 = rotLeft
  // 1,0,1 = tap
  // 1,1,0 = shake
  // 1,1,1 = fall
  var val = new Array(3);
  // bit 5,6,7 = val
  // slide/flip90/flip180 0,0,0 = to side 0 
  // slide/flip90/flip180 0,0,1 = to side 1 
  // slide/flip90/flip180 0,1,0 = to side 2
  // slide/flip90/flip180 0,1,1 = to side 3
  // slide/flip90/flip180 1,0,0 = to side 4
  // slide/flip90/flip180 1,0,1 = to side 5
  // rotRight / rotLeft 0,0,0 = angle 0
  // rotRight / rotLeft 0,0,1 = angle 60
  // rotRight / rotLeft 0,1,0 = angle 120
  // rotRight / rotLeft 0,1,1 = angle 180
  // rotRight / rotLeft 1,0,0 = angle 240
  // rotRight / rotLeft 1,0,1 = angle 300
  // rotRight / rotLeft 1,1,0 = angle 360
  switch (strDev) {
    case "cube1":
      dev = [0, 0];
      break;
    case "cube2":
      dev = [0, 1];
      break;
    default:
      dev = [0, 0];
      break;
  }

  switch (strCmd) {
    case "slide":
      cmd = [0, 0, 0];
      break;
    case "flip90":
      cmd = [0, 0, 1];
      break;
    case "flip180":
      cmd = [0, 1, 0];
      break;
    case "rotRight":
      cmd = [0, 1, 1];
      break;
    case "rotLeft":
      cmd = [1, 0, 0];
      break;
    case "tap":
      cmd = [1, 0, 1];
      break;
    case "shake":
      cmd = [1, 1, 0];
      break;
    case "fall":
      cmd = [1, 1, 1];
      break;
    default:
      cmd = [0, 0, 0];
      break;
  }

  switch (strVal) {
    case "side0":
      val = [0, 0, 0];
      break;
    case "side1":
      val = [0, 0, 1];
      break;
    case "side2":
      val = [0, 1, 0];
      break;
    case "side3":
      val = [0, 1, 1];
      break;
    case "side4":
      val = [1, 0, 0];
      break;
    case "side5":
      val = [1, 0, 1];
      break;
    case "side6":
      val = [1, 1, 0];
      break;
    // case "angle0":
    //   val = [0, 0, 0];
    //   break;
    // case "angle60":
    //   val = [0, 0, 1];
    //   break;
    // case "angle120":
    //   val = [0, 1, 0];
    //   break;
    // case "angle180":
    //   val = [0, 1, 1];
    //   break;
    // case "angle240":
    //   val = [1, 0, 0];
    //   break;
    // case "angle300":
    //   val = [1, 0, 1];
    //   break;
    // case "angle360":
    //   val = [1, 1, 0];
    //   break;
    default:
      val = [0, 0, 0];
      break;
  }
  var msg = dev.concat(cmd, val);
  return msg;
}

function writeGPIO(msg) {
  console.log(msg);
  for (var pin = 0; pin < 8; pin++) {
    if (msg[pin] == 1) {
      mqttmsg[pin].set(
        console.log(mqttmsg[pin].value));
    }
    else {
      mqttmsg[pin].set(0,
        console.log(mqttmsg[pin].value));
    }
    // mqttmsg[pin].writeSync(msg[pin]);
  }
  
}

function exit() {
  p8state.unexport();
  mqttmsg0.unexport();
  mqttmsg1.unexport();
  mqttmsg2.unexport();
  mqttmsg3.unexport();
  mqttmsg4.unexport();
  mqttmsg5.unexport();
  mqttmsg6.unexport();
  mqttmsg7.unexport();
  process.exit();
}

process.on('SIGINT', exit);
