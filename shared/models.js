const { BufferSchema, Model } = require('@geckos.io/typed-array-buffer-schema');
const { uint8, uint32, int16, uint64, string8 } = require('@geckos.io/typed-array-buffer-schema');

const playerSchema = BufferSchema.schema('player', {
    id: uint8,
    x: { type: uint32, digits: 2 },
    y: { type: uint32, digits: 2 },
    angle: { type: int16, digits: 2 },
    kills: uint8,
    impulsed: uint8
})

const otherPlayersSchema = BufferSchema.schema('otherPlayers', {
    id: uint32,
    name: { type: string8, length: 8 },
    x: { type: uint32, digits: 2 },
    y: { type: uint32, digits: 2 },
    angle: { type: int16, digits: 2 },
    kills: uint8
})

const bulletSchema = BufferSchema.schema('bullet', {
    id: { type: string8, length: 10 },
    x: { type: uint32, digits: 2 },
    y: { type: uint32, digits: 2 },
    angle: { type: int16, digits: 2 },
    r: { type: int16, digits: 2 },
    ownerId: uint32
})

const snapshotSchema = BufferSchema.schema('snapshot', {
    id: { type: string8, length: 6 },
    time: uint64,
    state: {
        me: [playerSchema],
        otherPlayers: [otherPlayersSchema],
        bullets: [bulletSchema]
    }
})

const mainModel = new Model(snapshotSchema);
module.exports = mainModel;