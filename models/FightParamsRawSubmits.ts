const mongoose = require("mongoose");

const FightParamsRawSubmitsSchema = new mongoose.Schema({
        danger_circle: { 
            size: Number,
            spawn_interval: Number,
            despawn_interval: Number,
            warning_time: Number,
            
        },
        boss : {
            health: Number,
            shield: Number,
        },
        player_projectile_cooldown: Number,
        submitter: {
            id: Number,
            name: String,
        },
        created_at: {
            type: Date,
            default: Date.now
        },
        fight_id: Number,
        fight_name: String,

    });

module.exports = mongoose.model("Fight Params Raw Submits", FightParamsRawSubmitsSchema);
