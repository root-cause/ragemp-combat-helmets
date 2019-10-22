let helmetData = null;
let animTimer = null;

function loadAnimDict(animDict) {
    mp.game.streaming.requestAnimDict(animDict);

    return new Promise((resolve) => {
        const timer = setInterval(() => {
            if (mp.game.streaming.hasAnimDictLoaded(animDict)) {
                clearInterval(timer);
                resolve();
            }
        }, 50);
    });
}

// Load anim dictionaries
const animDicts = [
    "anim@mp_helmets@on_foot",
    "anim@mp_helmets@on_bike@chopper",
    "anim@mp_helmets@on_bike@dirt",
    "anim@mp_helmets@on_bike@policeb",
    "anim@mp_helmets@on_bike@quad",
    "anim@mp_helmets@on_bike@scooter",
    "anim@mp_helmets@on_bike@sports"
];

for (const dict of animDicts) {
    loadAnimDict(dict);
}

// Vehicle animation dictionaries (Credits to TomGrobbe - https://github.com/TomGrobbe)
const vehAnimDictName = {
    [mp.game.joaat("akuma")]: "sports",
    [mp.game.joaat("avarus")]: "chopper",
    [mp.game.joaat("bagger")]: "policeb",
    [mp.game.joaat("bati")]: "sports",
    [mp.game.joaat("bati2")]: "sports",
    [mp.game.joaat("bf400")]: "dirt",
    [mp.game.joaat("carbonrs")]: "sports",
    [mp.game.joaat("cliffhanger")]: "dirt",
    [mp.game.joaat("daemon")]: "policeb",
    [mp.game.joaat("daemon2")]: "policeb",
    [mp.game.joaat("defiler")]: "sports",
    [mp.game.joaat("deathbike")]: "dirt",
    [mp.game.joaat("deathbike2")]: "dirt",
    [mp.game.joaat("deathbike3")]: "dirt",
    [mp.game.joaat("diablous")]: "policeb",
    [mp.game.joaat("diablous2")]: "sports",
    [mp.game.joaat("double")]: "sports",
    [mp.game.joaat("enduro")]: "dirt",
    [mp.game.joaat("esskey")]: "dirt",
    [mp.game.joaat("faggio")]: "scooter",
    [mp.game.joaat("faggio2")]: "scooter",
    [mp.game.joaat("faggio3")]: "scooter",
    [mp.game.joaat("fcr")]: "sports",
    [mp.game.joaat("fcr2")]: "sports",
    [mp.game.joaat("gargoyle")]: "policeb",
    [mp.game.joaat("hakuchou")]: "sports",
    [mp.game.joaat("hakuchou2")]: "sports",
    [mp.game.joaat("hexer")]: "policeb",
    [mp.game.joaat("innovation")]: "policeb",
    [mp.game.joaat("lectro")]: "sports",
    [mp.game.joaat("manchez")]: "dirt",
    [mp.game.joaat("nemesis")]: "sports",
    [mp.game.joaat("nightblade")]: "policeb",
    [mp.game.joaat("oppressor")]: "sports",
    [mp.game.joaat("oppressor2")]: "sports",
    [mp.game.joaat("pcj")]: "sports",
    [mp.game.joaat("policeb")]: "policeb",
    [mp.game.joaat("ruffian")]: "sports",
    [mp.game.joaat("rrocket")]: "policeb",
    [mp.game.joaat("sanchez")]: "dirt",
    [mp.game.joaat("sanchez2")]: "dirt",
    [mp.game.joaat("sanctus")]: "chopper",
    [mp.game.joaat("shotaro")]: "sports",
    [mp.game.joaat("sovereign")]: "policeb",
    [mp.game.joaat("thrust")]: "policeb",
    [mp.game.joaat("vader")]: "sports",
    [mp.game.joaat("vindicator")]: "policeb",
    [mp.game.joaat("vortex")]: "sports",
    [mp.game.joaat("wolfsbane")]: "policeb",
    [mp.game.joaat("zombiea")]: "chopper",
    [mp.game.joaat("zombieb")]: "chopper"
};

// Events
mp.events.add("combatHelmets:receiveData", (data) => {
    helmetData = data;
});

mp.keys.bind(0x79 /* F10 */, false, () => {
    const localPlayer = mp.players.local;

    const currentHat = localPlayer.getPropIndex(0);
    if (animTimer !== null || currentHat === -1 || mp.game.player.isFreeAiming() || localPlayer.isClimbing() || localPlayer.isDead()) {
        return;
    }

    const helmets = helmetData[ localPlayer.model ];
    if (helmets === undefined) {
        return;
    }

    let nextHat;
    let animDict = "anim@mp_helmets@on_foot";
    let animName = "visor_up";
    let helmetType = "none";

    if (helmets[currentHat]) {
        // Find visor down model
        nextHat = helmets[currentHat].closed;
        helmetType = helmets[currentHat].type;
        animName = `${helmets[currentHat].anim}_down`;
    } else {
        // Find visor up model
        nextHat = Object.keys(helmets).find(h => helmets[h].closed === currentHat);

        if (helmets[nextHat]) {
            animName = `${helmets[nextHat].anim}_up`;
            helmetType = `clear_${helmets[nextHat].type}`;
        }
    }

    if (nextHat === undefined) {
        return;
    }

    const vehicle = localPlayer.vehicle;
    if (vehicle) {
        if (animName.includes("goggles")) {
            return;
        }

        if (mp.game.vehicle.isThisModelAQuadbike(vehicle.model)) {
            animDict = "anim@mp_helmets@on_bike@quad";
        } else if (vehAnimDictName[vehicle.model]) {
            animDict = `anim@mp_helmets@on_bike@${vehAnimDictName[vehicle.model]}`;
        } else {
            return;
        }
    }

    localPlayer.taskPlayAnim(animDict, animName, 8.0, -8.0, -1, 48, 0.0, false, false, false);

    animTimer = setInterval(() => {
        if (localPlayer.getAnimCurrentTime(animDict, animName) >= 0.46) {
            switch (helmetType) {
                case "nightvision":
                    mp.game.graphics.setNightvision(true);
                break;

                case "clear_nightvision":
                    mp.game.graphics.setNightvision(false);
                break;

                case "thermal":
                    mp.game.graphics.setSeethrough(true);
                break;

                case "clear_thermal":
                    mp.game.graphics.setSeethrough(false);
                break;
            }

            mp.events.callRemote("combatHelmets:update", Number(nextHat));

            clearInterval(animTimer);
            animTimer = null;
        }
    }, 50);
});