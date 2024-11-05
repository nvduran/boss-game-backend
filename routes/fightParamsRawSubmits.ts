const express = require("express");
const router = express.Router();
const FightParamsRawSubmits = require("../models/FightParamsRawSubmits");

router.get("/", async (req: any, res: any) => {
    try {
        // return basic message
        res.send("fight-params-raw-submits");
    } catch (err) {
        res.json({ message: err });
    }
});

router.post("/", async (req: any, res: any) => {
    const fightParamsRawSubmits = new FightParamsRawSubmits({
        danger_circle: {
            size: req.body.danger_circle.size,
            spawn_interval: req.body.danger_circle.spawn_interval,
            despawn_interval: req.body.danger_circle.despawn_interval,
            warning_time: req.body.danger_circle.warning_time,
        },
        boss: {
            health: req.body.boss.health,
            shield: req.body.boss.shield,
        },
        player_projectile_cooldown: req.body.player_projectile_cooldown,
    });

    try {
        const savedFightParamsRawSubmits = await fightParamsRawSubmits.save();
        res.json(savedFightParamsRawSubmits);
    } catch (err) {
        res.json({ message: err });
    }
});

export default router;