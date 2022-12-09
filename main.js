import Phaser, { Game } from "phaser";
let started = false;
let starsText;
let scoreText;
var healthText;
var fuelText;
var teleportText;
let sspeed;
let rocket1;
let cursors;
let rotateValue;
let x;
let y;
let spaceKey;
let xKey;
let zKey;
let rKey;
var gamepad;
let meteors;
let stars;
let score = 0;
let time = 61;
let count;
let starCount;
let meteorRotateValue = 0.03;
let speed;
let mspeed;
let displaySpeed;
let timeLeft = 0;

function rng(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
// initial rotation on loading screen
// rotateValue = rng(-10, 10) * 0.005;
rotateValue = 0;

// user experience
let debugMode = false;
let baseSensitivity = 0.89;
let leftStickSensitivity = 0.4;
let meteorQuantity = 0.8;
let quantityMultiplier = 1;

let starQuant = rng(10 * quantityMultiplier, 15 * quantityMultiplier);

var config = {
  type: Phaser.AUTO,
  input: {
    gamepad: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    parent: "root",
    // autoCenter: Phaser.Scale.CENTER_BOTH,
    // width: 1540,
    // height: 790,
    width: window.innerWidth,
    height: window.innerHeight,
  },
};

new Game(config);

function preload() {
  this.load.image("background", "bg.jpeg");
  this.load.image("rocket1", "rocket.png");
  this.load.image("meteor", "meteor.png");
  this.load.image("meteorr", "meteorr.png");
  this.load.image("star", "star.png");
  this.load.atlas("rocketsprite", "rocket-sprite.png", "rocket-sprite.json");
  cursors = this.input.keyboard.createCursorKeys();
}

function create() {
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
  zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
  rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

  const screenCenterX =
    this.cameras.main.worldView.x + this.cameras.main.width / 2;
  const screenCenterY =
    this.cameras.main.worldView.y + this.cameras.main.height / 2;
  const bg = this.add
    .image(screenCenterX, screenCenterY, "background")
    .setOrigin(0.5)
    .setScale(1);

  this.anims.create({
    key: "default",
    frames: this.anims.generateFrameNames("rocketsprite", {
      prefix: "firing",
      end: 0,
      zeroPad: 3,
    }),
    repeat: -1,
  });

  this.anims.create({
    key: "firing",
    frames: this.anims.generateFrameNames("rocketsprite", {
      prefix: "firing",
      start: 0,
      end: 7,
      zeroPad: 3,
    }),
    repeat: 0,
  });

  rocket1 = this.physics.add
    .sprite(screenCenterX, screenCenterY, "rocket1")
    .setScale(0.35);
  rocket1.Health = 100000;
  rocket1.Fuel = 100000;
  rocket1.body.setSize(90, 202);

  // rocket1.body.setMaxSpeed(800);
  // rocket1.setCollideWorldBounds(true);
  // rocket11 = this.physics.add.sprite(320, 500, "rocket").setScale(0.4);
  // rocket1.setCollideWorldBounds(true);
  // rocket1.body.setSize(25, 32);
  // rocket1.setBounce(1);
  // rocket1.body.setMaxSpeed(400);

  this.text = this.add.text(
    screenCenterX - 430,
    screenCenterY - 90,
    "Press any key on controller or keyboard to begin...",
    { font: "30px Audiowide" }
  );
  this.text.setTint(0xff0fff, 0x9effff, 0xff0fff, 0x9effff);

  healthText = this.add
    .text(1675, 20, "Health: 100.00%", {
      font: "20px Audiowide",
      // fill: "#FFFFFF",
      fill: " #00FF00",
    })
    .setOrigin(1, 0);

  fuelText = this.add
    .text(1675, 80, "Fuel: 100.00%", {
      font: "20px Audiowide",
      // fill: "#FFFFFF",
      fill: " #00FF00",
    })
    .setOrigin(1, 0);

  scoreText = this.add
    .text(1675, 250, "Score: 0", {
      // .text(530, 20, "Score: 0", {
      font: "20px Audiowide",
      // fill: "#FFFFFF",
      // fill: " #00FF00",
    })
    .setOrigin(1, 0);

  starsText = this.add
    .text(
      1675,
      200,
      `Stars Left: ${starQuant}`,
      // `Stars Left: ${stars.getChildren().length}`,
      {
        font: "20px Audiowide",
      }
    )
    .setOrigin(1, 0);

  teleportText = this.add
    .text(1675, 140, `Teleporter is ready: 100%`, {
      // fill: " #00FF00",
      fill: " #00FF00",
      font: "20px Audiowide",
    })
    .setOrigin(1, 0);

  this.input.keyboard.on(
    "keydown",
    function (keyboard, button, index) {
      // text.setText("Using keyboard, refresh to use controller");
      this.text.setText("");
      started = true;
      rotateValue /= 2;
    },
    this
  );

  this.input.gamepad.once(
    "down",
    function (pad, button, index) {
      // text.setText("Using controller, refresh to use keyboard");
      this.text.setText("");
      gamepad = pad;
      rotateValue /= 2;
      started = true;
    },
    this
  );

  meteors = this.physics.add.group();

  function createMeteors(key, q, xCord, yCord) {
    meteors.createMultiple({
      classType: Phaser.Physics.Arcade.Sprite,
      quantity: q * meteorQuantity,
      key: key,
      active: true,
      setXY: {
        x: rng(xCord - 50, xCord + 50),
        y: rng(yCord - 50, xCord + 50),
        // x: xCord,
        // y: yCord,
        stepX: 0,
        stepY: 0,
      },
    });
  }
  createMeteors("meteor", 10, 1500, 0);
  createMeteors("meteor", 10, 0, 1800);
  createMeteors("meteor", 10, 0, 1400);
  createMeteors("meteor", 10, 10, 10);

  meteors.getChildren().forEach((meteor) => {
    meteor.setBounce(rng(1, 10) * 0.1).setScale(rng(4, 13) * 0.1);
    meteor.rotation = rng(1, 100);
    meteor.body
      .setVelocity(rng(-120, 120), rng(-120, 120))
      .setMaxSpeed(1000)
      .setSize(50, 50);
    // meteor.body.setVelocity(rng(-60, 60), rng(-60, 60));
    // meteor.setCollideWorldBounds(true);
    this.physics.add.collider(
      meteor,
      meteors,
      () => null, //function
      null,
      this
    );
    // meteor.setBounce(1);
  });

  stars = this.physics.add.group();
  stars.createMultiple({
    classType: Phaser.Physics.Arcade.Sprite,
    quantity: starQuant * quantityMultiplier,
    key: "star",
    active: true,
    setXY: {
      x: rng(-500, +500),
      y: rng(-500, +500),
      // x: xCord,
      // y: yCord,
      stepX: 0,
      stepY: 0,
    },
  });

  stars.getChildren().forEach((star) => {
    // meteor.body.setVelocity(rng(-60, 60), rng(-60, 60));
    star.rotation = rng(-100, 100);
    star.setScale(0.1);
    // star.setCollideWorldBounds(true);
    star.body
      .setVelocity(rng(-120, 120), rng(-120, 120))
      .setSize(500, 500)
      .setBounce(1);
    this.physics.add.collider(
      star,
      stars,
      () => null, //function
      null,
      this
    );
    this.physics.add.collider(star, rocket1, () => {
      if (started) {
        rocket1.Fuel += 10;
        score += (star.body.speed + rocket1.body.speed) / 2;
        if (rocket1.Fuel < 0) {
          rocket1.Fuel = 0;
          fuelText.setText(`Fuel: 0.00%`);
          fuelText.setFill("#FF0000");
        } else if (rocket1.Fuel > 100000) {
          rocket1.Fuel = 100000;
        } else if (rocket1.Fuel < 30000) {
          fuelText.setFill("#FF0000");
        } else if (rocket1.Fuel < 50000) {
          fuelText.setFill("#FFA500");
        } else if (rocket1.Fuel < 80000) {
          fuelText.setFill("#FFFF00");
        }
        fuelText.setText(`Fuel: ${(rocket1.Fuel / 1000).toFixed(2)}%`);
        star.destroy();
        starsText.setText(`Stars Left: ${stars.getChildren().length}`);
      }
    });
  });

  //take damage
  this.physics.add.collider(rocket1, meteors, () => {
    rotateValue += rng(-5, 5) * 0.007;
    score -= 50;
    if (started) {
      if (rocket1.body.speed > 500) {
        rocket1.Health -= Math.abs(rocket1.body.speed) * 4.4;
      } else {
        rocket1.Health -= Math.abs(rocket1.body.speed) * 8.4;
      }
      if (rocket1.Health < 0) {
        rocket1.Health = 0;
        healthText.setText(`Health: 0.00%`);
        healthText.setFill("#FF0000");
      } else if (rocket1.Health < 30000) {
        healthText.setFill("#FF0000");
      } else if (rocket1.Health < 50000) {
        healthText.setFill("#FFA500");
      } else if (rocket1.Health < 80000) {
        healthText.setFill("#FFFF00");
      }
      healthText.setText(`Health: ${(rocket1.Health / 1000).toFixed(2)}%`);
    }
  });

  // this.physics.add.collider(meteors, rocket1, () => {
  //   console.log("collision1");
  //   rotateValue += rng(-5, 5) * 0.01;
  //   rocket1.Health -= Math.abs(rocket1.body.speed) * 8;
  //   if (rocket1.Health < 0) {
  //     rocket1.Health = 0;
  //   }
  //   healthText.setText(`Health: ${(rocket1.Health / 1000).toFixed(2)}%`);
  // });
  // rocket1 = this.physics.add.sprite(520, 500, "rocket1").setScale(0.4);
  // health = this.add.text(10, 10, "", { font: "16px Courier", fill: "#00ff00" });
}

class PhysicsEngine {
  // main thruster
  fireBooster(strength = 1) {
    if (strength > 3) {
      rocket1.Fuel -= 32 * strength;
      fuelText.setText(`Fuel: ${(rocket1.Fuel / 1000).toFixed(2)}%`);
    } else {
      rocket1.Fuel -= 0.7 * strength;
      fuelText.setText(`Fuel: ${(rocket1.Fuel / 1000).toFixed(2)}%`);
      fuelText.setText(`Fuel: ${(rocket1.Fuel / 1000).toFixed(2)}%`);
    }
    if (rocket1.Fuel < 0) {
      rocket1.Fuel = 0;
      fuelText.setText(`Fuel: 0.00%`);
      fuelText.setFill("#FF0000");
    } else if (rocket1.Fuel < 30000) {
      fuelText.setFill("#FF0000");
    } else if (rocket1.Fuel < 50000) {
      fuelText.setFill("#FFA500");
    } else if (rocket1.Fuel < 80000) {
      fuelText.setFill("#FFFF00");
    }
    if (debugMode) {
      // console.log(logSpeed(rocket1.body.speed));
      console.log("resolvedVectorX: ", rocket1.body.velocity.x);
      console.log("resolvedVectorY: ", rocket1.body.velocity.y);
    }
    rocket1.anims.play("firing", true);
    speed = rocket1.body.velocity.x * rocket1.body.velocity.y;
    x = 2 * Math.sin(rocket1.rotation);
    y = -1 * 2 * Math.cos(rocket1.rotation);
    rocket1.setVelocityX(rocket1.body.velocity.x + x * strength * 2);
    rocket1.setVelocityY(rocket1.body.velocity.y + y * strength * 2);
  }

  // side booster
  turnRight(strength = 1) {
    fuelText.setText(`Fuel: ${(rocket1.Fuel / 1000).toFixed(2)}%`);
    if (rocket1.Fuel < 0) {
      rocket1.Fuel = 0;
      fuelText.setText(`Fuel: 0.00%`);
      fuelText.setFill("#FF0000");
    } else if (rocket1.Fuel < 30000) {
      fuelText.setFill("#FF0000");
    } else if (rocket1.Fuel < 50000) {
      fuelText.setFill("#FFA500");
    } else if (rocket1.Fuel < 80000) {
      fuelText.setFill("#FFFF00");
    }
    // if (rotateValue < -0.02 || rocket1.body.speed > 400) {
    //   rotateValue += 0.0029 * strength;
    // }
    // rotateValue += 0.0014 * strength;
    rocket1.rotation += 0.04;
    rotateValue = 0.008 * strength;
  }

  turnLeft(strength = 1) {
    fuelText.setText(`Fuel: ${(rocket1.Fuel / 1000).toFixed(2)}%`);
    if (rocket1.Fuel < 0) {
      rocket1.Fuel = 0;
      fuelText.setText(`Fuel: 0.00%`);
      fuelText.setFill("#FF0000");
    } else if (rocket1.Fuel < 30000) {
      fuelText.setFill("#FF0000");
    } else if (rocket1.Fuel < 50000) {
      fuelText.setFill("#FFA500");
    } else if (rocket1.Fuel < 80000) {
      fuelText.setFill("#FFFF00");
    }
    // if (rotateValue > 0.02) {
    //   if (strength != 1) {
    //     rotateValue -= 0.0019 * strength;
    //   } else {
    //     rotateValue -= 0.0019;
    //   }
    // }
    // rotateValue += -0.0014 * strength;
    rotateValue = -0.008 * strength;
    rocket1.rotation -= 0.04;
  }

  default() {
    rocket1.anims.play("default", true);
  }
}

const Rocket1PhysicsEngine = new PhysicsEngine();

function logSpeed(speed) {
  displaySpeed = "";
  if (speed >= 0 && speed < 55) {
    displaySpeed = `Speed: ${speed.toFixed(2)}`;
  } else if (speed > 55 && speed < 120) {
    displaySpeed = "Mach 1";
  } else if (speed > 120 && speed < 200) {
    displaySpeed = `Speed: ${speed.toFixed(2)}`;
  } else if (speed > 200 && speed < 400) {
    displaySpeed = "Speed: Mach 2";
  } else if (speed > 400 && speed < 500) {
    displaySpeed = "Speed: Elon would be proud 🥲";
  } else {
    displaySpeed = "Speed: Supersonic!";
  }
  return displaySpeed;
}

function update() {
  if (started) {
    if (time < 65) {
      time += 0.07;
    }
    score += 0.0008;
    if (score < 0) {
      score = 0;
    }
    scoreText.setText(`Score: ${score.toFixed(0)}`);
    if (time < 60) {
      teleportText.setFill(" #FF0000");
      teleportText.setText(
        `Teleporter is recharging: ${(time / 0.6).toFixed(0)}%`
      );
    } else {
      teleportText.setText(`Teleporter is ready: 100%`);
      teleportText.setFill(" #00FF00");
    }
  }
  rocket1.rotation += rotateValue;

  this.physics.world.wrap(rocket1, 40);
  this.physics.world.wrap(meteors, 200);
  this.physics.world.wrap(stars, 300);

  // health.setText(
  //   "Health: " + ((rocket1.Health / 100000) * 100).toFixed(4),
  //   "%"
  // );
  // console.log(((rocket1.Health / 100000) * 100).toFixed(0));

  count = 0;
  meteors.getChildren().forEach((meteor) => {
    count += 1;
    mspeed =
      meteors.getChildren()[count - 1].body.velocity.x +
      meteors.getChildren()[count - 1].body.velocity.y;
    if (meteors.getChildren()[count - 1].body.speed > 200) {
      meteors.getChildren()[count - 1].rotation += 0.0004 * mspeed;
    } else {
      meteors.getChildren()[count - 1].rotation -= 0.0004 * mspeed;
    }
  });
  starCount = 0;
  stars.getChildren().forEach((star) => {
    starCount += 1;
    sspeed =
      stars.getChildren()[starCount - 1].body.velocity.x +
      stars.getChildren()[starCount - 1].body.velocity.y;
    if (stars.getChildren()[starCount - 1].body.velocity.y > 0) {
      stars.getChildren()[starCount - 1].rotation += 0.0006 * sspeed;
    } else {
      stars.getChildren()[starCount - 1].rotation -= 0.0006 * sspeed;
    }
  });

  if (gamepad) {
    if (gamepad.left) {
      Rocket1PhysicsEngine.turnLeft();
    }

    if (gamepad.leftStick) {
      // Rocket1PhysicsEngine.turnLeft( leftStickSensitivity * -1 * gamepad.leftStick.x * 1.9);
      if (gamepad.leftStick.angle() != 0) {
        rotateValue = 0;
        rocket1.rotation = gamepad.leftStick.angle() + Math.PI / 2;
      }
    }

    if (gamepad.B) {
      location.reload();
    }

    // teleport
    if (gamepad.X) {
      if (time.toFixed(0) > 60) {
        rocket1.setPosition(rng(0, 1500), rng(0, 1500));
        time = 0;
      }
    }

    if (gamepad.right) {
      Rocket1PhysicsEngine.turnRight();
    }

    //thrust
    if (gamepad.R2 > 0 || gamepad.Y) {
      if (gamepad.Y) {
        Rocket1PhysicsEngine.fireBooster(7.5);
      } else if (gamepad.R2 > 0) {
        Rocket1PhysicsEngine.fireBooster(1.5 * gamepad.R2 * baseSensitivity);
      }
    } else {
      rocket1.anims.play("default", true);
    }

    // keyboard
  } else {
    if (cursors.right.isDown) {
      Rocket1PhysicsEngine.turnRight();
    }
    if (cursors.left.isDown) {
      Rocket1PhysicsEngine.turnLeft();
    }
    //shoot
    if (spaceKey.isDown) {
      null;
    }

    // teleport
    if (zKey.isDown) {
      if (time.toFixed(0) > 60) {
        rocket1.setPosition(rng(0, 1500), rng(0, 1500));
        time = 0;
      }
    }
    if (rKey.isDown) {
      location.reload();
    }
    if (xKey.isDown || cursors.up.isDown) {
      if (xKey.isDown) {
        Rocket1PhysicsEngine.fireBooster(7.5);
      } else if (cursors.up.isDown) {
        Rocket1PhysicsEngine.fireBooster(1);
      }
    } else {
      Rocket1PhysicsEngine.default();
    }
  }
}
