const helmetData = require("./helmetData");

mp.events.add("playerReady", (player) => {
    player.call("combatHelmets:receiveData", [ helmetData ]);
});

mp.events.add("combatHelmets:update", (player, newDrawable) => {
    if (!Number.isInteger(newDrawable)) {
        return;
    }

    const { drawable, texture } = player.getProp(0);
    player.setProp(0, newDrawable, texture);
});